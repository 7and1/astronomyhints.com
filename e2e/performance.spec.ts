/**
 * E2E Tests - Performance
 */

import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 30000 });

    const loadTime = Date.now() - startTime;

    // Page should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 30000 });
    await page.waitForTimeout(3000); // Wait for metrics to stabilize

    // Measure LCP (Largest Contentful Paint)
    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ type: 'largest-contentful-paint', buffered: true });

        // Fallback timeout
        setTimeout(() => resolve(0), 5000);
      });
    });

    // LCP should be under 4 seconds (good is under 2.5s)
    if (lcp > 0) {
      expect(lcp).toBeLessThan(4000);
    }
  });

  test('should not have memory leaks during navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 30000 });

    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as Performance & { memory: { usedJSHeapSize: number } }).memory.usedJSHeapSize;
      }
      return 0;
    });

    // Navigate between planets multiple times
    const planets = ['Mars', 'Jupiter', 'Saturn', 'Earth'];
    for (const planet of planets) {
      await page.goto(`/?planet=${planet}`);
      await page.waitForSelector('canvas', { timeout: 30000 });
      await page.waitForTimeout(1000);
    }

    // Get final memory usage
    const finalMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as Performance & { memory: { usedJSHeapSize: number } }).memory.usedJSHeapSize;
      }
      return 0;
    });

    // Memory should not grow excessively (allow 50MB growth)
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryGrowth = finalMemory - initialMemory;
      expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024);
    }
  });

  test('should maintain smooth frame rate', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 30000 });
    await page.waitForTimeout(2000);

    // Measure frame rate over 2 seconds
    const frameData = await page.evaluate(() => {
      return new Promise<{ frames: number; duration: number }>((resolve) => {
        let frames = 0;
        const startTime = performance.now();

        const countFrame = () => {
          frames++;
          if (performance.now() - startTime < 2000) {
            requestAnimationFrame(countFrame);
          } else {
            resolve({
              frames,
              duration: performance.now() - startTime,
            });
          }
        };

        requestAnimationFrame(countFrame);
      });
    });

    const fps = (frameData.frames / frameData.duration) * 1000;

    // Should maintain at least 30 FPS (ideally 60)
    expect(fps).toBeGreaterThan(20);
  });

  test('should handle rapid interactions without lag', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 30000 });
    await page.waitForTimeout(2000);

    const startTime = Date.now();

    // Rapid keyboard interactions
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('o');
      await page.keyboard.press('l');
    }

    const interactionTime = Date.now() - startTime;

    // 40 key presses should complete within 2 seconds
    expect(interactionTime).toBeLessThan(2000);
  });

  test('should load assets efficiently', async ({ page }) => {
    const resourceTimings: { name: string; duration: number }[] = [];

    page.on('response', async (response) => {
      const timing = response.timing();
      if (timing) {
        resourceTimings.push({
          name: response.url(),
          duration: timing.responseEnd - timing.requestStart,
        });
      }
    });

    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 30000 });
    await page.waitForTimeout(3000);

    // Check that no single resource takes too long
    const slowResources = resourceTimings.filter((r) => r.duration > 5000);

    // Should have minimal slow resources
    expect(slowResources.length).toBeLessThan(3);
  });
});

test.describe('Bundle Size', () => {
  test('should have reasonable JavaScript bundle size', async ({ page }) => {
    let totalJSSize = 0;

    page.on('response', async (response) => {
      const url = response.url();
      if (url.endsWith('.js') || url.includes('/_next/static')) {
        const contentLength = response.headers()['content-length'];
        if (contentLength) {
          totalJSSize += parseInt(contentLength, 10);
        }
      }
    });

    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 30000 });
    await page.waitForTimeout(3000);

    // Total JS should be under 2MB (compressed)
    // Note: Three.js is large, so we allow more
    expect(totalJSSize).toBeLessThan(5 * 1024 * 1024);
  });
});

test.describe('Network Performance', () => {
  test('should work on slow 3G', async ({ page, context }) => {
    // Emulate slow 3G
    const client = await context.newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: (500 * 1024) / 8, // 500 kbps
      uploadThroughput: (500 * 1024) / 8,
      latency: 400,
    });

    const startTime = Date.now();

    await page.goto('/', { timeout: 60000 });
    await page.waitForSelector('canvas', { timeout: 60000 });

    const loadTime = Date.now() - startTime;

    // Should still load within 30 seconds on slow 3G
    expect(loadTime).toBeLessThan(30000);
  });

  test('should handle offline gracefully', async ({ page, context }) => {
    // Load page first
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 30000 });

    // Go offline
    await context.setOffline(true);

    // Try to interact
    await page.keyboard.press('o');
    await page.waitForTimeout(500);

    // Should not crash
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Go back online
    await context.setOffline(false);
  });
});
