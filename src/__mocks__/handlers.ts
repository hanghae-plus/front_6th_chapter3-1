import { http, HttpResponse } from 'msw';

import { events } from '../__mocks__/response/events.json' assert { type: 'json' };
import { Event } from '../types';

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export const handlers = [
  http.get('/api/events', () => {
    // 조회
    // status 값을 생략하면 명시적으로 200
    return HttpResponse.json({ events });
  }),

  http.post('/api/events', async ({ request }) => {
    // 생성

    try {
      const newEvents = (await request.json()) as Event;
      newEvents.id = String(events.length + 1); // id 타입이 string
      events.push(newEvents);

      return HttpResponse.json({ newEvents }, { status: 201 });
    } catch (err) {
      return HttpResponse.json({ error: '이벤트 생성에 실패했습니다.' }, { status: 400 });
    }
  }),

  http.put('/api/events/:id', async ({ params, request }) => {
    // 업데이트
    const { id } = params;
    const updateEvent = (await request.json()) as Event;
    const index = events.findIndex((event) => event.id === id); // 업데이트할 이벤트 찾기

    if (index !== -1) {
      // 수정하고자 하는 이벤트가 (findIndex로) 잘 찾아졌으면
      return HttpResponse.json({ ...events[index], ...updateEvent }, { status: 200 });
    }

    // 수정하고자 하는 이벤트가 없으면
    return HttpResponse.json(null, { status: 404 });
  }),

  http.delete('/api/events/:id', ({ params }) => {
    // 삭제

    const { id } = params;
    const index = events.findIndex((event) => event.id === id); // 삭제할 이벤트 찾기
    if (index !== -1) {
      // 삭제하고자 하는 이벤트가 잘 찾아졌으면
      return HttpResponse.json(null, { status: 204 });
    }

    // 삭제하고자 하는 이벤트가 없으면
    return HttpResponse.json(null, { status: 404 });
  }),
];
