import { http, HttpResponse } from 'msw';

import { Event } from '../types';
import { server } from '../setupTests';
import { randomUUID } from 'crypto';

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.
export const setupMockHandlerCreation = (initEvents = [] as Event[]) => {
  const mockEvents = [...initEvents];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),

    http.post<{ id: string }, Event>('/api/events', async ({ request }) => {
      const newEvent = await request.json();

      newEvent.id = randomUUID();
      mockEvents.push(newEvent);

      return HttpResponse.json(newEvent, { status: 201 });
    })
  );
};

export const setupMockHandlerUpdating = () => {
  const mockEvents = [
    {
      id: '1',
      title: '테스트 이벤트',
      date: '2025-01-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '테스트',
      location: '테스트 장소',
      category: '테스트',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),

    http.patch<{ id: string }, Event>('/api/events:id', async ({ params, request }) => {
      const { id } = params;

      const updatedEvent = await request.json();
      const eventIndex = mockEvents.findIndex((event) => event.id === id);
      if (eventIndex > -1) {
        const newEvents = {
          ...mockEvents[eventIndex],
          ...updatedEvent,
        };

        return HttpResponse.json(newEvents);
      } else {
        return HttpResponse.json({ error: 'Event not found' }, { status: 404 });
      }
    })
  );
};

export const setupMockHandlerDeletion = () => {
  const mockEvents = [
    {
      id: '1',
      title: '테스트 이벤트',
      date: '2025-01-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '테스트',
      location: '테스트 장소',
      category: '테스트',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),

    http.delete('/api/events/:id', ({ params }) => {
      const { id } = params;
      const deleteEvent = mockEvents.findIndex((event) => event.id !== id);

      return HttpResponse.json(deleteEvent, { status: 204 });
    })
  );
};
