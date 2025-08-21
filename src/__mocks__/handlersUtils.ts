import { http, HttpResponse } from 'msw';
import { randomUUID } from 'crypto';

import { server } from '../setupTests';
import { Event } from '../types';
import { events } from '../__mocks__/response/events.json' assert { type: 'json' };

export const setupMockHandlerCreation = (initEvents = [] as Event[]) => {
  const testEvents = initEvents;

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: testEvents });
    }),
    http.post<{ id: string }, Event, Event>('/api/events', async ({ request }) => {
      const newEvent = await request.json();
      const eventWithId: Event = {
        ...newEvent,
        id: randomUUID(),
      };
      testEvents.push(eventWithId);
      return new HttpResponse(eventWithId, { status: 201 });
    })
  );
};

export const setupMockHandlerUpdating = () => {
  const testEvents = [...events];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: testEvents });
    }),
    http.put<{ id: string }, Event, Event>('/api/events/:id', async ({ params, request }) => {
      const { id } = params;
      const response = (await request.json()) as Event;

      const index = testEvents.findIndex((event) => event.id === id);
      if (index !== -1) {
        const updatedEvent: Event = { ...response, id };
        testEvents[index] = updatedEvent;
        return HttpResponse.json(updatedEvent);
      }
      return new HttpResponse(null, { status: 404 });
    })
  );
};

export const setupMockHandlerDeletion = () => {
  const testEvents = [...events];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: testEvents });
    }),
    http.delete<{ id: string }>('/api/events/:id', async ({ params }) => {
      const { id } = params;
      const index = testEvents.findIndex((event) => event.id === id);

      if (index !== -1) {
        testEvents.splice(index, 1);
        return HttpResponse.json(null, { status: 204 });
      }

      return HttpResponse.json(null, { status: 404 });
    })
  );
};
