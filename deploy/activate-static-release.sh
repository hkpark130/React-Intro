#!/usr/bin/env bash
set -Eeuo pipefail

readonly RELEASE_ROOT='/home/ec2-user/portfolio-releases'
readonly CODEDEPLOY_ROOT='/home/ec2-user/portfolio-codedeploy'
readonly EXPECTED_RELEASE_FILE="${CODEDEPLOY_ROOT}/expected-release.env"
readonly ACTIVE_RELEASE_FILE="${RELEASE_ROOT}/active-release.env"
readonly SOURCE_ROOT="${CODEDEPLOY_ROOT}/source"
readonly CONTAINER='react-intro'
readonly HTML_ROOT='/usr/share/nginx/html'
readonly SSR_CONTAINER='ssr-notion'
readonly SSR_APP_ROOT='/app'
readonly RAG_UPSTREAM_URL="${RAG_UPSTREAM_URL:-http://172.18.0.1:8001}"

activated=0
backup_dir=''
ssr_activated=0
ssr_backup_dir=''
ssr_before=''
declare -a protected_before=()

fail() {
  printf '%s\n' "deployment safety check failed: $*" >&2
  exit 1
}

[[ "$RAG_UPSTREAM_URL" =~ ^http://[0-9.]+:[0-9]{1,5}$ ]] || fail 'RAG upstream URL is invalid'

read_value() {
  local file="$1" key="$2"
  awk -F= -v expected="$key" '$1 == expected { print substr($0, length($1) + 2); exit }' "$file"
}

read_release_metadata() {
  test -r "$EXPECTED_RELEASE_FILE" || fail 'expected release manifest is missing'
  source_commit="$(read_value "$EXPECTED_RELEASE_FILE" source_commit)"
  expected_source_tree_sha="$(read_value "$EXPECTED_RELEASE_FILE" source_tree_sha256)"
  expected_ssr_manifest_sha="$(read_value "$EXPECTED_RELEASE_FILE" ssr_manifest_sha256)"
  expected_dist_manifest_sha="$(read_value "$EXPECTED_RELEASE_FILE" dist_manifest_sha256)"
  require_rag_health="$(read_value "$EXPECTED_RELEASE_FILE" require_portfolio_rag_health)"
  [[ "$source_commit" =~ ^[0-9a-f]{40}$ ]] || fail 'expected source commit is invalid'
  [[ "$expected_source_tree_sha" =~ ^[0-9a-f]{64}$ ]] || fail 'expected source tree checksum is invalid'
  [[ "$expected_ssr_manifest_sha" =~ ^[0-9a-f]{64}$ ]] || fail 'expected SSR manifest checksum is invalid'
  [[ "$expected_dist_manifest_sha" =~ ^[0-9a-f]{64}$ ]] || fail 'expected dist manifest checksum is invalid'
  [[ "$require_rag_health" == '0' || "$require_rag_health" == '1' ]] || fail 'RAG health requirement is invalid'
  deployment_tag="${DEPLOYMENT_ID:-manual}"
  [[ "$deployment_tag" =~ ^[A-Za-z0-9_-]+$ ]] || fail 'deployment identifier is invalid'

  release_dir="${RELEASE_ROOT}/${source_commit}"
  release_manifest="${release_dir}/release-manifest.env"
  test -d "$release_dir" || fail 'immutable release directory is missing'
  test -r "$release_manifest" || fail 'immutable release manifest is missing'
  test -s "${release_dir}/dist/index.html" || fail 'release index.html is missing'

  [[ "$(read_value "$release_manifest" source_commit)" == "$source_commit" ]] || fail 'release source commit does not match expected commit'
  [[ "$(read_value "$release_manifest" source_tree_sha256)" == "$expected_source_tree_sha" ]] || fail 'release source tree checksum does not match expected checksum'
  [[ "$(read_value "$release_manifest" ssr_manifest_sha256)" == "$expected_ssr_manifest_sha" ]] || fail 'release SSR checksum does not match expected checksum'
  [[ "$(read_value "$release_manifest" dist_manifest_sha256)" == "$expected_dist_manifest_sha" ]] || fail 'release manifest checksum does not match expected checksum'
}

verify_dist_manifest() {
  local actual_manifest
  actual_manifest="$(mktemp)"
  (
    cd "${release_dir}/dist"
    LC_ALL=C find . -type f -print0 | LC_ALL=C sort -z | while IFS= read -r -d '' file; do
      sha256sum "$file"
    done
  ) > "$actual_manifest"
  if ! cmp --silent "${release_dir}/dist-files.sha256" "$actual_manifest"; then
    rm -f "$actual_manifest"
    fail 'dist file manifest differs from uploaded artifact'
  fi
  if [[ "$(sha256sum "$actual_manifest" | awk '{print $1}')" != "$expected_dist_manifest_sha" ]]; then
    rm -f "$actual_manifest"
    fail 'dist file manifest digest differs from expected digest'
  fi
  rm -f "$actual_manifest"
}

verify_ssr_manifest() {
  local actual_manifest
  test -s "${release_dir}/ssr/package.json" || fail 'SSR package manifest is missing'
  test -d "${release_dir}/ssr/src" || fail 'SSR source directory is missing'
  test -d "${release_dir}/ssr/node_modules" || fail 'SSR production dependencies are missing'
  actual_manifest="$(mktemp)"
  (
    cd "${release_dir}/ssr"
    LC_ALL=C find . -type f -print0 | LC_ALL=C sort -z | while IFS= read -r -d '' file; do
      sha256sum "$file"
    done
  ) > "$actual_manifest"
  if ! cmp --silent "${release_dir}/ssr-files.sha256" "$actual_manifest"; then
    rm -f "$actual_manifest"
    fail 'SSR file manifest differs from uploaded artifact'
  fi
  if [[ "$(sha256sum "$actual_manifest" | awk '{print $1}')" != "$expected_ssr_manifest_sha" ]]; then
    rm -f "$actual_manifest"
    fail 'SSR file manifest digest differs from expected digest'
  fi
  rm -f "$actual_manifest"
}

verify_source_tree() {
  local source_manifest source_root_real line expected_hash relative_path source_path resolved_path actual_hash
  source_manifest="${release_dir}/source-files.sha256"
  test -s "$source_manifest" || fail 'release source file manifest is missing'
  source_root_real="$(readlink -f -- "$SOURCE_ROOT")" || fail 'CodeDeploy source directory is missing'

  while IFS= read -r line || [[ -n "$line" ]]; do
    expected_hash="${line%%  *}"
    relative_path="${line#*  }"
    [[ "$expected_hash" =~ ^[0-9a-f]{64}$ ]] || fail 'source file manifest has an invalid checksum'
    [[ "$relative_path" != "$line" && "$relative_path" != /* && "$relative_path" != ../* && "$relative_path" != */../* && "$relative_path" != */.. && "$relative_path" != . ]] || fail 'source file manifest has an unsafe path'
    source_path="${SOURCE_ROOT}/${relative_path}"
    test -f "$source_path" && test ! -L "$source_path" || fail "CodeDeploy source file is missing or is a symlink: ${relative_path}"
    resolved_path="$(readlink -f -- "$source_path")" || fail "CodeDeploy source file cannot be resolved: ${relative_path}"
    [[ "$resolved_path" == "$source_root_real/"* ]] || fail "CodeDeploy source path escapes its root: ${relative_path}"
    actual_hash="$(sha256sum -- "$source_path" | awk '{print $1}')"
    [[ "$actual_hash" == "$expected_hash" ]] || fail "CodeDeploy source file differs from the pinned revision: ${relative_path}"
  done < "$source_manifest"

  [[ "$(sha256sum "$source_manifest" | awk '{print $1}')" == "$expected_source_tree_sha" ]] || fail 'source file manifest digest differs from expected digest'
}

capture_protected_containers() {
  mapfile -t protected_before < <(docker inspect --format '{{.Name}} {{.Id}} {{.State.StartedAt}}' hk-rpg-backend edge-proxy)
  [[ "${#protected_before[@]}" -eq 2 ]] || fail 'protected containers cannot be inspected'
}

verify_protected_containers() {
  local -a protected_after=()
  mapfile -t protected_after < <(docker inspect --format '{{.Name}} {{.Id}} {{.State.StartedAt}}' hk-rpg-backend edge-proxy)
  [[ "${protected_before[*]}" == "${protected_after[*]}" ]] || fail 'a protected container identity or start time changed'
}

verify_rag_health() {
  [[ "$require_rag_health" == '1' ]] || return 0
  docker exec "$CONTAINER" sh -ceu "wget -q -T 5 -O /dev/null '${RAG_UPSTREAM_URL}/api/chat/health'"
}

verify_frontend_health() {
  docker exec "$CONTAINER" sh -ceu '
    test -s /usr/share/nginx/html/index.html
    nginx -t
    wget -q --no-check-certificate -T 5 -O /dev/null https://127.0.0.1/
    wget -q --no-check-certificate -T 5 -O /dev/null https://127.0.0.1/robots.txt
  '
  docker exec "$CONTAINER" sh -ceu '
    for path in /blog /blog/ /blog/1; do
      headers="$(mktemp)"
      body="$(mktemp)"
      if ! wget -S --no-check-certificate -T 5 -O "$body" "https://127.0.0.1$path" 2>"$headers"; then
        rm -f "$headers" "$body"
        exit 1
      fi
      if ! grep -q "HTTP/.* 200" "$headers" || grep -q "HTTP/.* 30[0-9]" "$headers"; then
        rm -f "$headers" "$body"
        exit 1
      fi
      cmp -s "$body" /usr/share/nginx/html/index.html || { rm -f "$headers" "$body"; exit 1; }
      rm -f "$headers" "$body"
    done
    asset=/blog/diagrams/44-frontend-flow.svg
    test -s "/usr/share/nginx/html$asset"
    asset_body="$(mktemp)"
    wget -q --no-check-certificate -T 5 -O "$asset_body" "https://127.0.0.1$asset"
    cmp -s "$asset_body" "/usr/share/nginx/html$asset"
    rm -f "$asset_body"
  '
}

capture_ssr_container() {
  ssr_before="$(docker inspect --format '{{.Id}} {{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$SSR_CONTAINER")"
  [[ -n "$ssr_before" ]] || fail 'SSR container cannot be inspected'
  docker inspect --format '{{.State.Running}}' "$SSR_CONTAINER" | grep -qx true || fail 'SSR container is not running'
}

verify_ssr_container() {
  local ssr_after
  ssr_after="$(docker inspect --format '{{.Id}} {{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$SSR_CONTAINER")"
  [[ "$ssr_after" == "$ssr_before" ]] || fail 'SSR container identity or network address changed'
  docker inspect --format '{{.State.Running}}' "$SSR_CONTAINER" | grep -qx true || fail 'SSR container is not running after restart'
}

