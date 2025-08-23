import { http, HttpResponse } from 'msw';
import { randomUUID } from 'crypto';
import { Event } from '../types';

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.

/**
 * 병렬 테스트 문제 해결을 위해 각 테스트마다 독립된 핸들러를 생성합니다.
 *
 * 문제점:
 * - 기존 handlers.ts의 전역 events 배열은 모든 테스트에서 공유되는 문제가 있습니다.
 * - 병렬 실행 시 테스트 간섭으로 오류가 발생합니다.
 *
 * 해결 방안:
 * - 각 setup 함수에서 독립된 events 배열과 핸들러를 생성
 * - 테스트마다 격리된 환경 제공
 *
 */

export const setupMockHandlerCreation = (initEvents: Event[] = []) => {
  const events = JSON.parse(JSON.stringify(initEvents));

  return [
    http.get('/api/events', () => {
      return HttpResponse.json({ events });
    }),

    http.post('/api/events', async ({ request }) => {
      const json = (await request.json()) as Omit<Event, 'id'>;
      const event: Event = { ...json, id: randomUUID() };
      events.push(event);
      return HttpResponse.json(event, { status: 201 });
    }),
  ];
};

export const setupMockHandlerUpdating = (initEvents: Event[] = []) => {
  const events = JSON.parse(JSON.stringify(initEvents));

  return [
    http.get('/api/events', () => {
      return HttpResponse.json({ events });
    }),

    http.put('/api/events/:id', async ({ params, request }) => {
      const { id } = params;
      const updatedEventData = (await request.json()) as Omit<Event, 'id'>;

      const index = events.findIndex((event: Event) => event.id === id);
      if (index === -1) {
        return HttpResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      events[index] = { ...updatedEventData, id: id as string };
      return HttpResponse.json(events[index]);
    }),
  ];
};

export const setupMockHandlerDeletion = (initEvents: Event[] = []) => {
  const events = JSON.parse(JSON.stringify(initEvents));

  return [
    http.get('/api/events', () => {
      return HttpResponse.json({ events });
    }),

    http.delete('/api/events/:id', ({ params }) => {
      const { id } = params;

      const index = events.findIndex((event: Event) => event.id === id);
      if (index === -1) {
        return HttpResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      events.splice(index, 1);
      return HttpResponse.json({ status: 204 });
    }),
  ];
};
