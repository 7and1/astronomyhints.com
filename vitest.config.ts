import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: [
      'lib/__tests__/**/*.test.ts',
      'lib/__tests__/**/*.test.tsx',
      'components/__tests__/**/*.test.tsx',
      'store/__tests__/**/*.test.ts',
    ],
    exclude: ['node_modules', '.next'],
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: [
        'lib/**/*.ts',
        'lib/**/*.tsx',
        'store/**/*.ts',
      ],
      exclude: [
        'lib/__tests__/**',
        'lib/api-design.ts',
        'lib/index.ts',
        'lib/performance.ts',
        'lib/useTouchControls.ts',
        'lib/usePWA.ts',
        'store/__tests__/**',
        '**/*.d.ts',
      ],
      thresholds: {
        // Core library modules should have good coverage
        // 3D/WebGL components are tested via E2E
        lines: 50,
        functions: 50,
        branches: 50,
        statements: 50,
      },
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
