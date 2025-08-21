import { Event } from '../types';

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.

/** 전역 변수에 저장하면 모든 테스트에 간섭이 일어남. 순수함수 형태로.. */
export const setupMockHandlerCreation = (events: Event[] = [], newEvent?: Event) => {
  const mockEvents = events;
  if (newEvent) mockEvents.push(newEvent);

  return mockEvents;
};

export const setupMockHandlerUpdating = (events: Event[], updatedEvent: Event) => {
  const targetIndex = events.findIndex((event) => event.id === updatedEvent.id);
  if (targetIndex < 0) return events;

  const mockEvents = [...events];
  mockEvents.splice(targetIndex, 1, updatedEvent);

  return mockEvents;
};

export const setupMockHandlerDeletion = (events: Event[], deletedEvent: Event) => {
  const mockEvents = [...events];
  return mockEvents.filter((event) => event.id !== deletedEvent.id);
};
