import { setupServer } from 'msw/node';
import '@testing-library/jest-dom';

import { handlers, serverState } from './__mocks__/handlers';

/* msw */
export const server = setupServer(...handlers);

beforeAll(() => {
  server.listen();
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

beforeEach(() => {
  expect.hasAssertions();
  vi.setSystemTime(new Date());
});

afterEach(() => {
  server.resetHandlers();
  serverState.reset();
  vi.clearAllMocks();
});

afterAll(() => {
  vi.resetAllMocks();
  vi.useRealTimers();
  server.close();
});
