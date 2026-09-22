import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const { chromium } = createRequire(path.join(workspace, '.local/browser-tools/package.json'))('playwright');
const origin = process.env.EDITOR_TOOLBOX_ORIGIN || 'http://127.0.0.1:5178';
assert(/^http:\/\/127\.0\.0\.1:\d+$/.test(origin), 'Only an explicit loopback test origin is allowed.');
const output = path.join(workspace, '.local/editor-toolbox-20260914');
await fs.mkdir(output, { recursive: true });
const results = { screens: [], checks: [], errors: [], imageAlignment: [], blockedRequests: 0 };
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--disable-background-networking'] });
let currentPage;
async function open(width, mobile = false) {
  const context = await browser.newContext({ viewport: { width, height: 1000 }, isMobile: mobile, hasTouch: mobile, reducedMotion: 'reduce', serviceWorkers: 'block' });
  await context.route('**/*', route => {
    const request = route.request(), url = new URL(request.url());
    if (url.origin === origin && ['GET', 'HEAD', 'OPTIONS'].includes(request.method()) && !/^\/(api|notion|seo)(\/|$)/.test(url.pathname)) return route.continue();
    results.blockedRequests++;
    return route.abort();
  });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  currentPage = page;
  page.on('pageerror', error => results.errors.push(error.message));
  return { page, context };
}
async function capture(page, name) {
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${name} overflow`);
  await page.screenshot({ path: path.join(output, name + '.png'), animations: 'disabled' });
  results.screens.push(name);
}
try {
  for (const width of [1440, 768, 390, 320]) {
    const { page, context } = await open(width, width < 500);
    await page.goto(origin + '/tests/fixtures/editor-preview.html');
    const input = page.getByRole('textbox', { name: '게시글 Markdown 본문' });
    await input.waitFor();
    await page.evaluate(() => document.fonts.ready);
    await capture(page, `composer-${width}`);
    if (width === 1440) {
      const top = (await input.boundingBox()).y;
      assert(top < 480, `writing area begins at ${top}px`);
      results.checks.push({ textareaTop: top });
      await input.fill('변경 전 설명');
      await input.press('Control+a');
      await page.getByRole('button', { name: '취소선', exact: true }).click();
      assert.equal(await input.inputValue(), '~~변경 전 설명~~');
      await page.locator('.editor-preview-content del').waitFor();
      await input.press('Control+z');
      assert.equal(await input.inputValue(), '변경 전 설명');
      await input.fill('');
      await input.press('/');
      await page.getByRole('combobox', { name: '도구 검색' }).waitFor();
      await capture(page, 'slash-menu-1440');
      await page.getByRole('combobox', { name: '도구 검색' }).fill('check');
      await page.getByRole('combobox', { name: '도구 검색' }).press('Enter');
      await page.getByRole('dialog', { name: '편집 도구 찾기' }).waitFor({ state: 'hidden' });
      assert.equal(await input.inputValue(), '- [ ] 목록 항목');
      await page.locator('.editor-preview-content input[type="checkbox"]').waitFor();
      await input.press('Control+z');
      assert.equal(await input.inputValue(), '');
      await page.getByRole('button', { name: '코드 블록', exact: true }).click();
      await page.getByRole('dialog').getByLabel('코드 내용', { exact: false }).fill('echo "hello"');
      await page.getByRole('button', { name: '본문에 삽입', exact: true }).click();
      await page.getByRole('dialog').waitFor({ state: 'hidden' });
      assert.equal(await input.inputValue(), '```bash\necho "hello"\n```\n\n');
      await input.fill('');
      await input.press('/');
      const search = page.getByRole('combobox', { name: '도구 검색' });
      await search.fill('이미지');
      await search.press('Enter');
      const imageDialog = page.getByRole('dialog', { name: '확대 이미지 삽입' });
      await imageDialog.waitFor();
      assert(await imageDialog.locator('input').first().evaluate(el => el === document.activeElement), 'palette to image dialog focus');
      await imageDialog.getByLabel('이미지 주소', { exact: false }).fill('/images/master-scale.svg');
      await imageDialog.getByLabel('대체 텍스트', { exact: true }).fill('확대 검증');
      await page.getByRole('button', { name: '본문에 삽입', exact: true }).click();
      await imageDialog.waitFor({ state: 'hidden' });
      assert((await input.inputValue()).includes('<ZoomableImageModal'));
      assert(await input.evaluate(el => el === document.activeElement));
      await page.getByRole('button', { name: '미리보기', exact: true }).click();
      await page.getByRole('button', { name: '확대 검증 크게 보기' }).click();
      await page.locator('.zoomable-image-dialog [role="dialog"]').waitFor();
      await page.getByRole('button', { name: '이미지 닫기' }).click();
      results.checks.push('strike/checklist/plain code/slash custom image/preview zoom/undo');
    } else if (width < 500) {
      assert.equal(await page.getByRole('button', { name: '나란히', exact: true }).count(), 0);
      await page.getByRole('button', { name: '도구 검색', exact: true }).tap();
      const search = page.getByRole('combobox', { name: '도구 검색' });
      await search.fill('인용');
      const box = await page.getByRole('dialog', { name: '편집 도구 찾기' }).boundingBox();
      assert(box.x >= 0 && box.x + box.width <= width + 1);
      await capture(page, `search-${width}`);
      await search.press('Escape');
      await page.getByRole('dialog').waitFor({ state: 'hidden' });
      const before = await input.inputValue();
      await page.getByRole('button', { name: '미리보기', exact: true }).tap();
      await page.getByRole('button', { name: '작성', exact: true }).tap();
      assert.equal(await input.inputValue(), before);
    }
    await page.goto(origin + '/kredis');
    const image = page.getByRole('button', { name: /Main Reconcile Loop.*크게 보기/ });
    await image.waitFor();
    await image.scrollIntoViewIfNeeded();
    const alignment = await image.evaluate(el => {
      const a = el.getBoundingClientRect(), b = el.parentElement.getBoundingClientRect();
      return { width: innerWidth, difference: a.x + a.width / 2 - b.x - b.width / 2, naturalWidth: el.naturalWidth };
    });
    assert(Math.abs(alignment.difference) < 1, `image centered at ${width}: ${alignment.difference}`);
    assert(alignment.naturalWidth > 0);
    results.imageAlignment.push(alignment);
    await capture(page, `kredis-${width}`);
    if (width === 320) {
      await image.tap();
      const dialog = page.getByRole('dialog');
      await dialog.waitFor();
      await page.getByRole('button', { name: '이미지 확대', exact: true }).tap();
      await page.getByRole('button', { name: '이미지 닫기' }).tap();
      await dialog.waitFor({ state: 'hidden' });
      assert(await image.evaluate(el => document.activeElement === el));
    }
    await context.close();
  }
  // Check the real protected route and shared navigation; never publish the draft.
  const liveContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
  await liveContext.route('**/*', route => {
    const request = route.request(), url = new URL(request.url());
    if (url.origin !== origin) return route.abort();
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method()) || (url.pathname === '/api/users/login' && request.method() === 'POST')) return route.continue();
    return route.abort();
  });
  const live = await liveContext.newPage();
  currentPage = live;
  live.setDefaultTimeout(10000);
  live.on('pageerror', error => results.errors.push(error.message));
  await live.goto(origin + '/blog');
  await live.getByRole('button', { name: '로그인', exact: true }).click();
  await live.getByRole('dialog').getByLabel('아이디').fill('editorial-admin');
  await live.getByRole('dialog').getByLabel('비밀번호', { exact: false }).fill('local-editorial-only');
  await live.getByRole('dialog').getByRole('button', { name: '로그인', exact: true }).click();
  await live.getByRole('button', { name: '로그아웃', exact: true }).waitFor();
  await live.getByRole('link', { name: '글 작성', exact: true }).click();
  await live.getByRole('textbox', { name: '게시글 Markdown 본문' }).waitFor();
  assert.equal(await live.locator('.portfolio-header').count(), 1);
  await capture(live, 'actual-composer-1440');
  await liveContext.close();
  results.checks.push('real local login/create route with shared navigation; no post writes');
  assert.deepEqual(results.errors, []);
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results));
} catch (error) {
  if (currentPage && !currentPage.isClosed()) {
    await currentPage.screenshot({ path: path.join(output, 'failure.png') });
    console.error(await currentPage.locator('[role="dialog"]').allTextContents());
    console.error('Page errors:', results.errors);
  }
  throw error;
} finally { await browser.close(); }
