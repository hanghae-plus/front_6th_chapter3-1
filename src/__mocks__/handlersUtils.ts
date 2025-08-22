import { http, HttpResponse } from 'msw';

import { server } from '../setupTests';
import { Event } from '../types';

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다.
// 이를 위한 제어가 필요할 것 같은데요.
// 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?

// ! 아래 이름을 사용하지 않아도 되니,
// 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요.
// 그리고 이 로직을 PR에 설명해주세요....

let events: Event[] = [];

export const setupMockHandlerCreation = (initEvents = [] as Event[]) => {
  events = [...initEvents];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events });
    }),
    http.post('/api/events', async ({ request }) => {
      try {
        const newEvents = (await request.json()) as Event;
        newEvents.id = String(events.length + 1);
        events.push(newEvents);

        return HttpResponse.json({ newEvents }, { status: 201 });
      } catch (error) {
        console.error(error);
        return HttpResponse.json({ error: '이벤트 생성에 실패했습니다.' }, { status: 400 });
      }
    })
  );
};

export const setupMockHandlerUpdating = () => {
  events = [
    {
      id: '1',
      title: '오프 코치 8주차 발제',
      date: '2025-08-23',
      startTime: '15:00',
      endTime: '17:00',
      description: '정신 단단히 차리기',
      location: '역삼 아이콘 빌딩',
      category: '항해',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '귀멸의 칼날:무한성',
      date: '2025-08-23',
      startTime: '19:10',
      endTime: '21:50',
      description: '귀칼 스레드 모임',
      location: '강남 cgv',
      category: '영화',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events });
    }),
    // update
    http.put('/api/events/:id', async ({ params, request }) => {
      const { id } = params;
      const updateEvent = (await request.json()) as Event;
      const index = events.findIndex((event) => event.id === id);

      if (index > -1) {
        events[index] = { ...events[index], ...updateEvent };
        return HttpResponse.json({ ...events[index], ...updateEvent }, { status: 200 });
      }

      return HttpResponse.json(null, { status: 404 });
    })
  );
};

export const setupMockHandlerDeletion = () => {
  events = [
    {
      id: '1',
      title: '카토멘 라멘 집 가기',
      date: '2025-08-23',
      startTime: '11:00',
      endTime: '12:00',
      description: '하늘,의찬,홍준,소희,나 토마토라멘 먹기',
      location: '선릉',
      category: '점심',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events });
    }),
    http.delete('/api/events/:id', ({ params }) => {
      const { id } = params;
      events.filter((event) => event.id !== id);

      return HttpResponse.json(null, { status: 404 });
    })
  );
};
