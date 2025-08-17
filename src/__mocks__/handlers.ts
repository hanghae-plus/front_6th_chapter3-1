import { randomUUID } from 'crypto';
import { http, HttpResponse } from 'msw';

import { events } from '../__mocks__/response/events.json' assert { type: 'json' };
import { Event } from '../types';

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export const serverState = {
  data: {
    events,
  },

  reset: () => {
    serverState.data = { events };
  },
};

export const handlers = [
  http.get('/api/events', () => {
    const events = [...serverState.data.events];

    return HttpResponse.json({ events });
  }),

  http.post('/api/events', async ({ request }) => {
    const events = [...serverState.data.events];
    const newEvent: Event = { id: randomUUID(), ...(await request.clone().json()) };

    serverState.data.events = [...events, newEvent];
    return HttpResponse.json(newEvent, { status: 201 });
  }),

  http.put('/api/events/:id', async ({ params, request }) => {
    const events = [...serverState.data.events];
    const { id } = params;
    const updatedEvent: Event = await request.clone().json();
    const targetIndex = events.findIndex((x) => x.id === id);
    if (targetIndex === -1) {
      return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    events[targetIndex] = {
      ...events[targetIndex],
      ...updatedEvent,
    };

    serverState.data.events = [...events];
    return HttpResponse.json(events[targetIndex]);
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const events = [...serverState.data.events];
    const { id } = params;

    const targetIndex = events.findIndex((x) => x.id === id);
    if (targetIndex === -1) {
      return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    serverState.data.events = events.filter((x) => x.id !== id);
    return HttpResponse.json(null, { status: 204 });
  }),
];
