import { setupServer } from 'msw/node';
import '@testing-library/jest-dom';

import { handlers, serverState } from './__mocks__/handlers';

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
  serverState.reset();
  vi.clearAllMocks();
});

afterAll(() => {
  vi.resetAllMocks();
  server.close();
});
