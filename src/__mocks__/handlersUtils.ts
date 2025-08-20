import { Event } from '../types';

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.

/**
 * handlersUtils.ts
 * - 테스트별로 다른 응답을 반환할 수 있도록 핸들러 동적 설정
 * - 각 테스트에서 독립적인 mock 데이터를 사용해 테스트가 병렬로 실행될때 데이터 충돌을 방지
 */

export const setupMockHandlerCreation = (initEvents = [] as Event[]) => {};

export const setupMockHandlerUpdating = () => {};

export const setupMockHandlerDeletion = () => {};