verify_ssr_health() {
  local attempt
  for attempt in $(seq 1 15); do
    if docker exec "$CONTAINER" sh -ceu 'wget -q --no-check-certificate -T 3 -O /dev/null https://127.0.0.1/robots.txt'; then
      return 0
    fi
    sleep 1
  done
  fail 'SSR proxy health check did not succeed'
}

activate_ssr() {
  umask 077
  mkdir -p "${release_dir}/activation-backups"
  ssr_backup_dir="$(mktemp -d "${release_dir}/activation-backups/${deployment_tag}.ssr.XXXXXX")"
  mkdir -p "${ssr_backup_dir}/app"
  docker cp "${SSR_CONTAINER}:${SSR_APP_ROOT}/src" "${ssr_backup_dir}/app/src"
  docker cp "${SSR_CONTAINER}:${SSR_APP_ROOT}/node_modules" "${ssr_backup_dir}/app/node_modules"
  docker cp "${SSR_CONTAINER}:${SSR_APP_ROOT}/package.json" "${ssr_backup_dir}/app/package.json"
  docker cp "${SSR_CONTAINER}:${SSR_APP_ROOT}/package-lock.json" "${ssr_backup_dir}/app/package-lock.json"
  docker exec "$SSR_CONTAINER" sh -ceu '
    rm -rf /app.next /app.previous
    mkdir /app.next
  '
  docker cp "${release_dir}/ssr/." "${SSR_CONTAINER}:${SSR_APP_ROOT}.next/"
  docker exec "$SSR_CONTAINER" sh -ceu '
    mv /app /app.previous
    mv /app.next /app
  '
  ssr_activated=1
  docker restart "$SSR_CONTAINER" >/dev/null
  verify_ssr_container
  verify_ssr_health
}

