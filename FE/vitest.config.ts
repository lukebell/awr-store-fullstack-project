import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: false, // Disable CSS processing for faster tests
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        useAtomics: true,
      },
    },
    // Optimize coverage collection
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.tsx',
        '**/*.test.ts',
        'src/api/generated/**',
      ],
    },
    // Speed up tests by reducing overhead
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
  },
});
