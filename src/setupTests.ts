import { setupServer } from 'msw/node';
import '@testing-library/jest-dom';

import { handlers } from './__mocks__/handlers';

/* msw */
export const server = setupServer(...handlers);

beforeAll(() => {
  server.listen();
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

beforeEach(() => {
  expect.hasAssertions();
  vi.setSystemTime(new Date('2025-10-01')); // events 데이터가 2025-10-15 기준으로 작성되어 있음
});

afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});

// 문제점 발견 : handler만 초기화 해서 events 데이터는 공유되어버림
afterAll(() => {
  vi.resetAllMocks();
  vi.useRealTimers();
  server.close();
});