restore_previous_ssr() {
  [[ "$ssr_activated" == '1' ]] || return 0
  if docker inspect --format '{{.State.Running}}' "$SSR_CONTAINER" 2>/dev/null | grep -qx true; then
    docker exec "$SSR_CONTAINER" sh -ceu '
      if [ -d /app.previous ]; then
        rm -rf /app.failed
        if [ -d /app ]; then mv /app /app.failed; fi
        mv /app.previous /app
      fi
    ' || true
    docker restart "$SSR_CONTAINER" >/dev/null || true
  else
    docker cp "${ssr_backup_dir}/app/src" "${SSR_CONTAINER}:${SSR_APP_ROOT}/" || true
    docker cp "${ssr_backup_dir}/app/node_modules" "${SSR_CONTAINER}:${SSR_APP_ROOT}/" || true
    docker cp "${ssr_backup_dir}/app/package.json" "${SSR_CONTAINER}:${SSR_APP_ROOT}/package.json" || true
    docker cp "${ssr_backup_dir}/app/package-lock.json" "${SSR_CONTAINER}:${SSR_APP_ROOT}/package-lock.json" || true
    docker start "$SSR_CONTAINER" >/dev/null || true
  fi
  ssr_activated=0
}

restore_previous_html() {
  [[ "$activated" == '1' ]] || return 0
  if [[ -f "${backup_dir}/nginx.conf" ]]; then
    docker cp "${backup_dir}/nginx.conf" "${CONTAINER}:/etc/nginx/conf.d/default.conf" || true
  fi
  docker exec "$CONTAINER" sh -ceu '
    if [ -d /usr/share/nginx/html.previous ]; then
      rm -rf /usr/share/nginx/html.failed
      if [ -d /usr/share/nginx/html ]; then mv /usr/share/nginx/html /usr/share/nginx/html.failed; fi
      mv /usr/share/nginx/html.previous /usr/share/nginx/html
      nginx -t
      nginx -s reload
    fi
  ' || true
  if [[ -f "${backup_dir}/active-release.env" ]]; then
    cp "${backup_dir}/active-release.env" "$ACTIVE_RELEASE_FILE"
  else
    rm -f "$ACTIVE_RELEASE_FILE"
  fi
  activated=0
}

