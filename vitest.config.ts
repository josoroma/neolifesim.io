import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // Default: Node environment for engine tests (no DOM/canvas).
    // UI tests override per-file with `// @vitest-environment jsdom`.
    environment: 'node',
    // Include .ts engine tests AND .tsx UI tests across src/ and app/
    include: [
      'src/**/__tests__/**/*.test.ts',
      'src/**/__tests__/**/*.test.tsx',
      'app/**/__tests__/**/*.test.ts',
      'app/**/__tests__/**/*.test.tsx',
    ],
    // TypeScript path aliases matching tsconfig.json
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // CSS modules are stubbed in test — we only assert structure, not styles
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },
  },
});
