import { http, HttpResponse } from 'msw';

import { events } from '../__mocks__/response/events.json' assert { type: 'json' };
import { Event } from '../types';
import { randomUUID } from 'crypto';

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export const handlers = [
  http.get('/api/events', () => {
    console.log('handlers events', events);
    return HttpResponse.json(events);
  }),

  http.post('/api/events', async ({ request }) => {
    console.log('handlers post', request);
    const req = request.json();
    const newEvent = await {id: randomUUID(), ...req} as Event;
    return HttpResponse.json(newEvent);
  }),

  http.put('/api/events/:id', async ({ params, request }) => {
    console.log('handlers put', params, request);
    const reqs = await request.json() as Event[];
    const selctedIndex = reqs.findIndex((item) => item.id === params.id);
    if (selctedIndex > -1) {
      const newEvents = [...reqs];
      newEvents[selctedIndex] = { ...newEvents[selctedIndex], ...reqs[selctedIndex] };
      return HttpResponse.json(newEvents[selctedIndex]);
    }
    return HttpResponse.json(null, { status: 404 });
  }),

  http.delete('/api/events/:id', ({ params }) => {
    console.log('handlers delete', params);
    const { id } = params;
    events.filter((item) => item.id !== id);
    return new Response(null, { status: 204 });
  }),
];
