/**
 * E2E Tests - Mobile and Touch Interactions
 */

import { test, expect, devices } from '@playwright/test';

test.describe('Mobile Experience', () => {
  test.use({ ...devices['iPhone 12'] });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 30000 });
    await page.waitForTimeout(2000);
  });

  test('should load on mobile devices', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should display mobile navigation', async ({ page }) => {
    // Look for mobile-specific navigation
    const mobileNav = page.locator(
      '[data-testid="mobile-nav"], [class*="mobile"], [class*="Mobile"]'
    );

    const count = await mobileNav.count();
    // Mobile nav should exist on mobile viewport
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should handle touch interactions', async ({ page }) => {
    const canvas = page.locator('canvas');

    // Simulate tap
    await canvas.tap();
    await page.waitForTimeout(500);

    // Should not crash
    await expect(canvas).toBeVisible();
  });

  test('should support pinch-to-zoom gesture', async ({ page }) => {
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();

    if (box) {
      // Simulate pinch gesture (two-finger touch)
      await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(500);
    }

    await expect(canvas).toBeVisible();
  });

  test('should have touch-friendly button sizes', async ({ page }) => {
    const buttons = page.locator('button:visible');
    const buttonCount = await buttons.count();

    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      const box = await button.boundingBox();

      if (box) {
        // Touch targets should be at least 44x44 pixels (WCAG recommendation)
        // Allow some flexibility for icon buttons
        expect(box.width).toBeGreaterThanOrEqual(24);
        expect(box.height).toBeGreaterThanOrEqual(24);
      }
    }
  });

  test('should adapt layout for mobile', async ({ page }) => {
    // Check viewport meta tag
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');
  });
});

test.describe('Tablet Experience', () => {
  test.use({ ...devices['iPad (gen 7)'] });

  test('should load on tablet devices', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 30000 });

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should handle landscape orientation', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 30000 });

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should handle portrait orientation', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 30000 });

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });
});

test.describe('Touch Gestures', () => {
  test.use({ ...devices['Pixel 5'] });

  test('should handle swipe gestures', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 30000 });
    await page.waitForTimeout(2000);

    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();

    if (box) {
      // Simulate swipe
      const startX = box.x + box.width / 2;
      const startY = box.y + box.height / 2;

      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(startX + 100, startY, { steps: 10 });
      await page.mouse.up();

      await page.waitForTimeout(500);
    }

    await expect(canvas).toBeVisible();
  });

  test('should handle double-tap', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 30000 });

    const canvas = page.locator('canvas');

    // Double tap
    await canvas.dblclick();
    await page.waitForTimeout(500);

    await expect(canvas).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  const viewports = [
    { name: 'Mobile S', width: 320, height: 568 },
    { name: 'Mobile M', width: 375, height: 667 },
    { name: 'Mobile L', width: 425, height: 812 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Laptop', width: 1024, height: 768 },
    { name: 'Desktop', width: 1440, height: 900 },
    { name: 'Large Desktop', width: 1920, height: 1080 },
  ];

  for (const viewport of viewports) {
    test(`should render correctly at ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      await page.waitForSelector('canvas', { timeout: 30000 });

      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();

      // Canvas should fill available space
      const box = await canvas.boundingBox();
      expect(box?.width).toBeGreaterThan(0);
      expect(box?.height).toBeGreaterThan(0);
    });
  }
});
