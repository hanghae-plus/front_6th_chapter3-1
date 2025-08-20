import { setupServer } from 'msw/node';
import '@testing-library/jest-dom';

import { handlers } from './__mocks__/handlers';

// ! Hard 여기 제공 안함
/* msw */
export const server = setupServer(...handlers);

vi.stubEnv('TZ', 'UTC');

beforeAll(() => {
  server.listen();
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

beforeEach(() => {
  expect.hasAssertions(); // ? Med: 이걸 왜 써야하는지 물어보자
  // 목적 : 테스트가 실제로 assertion을 실행했는지 확인하기 위함
  // 즉 테스트가 아무 검증 없이 통과하는 것을 방지한다.

  vi.setSystemTime(new Date('2025-10-01')); // ? Med: 이걸 왜 써야하는지 물어보자
  // 목적 : 테스트 환경의 시스템 시간을 고정하여 모든 테스트가 동일한 시간 기준으로 실행하기 위함
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
