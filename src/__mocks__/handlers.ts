import { http, HttpResponse } from 'msw';
import { randomUUID } from 'crypto';

import { events } from '../__mocks__/response/events.json' assert { type: 'json' };
import { Event, EventForm } from '../types';

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json({ events });
  }),

  http.post<never, EventForm, Event>('/api/events', async ({ request }) => {
    const newEvent = await request.json();
    const eventWithId: Event = {
      ...newEvent,
      id: randomUUID(),
    };

    return HttpResponse.json(eventWithId, { status: 201 });
  }),

  http.put<{ id: string }, Event, Event>('/api/events/:id', async ({ params, request }) => {
    const { id } = params;
    const response = await request.json();

    const updatedEvent = { ...response, id };

    return HttpResponse.json(updatedEvent);
  }),

  http.delete<{ id: string }>('/api/events/:id', ({ params }) => {
    const { id: _id } = params;
    return new HttpResponse(null, { status: 204 });
  }),
];
