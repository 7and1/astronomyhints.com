/**
 * E2E Tests - Visual Regression
 */

import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // Disable animations for consistent screenshots
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('should match homepage snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 30000 });
    await page.waitForTimeout(3000); // Wait for scene to stabilize

    // Take screenshot excluding the 3D canvas (which changes)
    await expect(page).toHaveScreenshot('homepage.png', {
      mask: [page.locator('canvas')],
      maxDiffPixelRatio: 0.1,
    });
  });

  test('should match planet selection state', async ({ page }) => {
    await page.goto('/?planet=Earth');
    await page.waitForSelector('canvas', { timeout: 30000 });
    await page.waitForTimeout(3000);

    await expect(page).toHaveScreenshot('planet-selected.png', {
      mask: [page.locator('canvas')],
      maxDiffPixelRatio: 0.1,
    });
  });

  test('should match help dialog', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 30000 });
    await page.waitForTimeout(2000);

    // Open help dialog
    await page.keyboard.press('?');
    await page.waitForTimeout(500);

    const dialog = page.locator('[role="dialog"]');
    if (await dialog.isVisible()) {
      await expect(dialog).toHaveScreenshot('help-dialog.png', {
        maxDiffPixelRatio: 0.1,
      });
    }
  });

  test('should match mobile layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 30000 });
    await page.waitForTimeout(3000);

    await expect(page).toHaveScreenshot('mobile-layout.png', {
      mask: [page.locator('canvas')],
      maxDiffPixelRatio: 0.1,
    });
  });

  test('should match tablet layout', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 30000 });
    await page.waitForTimeout(3000);

    await expect(page).toHaveScreenshot('tablet-layout.png', {
      mask: [page.locator('canvas')],
      maxDiffPixelRatio: 0.1,
    });
  });

  test('should match dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 30000 });
    await page.waitForTimeout(3000);

    await expect(page).toHaveScreenshot('dark-mode.png', {
      mask: [page.locator('canvas')],
      maxDiffPixelRatio: 0.1,
    });
  });

  test('should match high contrast mode', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' });
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 30000 });
    await page.waitForTimeout(3000);

    await expect(page).toHaveScreenshot('high-contrast.png', {
      mask: [page.locator('canvas')],
      maxDiffPixelRatio: 0.15, // Allow more variance for forced colors
    });
  });
});

test.describe('Component Screenshots', () => {
  test('should capture HUD components', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 30000 });
    await page.waitForTimeout(2000);

    // Capture individual HUD elements if visible
    const hudElements = [
      '[data-testid="time-panel"]',
      '[data-testid="planet-panel"]',
      '[class*="TopBar"]',
    ];

    for (const selector of hudElements) {
      const element = page.locator(selector);
      if (await element.isVisible()) {
        await expect(element).toHaveScreenshot(`hud-${selector.replace(/[^a-z]/gi, '-')}.png`, {
          maxDiffPixelRatio: 0.1,
        });
      }
    }
  });

  test('should capture error state', async ({ page }) => {
    // Navigate to a page that might show error state
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 30000 });

    // Look for error boundary fallback
    const errorFallback = page.locator('[class*="error"], [data-testid="error"]');
    if (await errorFallback.isVisible()) {
      await expect(errorFallback).toHaveScreenshot('error-state.png', {
        maxDiffPixelRatio: 0.1,
      });
    }
  });
});

test.describe('Animation States', () => {
  test('should capture loading state', async ({ page }) => {
    // Slow down network to capture loading state
    await page.route('**/*', (route) => {
      setTimeout(() => route.continue(), 100);
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Try to capture loading state
    const loadingIndicator = page.locator('[class*="loading"], [class*="Loading"], [class*="boot"]');
    if (await loadingIndicator.first().isVisible({ timeout: 1000 }).catch(() => false)) {
      await expect(loadingIndicator.first()).toHaveScreenshot('loading-state.png', {
        maxDiffPixelRatio: 0.2,
      });
    }
  });

  test('should capture cinematic mode UI', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 30000 });
    await page.waitForTimeout(2000);

    // Enable cinematic mode
    await page.keyboard.press('c');
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('cinematic-mode.png', {
      mask: [page.locator('canvas')],
      maxDiffPixelRatio: 0.1,
    });

    // Disable cinematic mode
    await page.keyboard.press('c');
  });
});
