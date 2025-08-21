import { randomUUID } from 'crypto';

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
    const body = (await request.json()) as Omit<Event, 'id'>;
    const newEvent: Event = { id: randomUUID(), ...body };

    events.push(newEvent);

    return HttpResponse.json(newEvent, { status: 201 });
  }),

  http.put('/api/events/:id', async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as Partial<Event>;
    const index = events.findIndex((e) => e.id === id);

    if (index === -1) {
      return HttpResponse.text('Event not found', { status: 404 });
    }

    events[index] = { ...events[index], ...body };

    return HttpResponse.json(events[index]);
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;
    const index = events.findIndex((e) => e.id === id);

    if (index === -1) {
      return HttpResponse.text('Event not found', { status: 404 });
    }

    events.splice(index, 1);

    return HttpResponse.json({ id });
  }),
];
