import { setupServer } from 'msw/node';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

import { handlers, resetEvents } from './__mocks__/handlers';

/* msw */
export const server = setupServer(...handlers);

beforeAll(() => {
  server.listen();
});

beforeEach(() => {
  expect.hasAssertions();
});

afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
  resetEvents(); // Reset the mock data after each test
});

afterAll(() => {
  vi.resetAllMocks();
  server.close();
});
