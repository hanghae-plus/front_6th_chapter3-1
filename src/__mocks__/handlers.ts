import { http, HttpResponse, PathParams } from 'msw';

import { events } from '../__mocks__/response/events.json' assert { type: 'json' };
import { EventForm } from '../types';

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json({ events });
  }),

  http.post<PathParams, EventForm>('/api/events', async ({ request }) => {
    const newEvent = await request.json();
    const id = `${events.length + 1}`;

    events.push({ ...newEvent, id });

    return HttpResponse.json({ ...newEvent, id });
  }),

  http.put<{ id: string }, EventForm>('/api/events/:id', async ({ params, request }) => {
    const { id } = params;
    const updatedEvent = await request.json();
    const eventIndex = events.findIndex((event) => event.id === id);

    if (eventIndex === -1) {
      return HttpResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const result = {
      ...events[eventIndex],
      ...updatedEvent,
    };

    return HttpResponse.json(result);
  }),

  http.delete<{ id: string }>('/api/events/:id', ({ params }) => {
    const { id } = params;

    return HttpResponse.json(events.filter((event) => event.id !== id));
  }),
];
