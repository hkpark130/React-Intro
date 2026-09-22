import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

// Manual browser regression using the workspace's existing private tooling.
const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const { chromium } = createRequire(path.join(workspace, '.local/browser-tools/package.json'))('playwright');
const baseUrl = 'http://localhost:5178';
const output = path.join(workspace, '.local/redesign-20260914-viewer');
await fs.mkdir(output, { recursive: true });

async function checkViewer(page, trigger, viewport, label) {
  await trigger.press('Enter');
  const dialog = page.getByRole('dialog');
  await dialog.waitFor({ state: 'visible' });
  await page.waitForTimeout(250);
  assert.equal(await page.locator('.zoomable-image-dialog').count(), 1);
  const paper = await dialog.boundingBox();
  assert.ok(paper.x >= 0 && paper.x + paper.width <= viewport.width + 1, 'Image dialog must stay within the viewport');
  assert.ok(paper.y >= 0 && paper.y + paper.height <= viewport.height + 1, 'Image dialog must fit vertically');
  const image = dialog.locator('.zoomable-image-content');
  const fittedWidth = (await image.boundingBox()).width;
  for (let step = 0; step < 8; step++) await dialog.locator('button[aria-label="이미지 확대"]').press('Enter');
  const enlargedWidth = (await image.boundingBox()).width;
  assert.ok(enlargedWidth >= 1440, 'Small screens must be able to enlarge diagram labels to original pixel size');
  if (viewport.width === 320 && label === 'deployment') {
    await page.screenshot({ path: path.join(output, 'openstack-viewer-320-enlarged.png') });
  }
  await dialog.locator('button[aria-label="이미지 축소"]').press('Enter');
  assert.ok((await image.boundingBox()).width < enlargedWidth);
  await dialog.locator('button[aria-label="이미지 배율 초기화"]').press('Enter');
  assert.ok(Math.abs((await image.boundingBox()).width - fittedWidth) < 1);
  if (viewport.width === 320 && label === 'deployment') {
    await page.screenshot({ path: path.join(output, 'openstack-viewer-320-fit.png') });
  }
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'hidden' });
  assert.ok(await trigger.evaluate(element => document.activeElement === element), 'Escape must return focus to the diagram');
  return { diagram: label, paper, fittedImageWidth: fittedWidth, enlargedImageWidth: enlargedWidth };
}

async function figureMetrics(page, selector) {
  return page.locator(selector).evaluate(element => ({
    width: element.clientWidth,
    scrollWidth: element.scrollWidth,
    imageWidth: element.querySelector('img').getBoundingClientRect().width,
  }));
}

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
try {
  for (const width of [1440, 1024, 390, 320]) {
    const viewport = { width, height: width > 600 ? 1000 : 844 };
    const context = await browser.newContext({ viewport, isMobile: width <= 600, hasTouch: width <= 600, deviceScaleFactor: 1, serviceWorkers: 'block' });
    await context.route('**/*', route => {
      const request = route.request();
      return new URL(request.url()).origin === baseUrl && ['GET', 'HEAD', 'OPTIONS'].includes(request.method()) ? route.continue() : route.abort();
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${baseUrl}/openstack`, { waitUntil: 'domcontentloaded' });
    await page.locator('.os-architecture__diagram-scroll img').waitFor({ state: 'visible' });
    await page.evaluate(() => document.fonts.ready);
    const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    assert.equal(hasOverflow, false, 'Only diagram containers may scroll horizontally');
    await page.screenshot({ path: path.join(output, `openstack-${width}-top.png`) });
    const row = { viewport, deployment: await figureMetrics(page, '.os-architecture__diagram-scroll'), viewers: [] };
    row.viewers.push(await checkViewer(page, page.locator('.os-architecture__diagram-scroll img'), viewport, 'deployment'));
    await page.locator('#openstack-arch-tab-network').click();
    const networkImages = page.locator('.neutron-diagram-scroll img');
    assert.equal(await networkImages.count(), 2);
    for (let index = 0; index < 2; index++) {
      row.viewers.push(await checkViewer(page, networkImages.nth(index), viewport, index ? 'east-west' : 'north-south'));
    }
    row.network = await figureMetrics(page, '.neutron-diagram-scroll >> nth=0');
    assert.equal(await page.locator('.os-architecture a[download], .os-architecture a[href$=".svg"], .os-architecture a[href="/brands/credits.html"]').count(), 0);
    await page.locator('#openstack-arch-tab-units').click();
    assert.equal(await page.locator('.os-architecture__application').count(), 43);
    assert.equal(await page.locator('.os-architecture__unit-list > li').count(), 72);
    const firstRole = page.locator('.os-architecture__role').first();
    assert.ok(await firstRole.evaluate(element => element.open));
    await firstRole.locator('summary').press('Enter');
    assert.equal(await firstRole.evaluate(element => element.open), false);
    await firstRole.locator('summary').press('Enter');
    assert.ok(await firstRole.evaluate(element => element.open));
    row.inventory = { applications: 43, units: 72, roleToggle: true };
    assert.deepEqual(errors, []);
    row.pageErrors = errors;
    results.push(row);
    await context.close();
  }
  await fs.writeFile(path.join(output, 'openstack-viewers.json'), `${JSON.stringify(results, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(results));
} finally {
  await browser.close();
}
