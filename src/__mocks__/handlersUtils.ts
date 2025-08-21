import { Event } from '../types';
import { http, HttpResponse } from 'msw';

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.

// 어떻게 하면 상태 격리와 인스턴스 격리를 만족하는 유틸을 작성할까!
export const createMockHandlers = (initEvents = [] as Event[]) => {
  let testEvents = [...initEvents];

  const handlers = [
    http.get('/api/events', () => {
      return HttpResponse.json({ events: testEvents });
    }),

    http.post('/api/events', async ({ request }) => {
      const event = (await request.json()) as Event;
      const newEvent = { ...event, id: crypto.randomUUID() };
      testEvents.push(newEvent);
      return HttpResponse.json(newEvent);
    }),

    http.put('/api/events/:id', async ({ request, params }) => {
      const event = (await request.json()) as Event;
      const { id } = params;
      testEvents = testEvents.map((e) => (e.id === id ? event : e));
      return HttpResponse.json(event);
    }),

    http.delete('/api/events/:id', async ({ params }) => {
      const { id } = params;
      testEvents = testEvents.filter((event) => event.id !== id);
      return HttpResponse.json(id);
    }),
  ];

  const getEvents = () => {
    return testEvents;
  };

  const reset = () => {
    testEvents = [...initEvents];
  };

  return { handlers, reset, getEvents };
};
