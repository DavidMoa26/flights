import { beforeAll, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Global test setup
beforeAll(() => {
  // Mock environment variables
  global.import = {
    meta: {
      env: {
        VITE_SERVICE_URL: 'http://localhost:4000'
      }
    }
  };

  // Mock console methods to reduce noise in tests
  global.console = {
    ...console,
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };

  // Mock window methods
  Object.defineProperty(window, 'location', {
    value: {
      href: 'http://localhost:3000',
      reload: vi.fn()
    },
    writable: true
  });

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock print function
  window.print = vi.fn();
});

// Clean up after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});