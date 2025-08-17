import { http, HttpResponse } from 'msw';
import { randomUUID } from 'crypto';
import { events } from '../__mocks__/response/events.json' assert { type: 'json' };
import { Event } from '../types';

let eventsDb = [...events] as Event[];

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export const handlers = [
  http.get('/api/events', () => {
    const eventData = events as Event[];

    return HttpResponse.json<Event[]>(eventData, {
      status: 200,
    });
  }),

  http.post('/api/events', async ({ request }) => {
    const newEvent = (await request.json()) as Omit<Event, 'id'>;
    const eventWithId = {
      id: randomUUID(),
      ...newEvent,
    } as Event;

    eventsDb.push(eventWithId);

    return HttpResponse.json(eventWithId, { status: 201 });
  }),

  http.put('/api/events/:id', async ({ params, request }) => {
    const { id } = params;
    const updatedEvent = (await request.json()) as Partial<Event>;

    const eventIndex = eventsDb.findIndex((e) => e.id === id);
    if (eventIndex > -1) {
      eventsDb[eventIndex] = { ...eventsDb[eventIndex], ...updatedEvent };
      return HttpResponse.json(eventsDb[eventIndex], { status: 201 });
    } else {
      return new HttpResponse('Event not found', { status: 404 });
    }
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;

    eventsDb = eventsDb.filter((e) => e.id !== id);

    return new HttpResponse('Event not found', { status: 204 });
  }),
];
