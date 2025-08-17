import { http, HttpResponse } from 'msw';
import { events } from '../__mocks__/response/events.json' assert { type: 'json' };
import { EventForm } from '../types';

import { randomUUID } from 'crypto';

let mockEvents = [...events];

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json(mockEvents);
  }),

  http.post<{}, EventForm>('/api/events', async ({ request }) => {
    const body = await request.json();
    const newEvent = { id: randomUUID(), ...body };

    mockEvents.push(newEvent);

    return HttpResponse.json(newEvent, { status: 201 });
  }),

  http.put<{ id: string }, EventForm>('/api/events/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json();

    const eventIndex = mockEvents.findIndex((event) => event.id === id);

    if (eventIndex > -1) {
      mockEvents[eventIndex] = { ...mockEvents[eventIndex], ...body };
      return HttpResponse.json(mockEvents[eventIndex]);
    } else {
      return HttpResponse.text('Event not found', { status: 404 });
    }
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;

    mockEvents.filter((event) => event.id !== id);

    return new HttpResponse(null, { status: 204 });
  }),
];
