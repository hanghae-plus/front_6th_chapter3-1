import { setupServer } from 'msw/node';
import '@testing-library/jest-dom';

import { handlers } from './__mocks__/handlers';

/**
 * MSW 테스트 환경 설정
 *
 * 모든 테스트에서 일관된 mock 데이터를 제공
 *
 * beforeAll: 모든 테스트 실행 전에 한 번만 실행
 * beforeEach: 각 테스트 실행 전에 매번 실행
 * afterEach: 각 테스트 완료 후 매번 실행
 * afterAll: 모든 테스트 완료 후 한 번만 실행
 *
 * Q. assertion 조건은 왜 있을까?
 * A. 최소 한 개 이상의 expect(assertion)이 있어야 테스트가 실행되도록 강제
 * - 모든 테스트가 실제로 검증되는지 확인하기 위한 용도
 * - 실수로 return문을 빼먹거나 비동기 코드가 실행되지 않아도 통과되는걸 방지
 *
 * Q. 왜 vi.clearAllMocks() 와 vi.resetAllMocks() 두 가지 모두 사용할까?
 * A. 테스트 후 일관성 있는 테스트 환경을 유지
 * - vi.clearAllMocks() 는 mock 함수의 호출 기록을 초기화
 * - vi.resetAllMocks() 는 모든 mock을 완전히 초기화
 *
 * - clearAllMocks에 대한 보충 설명
 * 테스트 코드에서는 흔히 mockFn이 몇 번 불렸는지 어떤 인자로 불렸는지를 검증.
 * 그런데 만약 한 테스트에서 호출 기록이 쌓여 있고, 다음 테스트에서 그걸 안 지우면
 * → 다음 테스트도 이전 호출 기록을 그대로 물려받게 됨.그러면 실제로는 호출되지 않았는데도 “불린 것처럼” 보일 수 있음!..
 *
 * Q. 왜 resetHandlers()를 할까?
 * A. 테스트마다 특정 상황때문에 overwrite된 핸들러를 초기화 해줌!
 * - 이렇게 해야 다음 테스트가 기본 handlers 상태로 시작됨
 *
 * Q. 왜 vi.useFakeTimers() 를 사용할까?
 * A. 타이머 가짜 환경 설정,시간을 조작할 수 있는 준비
 *
 * Q. setSystemTime?
 * A. 가짜 시계를 특정 시점으로 고정
 * - useFakeTimers가 켜진 상태에서만 의미가 있음
 *
 * Q. 시간대 형식이 안 맞는 오류가 있어서
 */

/* msw */
export const server = setupServer(...handlers); //가짜 서버 생성 하고 handlers에 정의된 API 등록

beforeAll(() => {
  server.listen(); // 서버 시작해서 요청 받을 준비
  vi.useFakeTimers({ shouldAdvanceTime: true }); // shouldAdvnceTime: true 로 설정하면 타이머가 자동으로 진행됨
});

beforeEach(() => {
  expect.hasAssertions(); //최소 하나의 assertion이 있는지 확인, assertion 없으면 테스트 실패
  vi.setSystemTime(new Date('2025-10-01')); // 시간을 원하는 시점으로 고정
});

afterEach(() => {
  server.resetHandlers(); //MSW 핸들러를 초기화
  vi.clearAllMocks(); //특정 테스트 케이스에서 사용된 mock 함수 초기화
});

afterAll(() => {
  vi.resetAllMocks(); //모든 테스트 케이스에서 사용된 mock 함수 초기화
  vi.useRealTimers(); // 타이머 가짜 환경 설정 종료
  server.close(); //서버 종료
});
