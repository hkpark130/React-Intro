import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

// Existing private Playwright only. The fixture cannot save and all API/outbound requests are blocked.
const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const { chromium } = createRequire(path.join(workspace, '.local/browser-tools/package.json'))('playwright');
const origin = 'http://localhost:5178';
const output = path.join(workspace, '.local/blog-editor-20260914');
await fs.mkdir(output, { recursive: true });
const results = { browser: 'local headless Chrome', fixturesOnly: true, screens: [], assertions: [], blockedRequests: 0, pageErrors: [] };

async function openFixture(browser, viewport, mobile = false) {
  const context = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1, serviceWorkers: 'block' });
  await context.route('**/*', route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin === origin && ['GET', 'HEAD', 'OPTIONS'].includes(request.method()) && !/^\/(api|notion|seo)(\/|$)/.test(url.pathname)) return route.continue();
    results.blockedRequests += 1;
    return route.abort();
  });
  const page = await context.newPage();
  page.on('pageerror', error => results.pageErrors.push({ viewport: viewport.width, message: error.message, stack: error.stack }));
  await page.goto(`${origin}/tests/fixtures/editor-preview.html`, { waitUntil: 'networkidle' });
  await page.getByRole('textbox', { name: '게시글 Markdown 본문' }).waitFor();
  await page.evaluate(() => document.fonts.ready);
  return { page, context, input: page.getByRole('textbox', { name: '게시글 Markdown 본문' }) };
}

async function capture(page, name) {
  await page.locator('.markdown-editor').scrollIntoViewIfNeeded();
  const overflow = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, width: innerWidth }));
  assert.ok(overflow.scroll <= overflow.width + 1, `${name}: document must fit the viewport`);
  const boxes = await page.locator('.editor-workspace > section').evaluateAll(elements => elements.filter(element => !element.hidden).map(element => ({ width: element.getBoundingClientRect().width, height: element.getBoundingClientRect().height })));
  await page.locator('.markdown-editor').screenshot({ path: path.join(output, `${name}.png`) });
  results.screens.push({ name, overflow, panes: boxes });
}

const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--disable-background-networking'] });
try {
  const desktop = await openFixture(browser, { width: 1440, height: 1100 });
  const { page, input, context } = desktop;
  assert.equal(await page.locator('.markdown-editor').getAttribute('data-view'), 'split');
  await capture(page, 'desktop-1440');
  await input.fill('앞 한글 뒤');
  await input.evaluate(element => { element.focus(); element.setSelectionRange(2, 4, 'backward'); });
  await page.getByRole('button', { name: '굵게', exact: true }).click();
  assert.equal(await input.inputValue(), '앞 **한글** 뒤');
  assert.deepEqual(await input.evaluate(element => [element.selectionStart, element.selectionEnd, element.selectionDirection]), [4, 6, 'backward']);
  await input.press('Control+z'); assert.equal(await input.inputValue(), '앞 한글 뒤');
  await input.press('Control+Shift+z'); assert.equal(await input.inputValue(), '앞 **한글** 뒤');
  results.assertions.push('native toolbar selection and undo/redo');

  await input.fill(''); await input.focus();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Input.imeSetComposition', { text: 'ㅎ', selectionStart: 1, selectionEnd: 1 });
  await cdp.send('Input.imeSetComposition', { text: '하', selectionStart: 1, selectionEnd: 1 });
  await cdp.send('Input.imeSetComposition', { text: '한', selectionStart: 1, selectionEnd: 1 });
  await cdp.send('Input.insertText', { text: '한' });
  assert.equal(await input.inputValue(), '한');
  await input.press('Control+z'); assert.equal(await input.inputValue(), '');
  await input.press('Control+Shift+z'); assert.equal(await input.inputValue(), '한');
  results.assertions.push('Chrome native composition is one undo step');

  await input.fill('앞뒤');
  await input.evaluate(element => element.setSelectionRange(1, 1));
  await page.getByRole('button', { name: '접는 코드', exact: true }).click();
  await page.getByRole('dialog').getByLabel('제목', { exact: true }).fill('닫는 태그 "예제"');
  await page.getByRole('dialog').getByLabel('코드 내용', { exact: false }).fill('</CodeAccordion>\n&lt;literal&gt;');
  await page.getByRole('dialog').getByLabel('처음부터 펼치기').check();
  await page.getByRole('dialog').getByLabel('줄 번호', { exact: true }).uncheck();
  await page.getByRole('button', { name: '본문에 삽입', exact: true }).click();
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  assert.match(await input.inputValue(), /contentEncoding="html"/);
  assert.equal(await page.locator('.editor-preview-content pre code').innerText(), '</CodeAccordion>\n&lt;literal&gt;');
  assert.ok(await input.evaluate(element => document.activeElement === element));
  results.assertions.push('encoded custom block preview and modal focus restoration');
  await page.getByRole('button', { name: 'Notion', exact: true }).click();
  assert.match(await page.getByRole('dialog').innerText(), /Notion 외부 조회를 사용하지 않습니다/);
  assert.equal(await page.getByRole('dialog').locator('input[type="password"]').count(), 0);
  await page.getByRole('button', { name: '닫기', exact: true }).click();
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  results.assertions.push('editorial Notion notice without browser key controls');
  await context.close();

  for (const width of [390, 320]) {
    const mobile = await openFixture(browser, { width, height: 844 }, true);
    assert.equal(await mobile.page.locator('.markdown-editor').getAttribute('data-view'), 'write');
    assert.equal(await mobile.page.getByRole('button', { name: '나란히', exact: true }).count(), 0);
    await capture(mobile.page, `mobile-${width}-write`);
    const source = await mobile.input.inputValue();
    await mobile.page.getByRole('button', { name: '미리보기', exact: true }).tap();
    await capture(mobile.page, `mobile-${width}-preview`);
    await mobile.page.getByRole('button', { name: '작성', exact: true }).tap();
    assert.equal(await mobile.input.inputValue(), source);
    await mobile.page.getByRole('button', { name: '확대 이미지', exact: true }).tap();
    await mobile.page.waitForTimeout(250); // Capture the settled MUI entrance, not a translucent transition frame.
    await mobile.page.getByRole('dialog').screenshot({ path: path.join(output, `mobile-${width}-dialog.png`) });
    const dialogBox = await mobile.page.getByRole('dialog').boundingBox();
    assert.ok(dialogBox.x >= 0 && dialogBox.x + dialogBox.width <= width + 1);
    await mobile.page.keyboard.press('Escape');
    await mobile.page.getByRole('dialog').waitFor({ state: 'hidden' });
    assert.ok(await mobile.input.evaluate(element => document.activeElement === element));
    results.assertions.push(`${width}px modes, dialog bounds and Escape focus`);
    await mobile.context.close();
  }
  await fs.writeFile(path.join(output, 'results.json'), `${JSON.stringify(results, null, 2)}\n`, 'utf8');
  assert.deepEqual(results.pageErrors, []);
  console.log(JSON.stringify(results));
} finally { await browser.close(); }
