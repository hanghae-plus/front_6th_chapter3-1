import { http, HttpResponse } from 'msw';

import { events } from '../__mocks__/response/events.json' assert { type: 'json' };
import { Event } from '../types';

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json({ events }, { status: 200 });
  }),

  http.post('/api/events', async ({ request }) => {
    // post요청시 기존 데이터에서 +1된 id값을 포함하여 request 데이터 반환.
    const requestJson = (await request.json()) as Event;
    requestJson.id = String(events.length + 1);
    return HttpResponse.json(requestJson, { status: 201 });
  }),

  http.put('/api/events/:id', async ({ params, request }) => {
    // put요청시 기존 데이터에서 :id에 해당하는 데이터를 요청한 값으로 변경
    const requestJson = (await request.json()) as Event;
    const findIndex = events.findIndex((event) => event.id === params.id);

    if (findIndex !== -1) {
      const updateEvents = events.map((event) => (event.id === params.id ? requestJson : event));
      return HttpResponse.json(updateEvents, { status: 200 });
    }
    return HttpResponse.json(null, { status: 404 });
  }),

  http.delete('/api/events/:id', ({ params }) => {
    // delete요청시 기존 데이터에서 :id에 해당하는 데이터를 제거
    const findIndex = events.findIndex((event) => event.id === params.id);

    if (findIndex !== -1) {
      events.splice(findIndex, 1);
      return HttpResponse.json(null, { status: 200 });
    }
    return HttpResponse.json(null, { status: 404 });
  }),
];
