import { test, expect } from '@playwright/test';

type ManifestIcon = { src: string; sizes: string; type: string; purpose?: string };

// "Add to Home Screen" support: the manifest, its icons and the iOS tags. Read-only, no data.
test.describe('Web app manifest', () => {
  test('TC-PWA-001: The site links a valid manifest and its icons load', { tag: '@orchestrated' }, async ({ page, request }) => {
    // Step 1: The home page links the manifest and the iOS home-screen icon and tags
    await page.goto('/');
    const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href');
    expect(manifestHref).toBeTruthy();
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', /apple-touch-icon\.png/);
    await expect(page.locator('meta[name="mobile-web-app-capable"], meta[name="apple-mobile-web-app-capable"]')).not.toHaveCount(0);

    // Step 2: The manifest is installable: name, standalone display, start URL, theme, icons
    const res = await request.get(manifestHref!);
    expect(res.ok()).toBeTruthy();
    const manifest = await res.json();
    expect(manifest.name).toBe('Halal Bites ATL');
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url).toMatch(/^\//);
    expect(manifest.theme_color).toBe('#0d9488');
    const icons = manifest.icons as ManifestIcon[];
    expect(icons.map((i) => i.sizes)).toEqual(expect.arrayContaining(['192x192', '512x512']));
    expect(icons.some((i) => i.purpose === 'maskable')).toBe(true);

    // Step 3: Every icon (and the Apple touch icon) is served as a PNG
    for (const src of [...icons.map((i) => i.src), '/apple-touch-icon.png']) {
      const iconRes = await request.get(src);
      expect(iconRes.ok(), src).toBeTruthy();
      expect(iconRes.headers()['content-type'], src).toContain('image/png');
    }
  });
});
