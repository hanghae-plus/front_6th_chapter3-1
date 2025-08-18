import { http, HttpResponse } from 'msw';
import { randomUUID } from 'crypto';

import { events } from '../__mocks__/response/events.json' assert { type: 'json' };
import { Event } from '../types';

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json(
      { events },
      {
        status: 200,
      }
    );
  }),

  http.post('/api/events', async ({ request }) => {
    const requestJson = (await request.json()) as Omit<Event, 'id'>;
    const newEvent = {
      id: randomUUID(),
      ...requestJson,
    };
    return HttpResponse.json(newEvent, { status: 201 });
  }),

  http.put('/api/events/:id', async ({ params: { id }, request }) => {
    const eventList = events as Event[];
    const updatedIndex = eventList.findIndex((event) => event.id === id);
    if (updatedIndex < 0) return HttpResponse.json({ message: 'Not Found' }, { status: 404 });

    const updatedEvent = (await request.json()) as Partial<Event>;
    const resultEvent = { ...eventList[updatedIndex], ...updatedEvent, id };
    return HttpResponse.json(resultEvent, { status: 200 });
  }),

  http.delete('/api/events/:id', ({ params: { id } }) => {
    const hasEvent = (events as Event[]).some((event) => event.id === id);
    if (!hasEvent) return HttpResponse.json({ message: 'Not Found' }, { status: 404 });
    return new HttpResponse(null, { status: 204 });
  }),
];