on_exit() {
  local status="$?"
  trap - EXIT
  if [[ "$status" -ne 0 ]]; then
    restore_previous_html
    restore_previous_ssr
    verify_protected_containers || true
  fi
  exit "$status"
}
trap on_exit EXIT

read_release_metadata
verify_dist_manifest
verify_ssr_manifest
verify_source_tree
capture_protected_containers
capture_ssr_container
docker inspect --format '{{.State.Running}}' "$CONTAINER" | grep -qx true || fail 'react-intro is not running'
verify_rag_health
activate_ssr

umask 077
mkdir -p "${release_dir}/activation-backups"
backup_dir="$(mktemp -d "${release_dir}/activation-backups/${deployment_tag}.frontend.XXXXXX")"
mkdir -p "${backup_dir}/html"
docker cp "${CONTAINER}:${HTML_ROOT}/." "${backup_dir}/html"
docker cp "${CONTAINER}:/etc/nginx/conf.d/default.conf" "${backup_dir}/nginx.conf"
if [[ -f "$ACTIVE_RELEASE_FILE" ]]; then cp "$ACTIVE_RELEASE_FILE" "${backup_dir}/active-release.env"; fi

docker exec "$CONTAINER" sh -ceu '
  rm -rf /usr/share/nginx/html.next /usr/share/nginx/html.previous
  mkdir /usr/share/nginx/html.next
'
docker cp "${release_dir}/dist/." "${CONTAINER}:${HTML_ROOT}.next/"
docker exec "$CONTAINER" sh -ceu '
  mv /usr/share/nginx/html /usr/share/nginx/html.previous
  mv /usr/share/nginx/html.next /usr/share/nginx/html
'
activated=1
python3 - "${backup_dir}/nginx.conf" "${backup_dir}/nginx.next.conf" "$RAG_UPSTREAM_URL" <<'PY'
import pathlib, re, sys
source, destination, upstream = sys.argv[1:]
content = pathlib.Path(source).read_text(encoding='utf-8')
pattern = r'(location\s+(?:=\s+)?/api/chat\s*\{[^{}]*?proxy_pass\s+)http://[^;\s]+;'
updated, count = re.subn(pattern, lambda match: match.group(1) + upstream + ';', content)
if count != 1:
    raise SystemExit('Expected exactly one portfolio chat proxy location')
blog_marker = '# portfolio-spa-blog-root-routes'
blog_routes = '''    # portfolio-spa-blog-root-routes
    # /blog is also the static-asset directory; these exact SPA routes must not
    # fall through to nginx directory redirect or index lookup.
    location = /blog {
        try_files /__portfolio_spa_blog_route__ /index.html;
    }

    location = /blog/ {
        try_files /__portfolio_spa_blog_route__ /index.html;
    }

'''
if blog_marker in updated:
    if updated.count(blog_marker) != 1 or blog_routes not in updated:
        raise SystemExit('Existing portfolio blog root routes differ from the pinned safe configuration')
else:
    if re.search(r'location\s+=\s+/blog\s*\{', updated) or re.search(r'location\s+=\s+/blog/\s*\{', updated):
        raise SystemExit('Existing exact blog root route requires manual review')
    anchor = '    location @ssr_blog {'
    if updated.count(anchor) != 1:
        raise SystemExit('Expected exactly one SSR blog location anchor')
    updated = updated.replace(anchor, blog_routes + anchor)
pathlib.Path(destination).write_text(updated, encoding='utf-8')
PY
docker cp "${backup_dir}/nginx.next.conf" "${CONTAINER}:/etc/nginx/conf.d/default.conf"
docker exec "$CONTAINER" sh -ceu '
  nginx -t
  nginx -s reload
'
verify_frontend_health
verify_rag_health
verify_ssr_health
verify_protected_containers

tmp_active="${ACTIVE_RELEASE_FILE}.tmp-${deployment_tag}"
cp "$release_manifest" "$tmp_active"
mv "$tmp_active" "$ACTIVE_RELEASE_FILE"
