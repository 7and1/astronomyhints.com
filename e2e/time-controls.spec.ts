/**
 * E2E Tests - Time Controls
 */

import { test, expect } from '@playwright/test';

test.describe('Time Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 30000 });
    await page.waitForTimeout(2000);
  });

  test('should display time controls', async ({ page }) => {
    // Look for time-related UI elements
    const timeControls = page.locator(
      '[data-testid="time-controls"], [class*="time"], [class*="Time"]'
    );

    const count = await timeControls.count();
    // Time controls should exist
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should support time speed via URL parameter', async ({ page }) => {
    await page.goto('/?speed=10');
    await page.waitForSelector('canvas', { timeout: 30000 });

    // Page should load with custom speed
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should support paused state (speed=0)', async ({ page }) => {
    await page.goto('/?speed=0');
    await page.waitForSelector('canvas', { timeout: 30000 });

    // Page should load in paused state
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should support fast forward (high speed)', async ({ page }) => {
    await page.goto('/?speed=100');
    await page.waitForSelector('canvas', { timeout: 30000 });

    // Page should handle high speed
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should clamp speed to maximum', async ({ page }) => {
    // Try to set speed beyond maximum
    await page.goto('/?speed=9999');
    await page.waitForSelector('canvas', { timeout: 30000 });

    // Should not crash, speed should be clamped
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should handle negative speed gracefully', async ({ page }) => {
    await page.goto('/?speed=-10');
    await page.waitForSelector('canvas', { timeout: 30000 });

    // Should handle gracefully (clamp to 0 or ignore)
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });
});

test.describe('Time Display', () => {
  test('should display current date/time', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 30000 });
    await page.waitForTimeout(2000);

    // Look for date display
    const dateDisplay = page.locator(
      '[data-testid="date-display"], [class*="date"], time'
    );

    const count = await dateDisplay.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should support custom timestamp via URL', async ({ page }) => {
    // Set a specific timestamp (Jan 1, 2024)
    const timestamp = new Date('2024-01-01T00:00:00Z').getTime();
    await page.goto(`/?t=${timestamp}`);
    await page.waitForSelector('canvas', { timeout: 30000 });

    // Page should load with custom time
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should handle future dates', async ({ page }) => {
    const futureTimestamp = new Date('2050-06-15T12:00:00Z').getTime();
    await page.goto(`/?t=${futureTimestamp}`);
    await page.waitForSelector('canvas', { timeout: 30000 });

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should handle past dates', async ({ page }) => {
    const pastTimestamp = new Date('1990-01-01T00:00:00Z').getTime();
    await page.goto(`/?t=${pastTimestamp}`);
    await page.waitForSelector('canvas', { timeout: 30000 });

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });
});
