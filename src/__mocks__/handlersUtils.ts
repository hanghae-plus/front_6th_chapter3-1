import { randomUUID } from 'crypto';
import { http, HttpResponse } from 'msw';
import { Event } from '../types';

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.
// 유즈케이스: [] -> 테스트를 돌린다 -> [{}]
export const setupMockHandlerCreation = (initEvents = [] as Event[]) => {
  const events = initEvents;

  return [
    http.get('/api/events', () => {
      return HttpResponse.json({ events });
    }),

    http.post('/api/events', async ({ request }) => {
      const newEventBody = await request.clone().json();
      const newEvent = { id: randomUUID(), ...newEventBody } as Event;
      events.push(newEvent);

      return HttpResponse.json(newEvent, { status: 201 });
    }),
  ];
};

// 유즈케이스: [{A}] -> 테스트를 돌린다 -> [{B}]
export const setupMockHandlerUpdating = () => {
  const events: Event[] = [
    {
      id: '1',
      title: '바꾸기 전 이벤트',
      date: '2025-08-30',
      description: '변경 테스트 입니다.',
      startTime: '18:30',
      endTime: '21:30',
      category: '가족',
      location: '서울 강남구',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1440,
    },
  ];

  return [
    http.get('/api/events', () => {
      return HttpResponse.json({ events });
    }),

    http.put('/api/events/:id', async ({ params, request }) => {
      const newEventBody = await request.clone().json();
      const { id } = params;
      const eventIndex = events.findIndex((e) => e.id === id);
      if (eventIndex > -1) {
        events[eventIndex] = { ...events[eventIndex], ...newEventBody };
        return HttpResponse.json(events[eventIndex]);
      } else {
        return new HttpResponse('Event not found', { status: 404 });
      }
    }),
  ];
};

// 유즈케이스: [{A}] -> 테스트를 돌린다 -> []
export const setupMockHandlerDeletion = () => {
  const events: Event[] = [
    {
      id: '1',
      title: '지울 이벤트',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '변경 테스트 입니다.',
      category: '가족',
      location: '서울 강남구',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1440,
    },
  ];

  return [
    http.get('/api/events', () => {
      return HttpResponse.json({ events });
    }),

    http.delete('/api/events/:id', ({ params }) => {
      const { id } = params;

      events.splice(
        events.findIndex((e) => e.id === id),
        1
      );
      return new HttpResponse(null, { status: 204 });
    }),
  ];
};
