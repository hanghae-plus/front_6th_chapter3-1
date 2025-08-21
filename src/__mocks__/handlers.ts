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

  http.post<{ id: string }, Event>('/api/events', async ({ request }) => {
    const newEvent = await request.json();
    newEvent.id = randomUUID();

    return HttpResponse.json(newEvent, { status: 201 });
  }),

  http.put<{ id: string }, Event>('/api/events/:id', async ({ params, request }) => {
    const { id } = params;
    const updatedEvent = await request.json();
    const eventIndex = events.findIndex((event) => event.id === id);

    if (eventIndex > -1) {
      const newEvents = { ...events[eventIndex], ...updatedEvent };

      return HttpResponse.json(newEvents);
    } else {
      return HttpResponse.json({ error: 'Event not found' }, { status: 404 });
    }
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;

    const deleteEvent = events.find((event) => event.id !== id);

    return HttpResponse.json(deleteEvent, { status: 204 });
  }),
];
