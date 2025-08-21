import { http, HttpResponse } from 'msw';

import { server } from '../setupTests';
import { Event } from '../types';

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.
export const setupMockHandlerCreation = (initEvents = [] as Event[]) => {
  const events = [...initEvents];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: events });
    }),
    http.post('/api/events', async ({ request }) => {
      const newEvent = (await request.json()) as Event;
      newEvent.id = String(events.length + 1);
      events.push(newEvent);
      return HttpResponse.json(newEvent, { status: 201 });
    })
  );
};

export const setupMockHandlerUpdating = () => {
  const events: Event[] = [
    {
      id: '1',
      title: '수정테스트입니당',
      date: '2025-10-17',
      startTime: '09:00',
      endTime: '10:00',
      description: '수정하기~',
      location: '항해 젭',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '수정테스트입니당2',
      date: '2025-10-17',
      startTime: '09:00',
      endTime: '10:00',
      description: '수정안하기~',
      location: '서울 어딘가',
      category: '가족',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 120,
    },
  ];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events });
    }),
    http.put('/api/events/:id', async ({ params, request }) => {
      const updatedEvent = (await request.json()) as Event;
      const index = events.findIndex((event) => event.id === params.id);

      if (index === -1) {
        return new HttpResponse(null, { status: 404 });
      }

      events[index] = { ...events[index], ...updatedEvent };
      return HttpResponse.json(events[index]);
    })
  );
};

export const setupMockHandlerDeletion = () => {
  const events: Event[] = [
    {
      id: '1',
      title: '삭제테스트입니당',
      date: '2025-10-17',
      startTime: '09:00',
      endTime: '10:00',
      description: '삭제하기~',
      location: '항해 젭',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '삭제테스트입니당2',
      date: '2025-10-17',
      startTime: '09:00',
      endTime: '10:00',
      description: '삭제안하기~',
      location: '서울 어딘가',
      category: '가족',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 120,
    },
  ];
  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events });
    }),
    http.delete('/api/events/:id', ({ params }) => {
      const index = events.findIndex((event) => event.id === params.id);

      if (index === -1) {
        return new HttpResponse(null, { status: 404 });
      }

      events.splice(index, 1);
      return new HttpResponse(null, { status: 204 });
    })
  );
};
