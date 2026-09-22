#!/usr/bin/env bash
set -Eeuo pipefail

readonly RELEASE_ROOT='/home/ec2-user/portfolio-releases'
readonly CODEDEPLOY_ROOT='/home/ec2-user/portfolio-codedeploy'
readonly EXPECTED_RELEASE_FILE="${CODEDEPLOY_ROOT}/expected-release.env"
readonly ACTIVE_RELEASE_FILE="${RELEASE_ROOT}/active-release.env"
readonly CONTAINER='react-intro'
readonly SSR_CONTAINER='ssr-notion'
readonly RAG_UPSTREAM_URL="${RAG_UPSTREAM_URL:-http://172.18.0.1:8001}"

fail() {
  printf '%s\n' "deployment validation failed: $*" >&2
  exit 1
}

[[ "$RAG_UPSTREAM_URL" =~ ^http://[0-9.]+:[0-9]{1,5}$ ]] || fail 'RAG upstream URL is invalid'

read_value() {
  local file="$1" key="$2"
  awk -F= -v expected="$key" '$1 == expected { print substr($0, length($1) + 2); exit }' "$file"
}

test -r "$EXPECTED_RELEASE_FILE" || fail 'expected release manifest is missing'
test -r "$ACTIVE_RELEASE_FILE" || fail 'active release manifest is missing'
expected_commit="$(read_value "$EXPECTED_RELEASE_FILE" source_commit)"
active_commit="$(read_value "$ACTIVE_RELEASE_FILE" source_commit)"
require_rag_health="$(read_value "$ACTIVE_RELEASE_FILE" require_portfolio_rag_health)"
[[ "$expected_commit" =~ ^[0-9a-f]{40}$ ]] || fail 'expected commit is invalid'
[[ "$active_commit" == "$expected_commit" ]] || fail 'active release does not match expected commit'
docker inspect --format '{{.State.Running}}' "$CONTAINER" | grep -qx true || fail 'react-intro is not running'
docker inspect --format '{{.State.Running}}' "$SSR_CONTAINER" | grep -qx true || fail 'SSR container is not running'
docker exec "$CONTAINER" sh -ceu '
  test -s /usr/share/nginx/html/index.html
  nginx -t
  wget -q --no-check-certificate -T 5 -O /dev/null https://127.0.0.1/
  wget -q --no-check-certificate -T 5 -O /dev/null https://127.0.0.1/robots.txt
'
case "$require_rag_health" in
  0) ;;
  1) docker exec "$CONTAINER" sh -ceu "wget -q -T 5 -O /dev/null '${RAG_UPSTREAM_URL}/api/chat/health'" ;;
  *) fail 'RAG health requirement is invalid' ;;
esac
