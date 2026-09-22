import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const { chromium } = createRequire(path.join(workspace, '.local/browser-tools/package.json'))('playwright');
const origin = 'http://localhost:5178';
const baseline = process.argv.includes('--baseline');
const output = path.join(workspace, '.local/redesign-20260914-viewer');
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });

try {
  const context = await browser.newContext({ viewport: { width: 568, height: 320 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, serviceWorkers: 'block' });
  await context.route('**/*', route => {
    const request = route.request();
    return new URL(request.url()).origin === origin && ['GET', 'HEAD', 'OPTIONS'].includes(request.method()) ? route.continue() : route.abort();
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${origin}/terraform`, { waitUntil: 'domcontentloaded' });
  const trigger = page.locator('.zoomable-image-trigger');
  await trigger.press('Enter');
  await page.getByRole('dialog').waitFor({ state: 'visible' });
  await page.waitForTimeout(250);
  await page.evaluate(() => {
    window.dismissPointerEvents = [];
    for (const type of ['pointerdown', 'pointerup', 'pointercancel', 'click']) {
      document.addEventListener(type, event => window.dismissPointerEvents.push({
        type,
        pointerId: event.pointerId,
        pointerType: event.pointerType,
        detail: event.detail,
        firesTouchEvents: event.sourceCapabilities?.firesTouchEvents,
        target: event.target.classList.contains('zoomable-image-trigger') ? 'trigger' : event.target.closest('[data-resize-direction]')?.getAttribute('data-resize-direction') || event.target.tagName,
      }), true);
    }
  });
  const handle = await page.locator('.zoomable-image-resize--s').boundingBox();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: handle.x + handle.width / 2, y: handle.y + handle.height / 2, id: 1 }] });
  await page.keyboard.press('Escape');
  await page.locator('.zoomable-image-dialog').waitFor({ state: 'detached' });
  assert.ok(await trigger.evaluate(element => document.activeElement === element));
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.evaluate(() => new Promise(requestAnimationFrame));
  const result = {
    mode: baseline ? 'baseline' : 'regression',
    dialogsAfterRelease: await page.locator('.zoomable-image-dialog').count(),
    events: await page.evaluate(() => window.dismissPointerEvents),
  };
  if (!baseline) {
    assert.equal(result.dialogsAfterRelease, 0, 'The dismissed resize touch must not reopen the image on release');
    assert.ok(await trigger.evaluate(element => document.activeElement === element));
    await trigger.tap();
    await page.getByRole('dialog').waitFor({ state: 'visible' });
    result.freshTapOpens = true;
    await page.keyboard.press('Escape');
    await page.locator('.zoomable-image-dialog').waitFor({ state: 'detached' });
    await trigger.press('Enter');
    await page.getByRole('dialog').waitFor({ state: 'visible' });
    result.keyboardOpens = true;
    await page.keyboard.press('Escape');
    await page.locator('.zoomable-image-dialog').waitFor({ state: 'detached' });
    await trigger.evaluate(element => element.click());
    await page.getByRole('dialog').waitFor({ state: 'visible' });
    result.zeroDetailClickOpens = true;
  }
  assert.deepEqual(errors, []);
  await fs.writeFile(path.join(output, `${result.mode}-dismiss-touch.json`), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(result));
  await context.close();
} finally {
  await browser.close();
}
