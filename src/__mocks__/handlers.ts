import { randomUUID } from 'crypto';

import { http, HttpResponse } from 'msw';

import { events as initialEvents } from '../__mocks__/response/events.json' assert { type: 'json' };
import type { Event } from '../types';

let events = [...initialEvents];

export const resetEvents = () => {
  events = [...initialEvents];
};

export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json({ events });
  }),

  http.post('/api/events', async ({ request }) => {
    const newEvent = (await request.json()) as Event;
    newEvent.id = randomUUID();

    events = [...events, newEvent];

    return HttpResponse.json(newEvent, { status: 201 });
  }),

  http.put('/api/events/:id', async ({ params, request }) => {
    const { id } = params;

    const index = events.findIndex((event) => event.id === id);
    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    const updatedEvent = (await request.json()) as Event;
    events[index] = { ...events[index], ...updatedEvent };

    return HttpResponse.json(events[index]);
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;

    const index = events.findIndex((event) => event.id === id);
    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    events.splice(index, 1);

    return new HttpResponse(null, { status: 204 });
  }),
];
