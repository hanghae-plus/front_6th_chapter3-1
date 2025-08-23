import { http, HttpResponse } from 'msw';
import { randomUUID } from 'crypto';

import { events } from '../__mocks__/response/events.json' assert { type: 'json' };
import { Event } from '../types';

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export const handlers = [
  // [GET] /api/events
  http.get('/api/events', () => {
    return HttpResponse.json({ events });
  }),

  // [POST] /api/events
  http.post('/api/events', async ({ request }) => {
    const json = (await request.json()) as Omit<Event, 'id'>;
    const id = randomUUID();
    const event: Event = {
      ...json,
      id,
    };
    events.push(event);
    return HttpResponse.json(event, { status: 201 });
  }),

  // [PUT] /api/events/:id
  http.put('/api/events/:id', async ({ params, request }) => {
    const { id } = params;
    const updatedEvent = (await request.json()) as Omit<Event, 'id'>;

    const index = events.findIndex((event) => event.id === id);
    if (index === -1) {
      return HttpResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    events[index] = { ...updatedEvent, id: id as string };
    return HttpResponse.json(events[index]);
  }),

  // [DELETE] /api/events/:id
  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;

    const index = events.findIndex((event) => event.id === id);
    if (index === -1) {
      return HttpResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    events.splice(index, 1);
    return HttpResponse.json({ status: 204 });
  }),
];
