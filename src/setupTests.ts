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
  expect.hasAssertions();
  // ? Med: 이걸 왜 써야하는지 물어보자
  // Jest 테스트 프레임워크에서 각 테스트가 실행되기 전에 최소한 하나의 expect 단언이 호출되었는지 확인하는 설정
  // 테스트 검증 강화: 각 테스트 케이스에서 최소한 한 번의 단언(assertion)이 실행되었음을 보장하여, 테스트 코드가 의도한 검증을 포함하고 있는지 확인합니다.
  // 오류 방지: 아무런 expect 호출 없이 테스트가 통과되는 것을 방지하여, 코드의 잠재적 버그나 잘못된 테스트 로직을 조기에 발견하도록 돕습니다.
  // 테스트 독립성 유지: beforeEach 함수는 각 테스트가 독립적인 환경에서 실행되도록 보장하며, `expect.hasAssertions()`를 추가함으로써 테스트가 제대로 진행되는지 추가적으로 확인합니다.

  vi.setSystemTime(new Date('2025-10-01'));
  // ? Med: 이걸 왜 써야하는지 물어보자
  // 현재 날짜를 전달된 날짜로 정의함
  // 시간을 고정하면 일관된 환경에서 테스트 가능
  //  -> (시간의 흐름으로) 실시간 변경으로 인해 테스트 시간 변동을 처리하도록 설계되지 않은 경우 간헐적으로 실패할 수 있음
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
