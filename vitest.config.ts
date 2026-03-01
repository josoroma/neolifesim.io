import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // Run in Node environment — engine tests must not depend on DOM/canvas
    environment: 'node',
    // Include test files matching this glob
    include: ['src/**/__tests__/**/*.test.ts'],
    // TypeScript path aliases matching tsconfig.json
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
