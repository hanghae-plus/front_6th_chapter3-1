import { http, HttpResponse } from 'msw';

import { Event } from '../types';

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.

export const createMockHandlers = (initialEvents: Event[] = []) => {
  return () => {
    let mockEvents: Event[] = structuredClone(initialEvents);

    return [
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents }, { status: 200 });
      }),

      http.post('/api/events', async ({ request }) => {
        const newEvent = (await request.json()) as Omit<Event, 'id'>;
        const eventWithId: Event = {
          ...newEvent,
          id: Date.now().toString(),
        };
        mockEvents.push(eventWithId);
        return HttpResponse.json(
          {
            success: true,
            event: eventWithId,
            message: '일정이 성공적으로 추가되었습니다.',
          },
          { status: 201 }
        );
      }),

      http.put('/api/events/:id', async ({ request, params }) => {
        const updatedEvent = (await request.json()) as Partial<Event>;
        const index = mockEvents.findIndex((event) => event.id === params.id);

        if (index === -1) {
          return HttpResponse.json({ error: '이벤트를 찾을 수 없습니다.' }, { status: 404 });
        }

        mockEvents[index] = { ...mockEvents[index], ...updatedEvent, id: params.id as string };
        return HttpResponse.json(
          {
            success: true,
            event: mockEvents[index],
            message: '일정이 성공적으로 수정되었습니다.',
          },
          { status: 200 }
        );
      }),

      http.delete('/api/events/:id', ({ params }) => {
        const index = mockEvents.findIndex((event) => event.id === params.id);

        if (index === -1) {
          return HttpResponse.json({ error: '이벤트를 찾을 수 없습니다.' }, { status: 404 });
        }

        const [deletedEvent] = mockEvents.splice(index, 1);
        return HttpResponse.json({ event: deletedEvent }, { status: 200 });
      }),
    ];
  };
};
