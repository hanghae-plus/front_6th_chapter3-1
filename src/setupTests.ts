import { setupServer } from 'msw/node';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

import { handlers } from './__mocks__/handlers';
import { setupMockHandler } from './__mocks__/handlersUtils';

/* msw */
export const server = setupServer(...handlers);

beforeAll(() => {
  server.listen();
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

beforeEach(() => {
  expect.hasAssertions();
  setupMockHandler();
});

afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});

afterAll(() => {
  vi.resetAllMocks();
  vi.useRealTimers();
  server.close();
});
