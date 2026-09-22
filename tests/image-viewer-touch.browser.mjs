import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

// Reuses the existing private browser tooling; no install, remote API or write request.
const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const { chromium } = createRequire(path.join(workspace, '.local/browser-tools/package.json'))('playwright');
const baseUrl = 'http://localhost:5178';
const baseline = process.argv.includes('--baseline');
const output = path.join(workspace, '.local/redesign-20260914-viewer');
await fs.mkdir(output, { recursive: true });

async function preparePage(browser, viewport, touch) {
  const context = await browser.newContext({ viewport, isMobile: touch, hasTouch: touch, deviceScaleFactor: 1, serviceWorkers: 'block' });
  await context.route('**/*', route => {
    const request = route.request();
    return new URL(request.url()).origin === baseUrl && ['GET', 'HEAD', 'OPTIONS'].includes(request.method()) ? route.continue() : route.abort();
  });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/terraform`, { waitUntil: 'domcontentloaded' });
  const trigger = page.locator('img[role="button"]');
  await trigger.waitFor({ state: 'attached' });
  assert.equal(await trigger.count(), 1);
  await trigger.press('Enter');
  await page.getByRole('dialog').waitFor({ state: 'visible' });
  await page.waitForTimeout(250); // Let the existing MUI entrance transition finish.
  return { context, page, trigger };
}

async function measure(page) {
  return page.getByRole('dialog').evaluate(element => {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height, left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, viewportWidth: innerWidth, viewportHeight: innerHeight };
  });
}

const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const { context, page, trigger } = await preparePage(browser, { width: 320, height: 844 }, true);
  const before = await measure(page);
  await page.evaluate(() => {
    window.viewerPointerEvents = [];
    for (const type of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'gotpointercapture', 'lostpointercapture']) {
      document.addEventListener(type, event => {
        if (event.pointerType === 'touch') window.viewerPointerEvents.push(type);
      }, true);
    }
  });
  const handle = page.locator('[aria-label="resize-s"]');
  assert.equal(await handle.count(), 1);
  const box = await handle.boundingBox();
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  const cdp = await context.newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] });
  const samples = [];
  for (let step = 1; step <= 8; step++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - step * 10, id: 1 }] });
    await page.evaluate(() => new Promise(requestAnimationFrame));
    samples.push((await measure(page)).height);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  const after = await measure(page);
  const events = await page.evaluate(() => window.viewerPointerEvents.reduce((counts, type) => ({ ...counts, [type]: (counts[type] || 0) + 1 }), {}));
  const result = { mode: baseline ? 'baseline' : 'regression', touch: { before, after, samples, events } };
  await page.screenshot({ path: path.join(output, `${result.mode}-touch-320.png`) });
  if (!baseline) {
    assert.ok(before.left >= 0 && before.right <= 320, 'Mobile paper must fit the viewport');
    assert.equal(events.pointercancel || 0, 0, 'Native touch resize must not become browser scroll');
    assert.ok(events.pointermove >= 8, 'All native touch movements must reach the resize gesture');
    assert.ok(new Set(samples).size >= 6, 'Resize must keep updating after the first movement');
    assert.ok(after.height < before.height - 100, 'Centered south handle must follow the touch');
    const zoomIn = page.locator('button[aria-label="이미지 확대"]');
    await zoomIn.press('Enter');
    const transform = await page.locator('.react-transform-component').getAttribute('style');
    assert.match(transform, /scale\((?!1\))/);
    await page.keyboard.press('Escape');
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    assert.ok(await trigger.evaluate(element => document.activeElement === element));
    result.keyboardZoomAndFocusReturn = true;
    const desktop = await preparePage(browser, { width: 1280, height: 900 }, false);
    const desktopBefore = await measure(desktop.page);
    const east = await desktop.page.locator('[aria-label="resize-e"]').boundingBox();
    await desktop.page.mouse.move(east.x + east.width / 2, east.y + east.height / 2);
    await desktop.page.mouse.down();
    await desktop.page.mouse.move(east.x + east.width / 2 - 40, east.y + east.height / 2, { steps: 8 });
    await desktop.page.mouse.up();
    const desktopAfter = await measure(desktop.page);
    assert.ok(desktopAfter.width < desktopBefore.width - 50);
    result.desktop = { before: desktopBefore, after: desktopAfter };
    await desktop.context.close();
  }
  await fs.writeFile(path.join(output, `${result.mode}-touch.json`), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(result));
  await context.close();
} finally {
  await browser.close();
}
