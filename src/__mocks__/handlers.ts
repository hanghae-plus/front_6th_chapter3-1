import { http, HttpResponse } from 'msw';

import { events } from '../__mocks__/response/events.json' assert { type: 'json' };
import { Event, EventForm } from '../types';

const eventsData = events as unknown as { events: Event[] };

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json(eventsData);
  }),

  http.post('/api/events', async ({ request }) => {
    const newEvent = (await request.json()) as EventForm;
    const eventWithId: Event = {
      id: crypto.randomUUID(),
      ...newEvent,
    };

    return HttpResponse.json(eventWithId, { status: 201 });
  }),

  http.put('/api/events/:id', async ({ params, request }) => {
    const { id } = params;
    const updateData = (await request.json()) as Partial<EventForm>;

    const eventIndex = eventsData.events.findIndex((event: Event) => event.id === id);

    if (eventIndex === -1) return new HttpResponse('존재하지 않는 이벤트입니다', { status: 404 });

    const updatedEvent: Event = {
      ...eventsData.events[eventIndex],
      ...updateData,
    };

    return HttpResponse.json(updatedEvent);
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;

    const eventIndex = eventsData.events.findIndex((event: Event) => event.id === id);

    if (eventIndex === -1) return new HttpResponse('존재하지 않는 이벤트입니다', { status: 404 });

    return new HttpResponse(null, { status: 204 });
  }),
];
