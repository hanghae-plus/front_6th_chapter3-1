import { http, HttpResponse } from 'msw';
import { randomUUID } from 'crypto';

import { server } from '../setupTests';
import { Event, EventForm } from '../types';
import { events } from '../__mocks__/response/events.json' assert { type: 'json' };

export const setupMockHandler = (initEvents = events) => {
  const testEvents = [...initEvents] as Event[];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: testEvents });
    }),

    http.post<never, EventForm, Event>('/api/events', async ({ request }) => {
      const newEvent = await request.json();
      const eventWithId: Event = {
        ...newEvent,
        id: randomUUID(),
      };
      testEvents.push(eventWithId);
      return HttpResponse.json(eventWithId, { status: 201 });
    }),

    http.put<{ id: string }, Event, Event>('/api/events/:id', async ({ params, request }) => {
      const { id } = params;
      const updatedEvent = await request.json();

      const index = testEvents.findIndex((event) => event.id === id);
      if (index !== -1) {
        testEvents[index] = { ...updatedEvent, id };
        return HttpResponse.json(testEvents[index]);
      }
      return new HttpResponse(null, { status: 404 });
    }),

    http.delete<{ id: string }>('/api/events/:id', ({ params }) => {
      const { id } = params;
      const index = testEvents.findIndex((event) => event.id === id);

      if (index !== -1) {
        testEvents.splice(index, 1);
        return new HttpResponse(null, { status: 204 });
      }
      return new HttpResponse(null, { status: 404 });
    })
  );
};

export const setupGetErrorHandler = () => {
  server.use(http.get('/api/events', () => HttpResponse.error()));
};

export const setupDeleteErrorHandler = (initEvents = events) => {
  const testEvents = [...initEvents] as Event[];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: testEvents });
    }),
    http.delete('/api/events/:id', () => HttpResponse.error())
  );
};
