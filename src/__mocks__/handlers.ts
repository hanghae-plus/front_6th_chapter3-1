import { randomUUID } from 'crypto';

import { http, HttpResponse } from 'msw';

import { events } from '../__mocks__/response/events.json' assert { type: 'json' };
import { Event } from '../types';

const eventsData = [...events];

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json({ events: eventsData });
  }),

  http.post('/api/events', async ({ request }) => {
    const newEvent = (await request.json()) as Omit<Event, 'id'>;
    const createdEvent = { id: randomUUID(), ...newEvent } as Event;
    eventsData.push(createdEvent);
    return HttpResponse.json(createdEvent, { status: 201 });
  }),

  http.put('/api/events/:id', async ({ params, request }) => {
    const { id } = params;
    const updateEvent = (await request.json()) as Partial<Event>;

    const eventIndex = eventsData.findIndex((event) => event.id === id);
    if (eventIndex === -1) {
      return HttpResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    eventsData[eventIndex] = { ...eventsData[eventIndex], ...updateEvent };
    return HttpResponse.json(eventsData[eventIndex]);
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;

    const eventIndex = eventsData.findIndex((event) => event.id === id);
    if (eventIndex === -1) {
      return HttpResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    eventsData.splice(eventIndex, 1);
    return HttpResponse.json(null, { status: 204 });
  }),
];
