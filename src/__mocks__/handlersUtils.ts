import { http, HttpResponse } from 'msw';

import { Event } from '../types';
import { EventTestStore } from './testStore';

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.
// 간단한 테스트용 이벤트 데이터 생성
export const createTestEvent = (overrides: Partial<Event> = {}): Event => ({
  id: `test-${crypto.randomUUID()}-${Date.now()}`,
  title: '테스트 이벤트',
  date: '2025-08-21',
  startTime: '10:00',
  endTime: '11:00',
  description: '테스트 설명',
  location: '테스트 장소',
  category: '업무',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 10,
  ...overrides,
});

// MSW 핸들러를 특정 이벤트 데이터로 재설정
export const setupMockEvents = (initialEvents: Event[] = []) => {
  const store = new EventTestStore(initialEvents);

  return [
    // 고유한 테스트 ID를 포함한 엔드포인트
    http.get(`/api/events`, () => {
      return HttpResponse.json({ events: store.getAll() });
    }),

    http.post(`/api/events`, async ({ request }) => {
      const body = (await request.json()) as Omit<Event, 'id'>;
      const newEvent: Event = {
        id: `${Date.now()}-${Math.random()}`,
        ...body,
      };
      store.add(newEvent);
      return HttpResponse.json(newEvent, { status: 201 });
    }),

    http.put(`/api/events/:id`, async ({ params, request }) => {
      const { id } = params;
      const body = (await request.json()) as Partial<Event>;
      const updated = store.update(id as string, body);

      if (!updated) {
        return HttpResponse.text('Event not found', { status: 404 });
      }

      return HttpResponse.json(updated);
    }),

    http.delete(`/api/events/:id`, ({ params }) => {
      const { id } = params;
      const deleted = store.delete(id as string);

      if (!deleted) {
        return HttpResponse.text('Event not found', { status: 404 });
      }

      return HttpResponse.json({ id });
    }),
  ];
};

// 기존 함수명들 유지 - 간단한 구현
export const setupMockHandlerCreation = (initEvents = [] as Event[]) => {
  return setupMockEvents(initEvents);
};

export const setupMockHandlerUpdating = () => {
  // 수정 전용 핸들러 (기본 이벤트 포함)
  const defaultEvents = [createTestEvent()];
  return setupMockEvents(defaultEvents);
};

export const setupMockHandlerDeletion = () => {
  // 삭제 전용 핸들러 (기본 이벤트 포함)
  const defaultEvents = [createTestEvent()];
  return setupMockEvents(defaultEvents);
};
