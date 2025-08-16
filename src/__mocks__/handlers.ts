import { http, HttpResponse } from 'msw';

import { events } from '../__mocks__/response/events.json' assert { type: 'json' };
import { Event } from '../types';

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json({ events });
  }),

  http.post('/api/events', async ({ request }) => {
    const event = (await request.json()) as Event;
    event.id = String(events.length + 1);
    return HttpResponse.json(event, { status: 201 });
  }),

  http.put('/api/events/:id', async ({ params, request }) => {
    const event = (await request.json()) as Event;
    const index = events.findIndex((event) => event.id === params.id);

    if (index !== -1) {
      return HttpResponse.json({ ...events[index], ...event });
    }

    return new HttpResponse(null, { status: 404 });
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const index = events.findIndex((event) => event.id === params.id);

    if (index !== -1) {
      return new HttpResponse(null, { status: 204 });
    }

    return new HttpResponse(null, { status: 404 });
  }),
];
