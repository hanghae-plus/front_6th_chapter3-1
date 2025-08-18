import { http, HttpResponse } from 'msw';
import { randomUUID } from 'crypto';

import { events } from '../__mocks__/response/events.json' assert { type: 'json' };
import { Event } from '../types';

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.

const serverState = { events };

export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json({ events: serverState.events });
  }),

  http.post('/api/events', async ({ request }) => {
    const events = serverState.events;
    const newEventBody = await request.clone().json();
    const newEvent = { id: randomUUID(), ...newEventBody } as Event;
    serverState.events = [...events, newEvent];

    return HttpResponse.json(newEvent, { status: 201 });
  }),

  http.put('/api/events/:id', async ({ params, request }) => {
    const events = serverState.events;
    const newEventBody = await request.clone().json();
    const { id } = params;
    const eventIndex = events.findIndex((e) => e.id === id);
    if (eventIndex > -1) {
      const newEvents = [...events];
      newEvents[eventIndex] = { ...events[eventIndex], ...newEventBody };

      serverState.events = newEvents;
      return HttpResponse.json(events[eventIndex]);
    } else {
      return new HttpResponse('Event not found', { status: 404 });
    }
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const events = serverState.events;
    const { id } = params;

    serverState.events = events.filter((e) => e.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),
];
