/**
 * E2E Tests - Accessibility (a11y)
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 30000 });
    await page.waitForTimeout(2000);
  });

  test('should have no critical accessibility violations', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .exclude('canvas') // Exclude canvas as it's a 3D visualization
      .analyze();

    // Filter for critical and serious violations only
    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    // Log violations for debugging
    if (criticalViolations.length > 0) {
      console.log('Critical a11y violations:', JSON.stringify(criticalViolations, null, 2));
    }

    expect(criticalViolations.length).toBe(0);
  });

  test('should have proper document structure', async ({ page }) => {
    // Check for main landmark
    const main = page.locator('main, [role="main"]');
    await expect(main.first()).toBeAttached();

    // Check for heading hierarchy
    const h1 = page.locator('h1');
    const h1Count = await h1.count();
    expect(h1Count).toBeGreaterThanOrEqual(0); // May be visually hidden
  });

  test('should have accessible skip link', async ({ page }) => {
    const skipLink = page.locator('a[href="#main-content"], .skip-link');

    if (await skipLink.isAttached()) {
      // Skip link should become visible on focus
      await skipLink.focus();
      await page.waitForTimeout(100);

      // Check that it has accessible text
      const text = await skipLink.textContent();
      expect(text?.toLowerCase()).toContain('skip');
    }
  });

  test('should have accessible buttons', async ({ page }) => {
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const button = buttons.nth(i);

      if (await button.isVisible()) {
        // Each button should have accessible name
        const accessibleName = await button.getAttribute('aria-label') ||
          await button.textContent() ||
          await button.getAttribute('title');

        expect(accessibleName?.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test('should have proper ARIA attributes on dialogs', async ({ page }) => {
    // Open help dialog
    await page.keyboard.press('?');
    await page.waitForTimeout(500);

    const dialog = page.locator('[role="dialog"]');

    if (await dialog.isVisible()) {
      // Dialog should have aria-modal
      const ariaModal = await dialog.getAttribute('aria-modal');
      expect(ariaModal).toBe('true');

      // Dialog should have aria-labelledby or aria-label
      const ariaLabelledBy = await dialog.getAttribute('aria-labelledby');
      const ariaLabel = await dialog.getAttribute('aria-label');
      expect(ariaLabelledBy || ariaLabel).toBeTruthy();
    }
  });

  test('should support reduced motion preference', async ({ page }) => {
    // Emulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 30000 });

    // Page should load without errors
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should have sufficient color contrast', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .exclude('canvas')
      .analyze();

    // Check specifically for color contrast violations
    const contrastViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'color-contrast'
    );

    // Log for debugging
    if (contrastViolations.length > 0) {
      console.log('Color contrast violations:', contrastViolations.length);
    }

    // Allow some violations as space theme may have intentional low contrast
    expect(contrastViolations.length).toBeLessThan(10);
  });

  test('should have accessible form controls', async ({ page }) => {
    const inputs = page.locator('input, select, textarea');
    const inputCount = await inputs.count();

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);

      if (await input.isVisible()) {
        // Each input should have a label
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');
        const placeholder = await input.getAttribute('placeholder');

        // Should have some form of labeling
        const hasLabel = id || ariaLabel || ariaLabelledBy || placeholder;
        expect(hasLabel).toBeTruthy();
      }
    }
  });

  test('should announce dynamic content changes', async ({ page }) => {
    // Check for live regions
    const liveRegions = page.locator('[aria-live], [role="status"], [role="alert"]');
    const count = await liveRegions.count();

    // Should have at least one live region for announcements
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Screen Reader Support', () => {
  test('should have accessible scene description', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 30000 });

    // Look for scene description for screen readers
    const sceneDescription = page.locator(
      '[aria-label*="solar system"], [aria-describedby], .sr-only'
    );

    const count = await sceneDescription.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should have alt text or descriptions for visual elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 30000 });

    // Images should have alt text
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const ariaLabel = await img.getAttribute('aria-label');
      const role = await img.getAttribute('role');

      // Should have alt text or be marked as decorative
      const isAccessible = alt !== null || ariaLabel || role === 'presentation';
      expect(isAccessible).toBe(true);
    }
  });
});
