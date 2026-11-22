import assert from 'node:assert/strict';
import { stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { chromium } from 'playwright';
import { preview } from 'vite';

test('Workbox resolves the patched glob override', () => {
  const require = createRequire(import.meta.url);
  const requireFromPwa = createRequire(require.resolve('vite-plugin-pwa/package.json'));
  const requireFromWorkbox = createRequire(requireFromPwa.resolve('workbox-build/package.json'));
  const { version } = requireFromWorkbox('glob/package.json');
  const [major, minor, patch] = version.split('.').map(Number);
  assert.ok(major === 14 && (minor > 0 || patch >= 6), `Workbox resolved glob ${version}`);
});

test('the production service worker serves both pages and custom searches with the host offline', { timeout: 60_000 }, async t => {
  const server = await preview({ preview: { host: '127.0.0.1', port: 0 } });
  t.after(async () => {
    if (server.httpServer.listening) await server.close();
  });
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;

  const browser = await chromium.launch();
  t.after(() => browser.close());
  const context = await browser.newContext();
  await context.route('https://analytics.whatthefreakisthis.com/**', route => route.abort());
  await context.route('https://github.com/search**', route => route.fulfill({ body: 'Search destination' }));

  const page = await context.newPage();
  assert.equal((await page.goto(origin)).status(), 200);
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);

  const bundlePath = await page.locator('script[type="module"][src]').getAttribute('src');
  const { size } = await stat(new URL(`../dist${bundlePath}`, import.meta.url));
  assert.ok(size <= 3 * 1024 * 1024, `The redirect bundle is ${size} bytes and exceeds the 3 MiB precache limit`);

  const cachedPaths = await page.evaluate(async () => {
    const cacheNames = await caches.keys();
    const cacheEntries = await Promise.all(cacheNames.map(async name => (await (await caches.open(name)).keys())));
    return cacheEntries.flat().map(request => new URL(request.url).pathname);
  });
  for (const path of ['/index.html', '/bang.html', bundlePath]) {
    assert.ok(cachedPaths.includes(path), `${path} is missing from the precache`);
  }

  await server.close();

  const directory = await page.goto(`${origin}/bang.html?utm_source=smoke&fbclid=smoke`);
  assert.equal(directory.fromServiceWorker(), true);
  assert.equal(await page.title(), 'Bang Directory | Unbang');
  await page.locator('#bang-filter-input').fill('squarespace domains');
  await page.locator('#bang-list [data-bang="sqdomains"]').waitFor();

  const searchUrl = `${origin}/?q=%21gh+cached+search`;
  const [searchResponse] = await Promise.all([
    page.waitForResponse(searchUrl),
    page.goto(searchUrl, { waitUntil: 'commit' }),
  ]);
  assert.equal(searchResponse.fromServiceWorker(), true);
  await page.waitForURL('https://github.com/search**');
  assert.equal(new URL(page.url()).searchParams.get('q'), 'cached search');

  await assert.rejects(page.goto(`${origin}/missing.html?q=search`), /ERR_CONNECTION_REFUSED/);
});
