import { http, HttpResponse } from 'msw';

import { events } from '../__mocks__/response/events.json' assert { type: 'json' };
import { Event } from '../types';

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.

let mockEvents: Event[] = structuredClone(events) as Event[];

export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json({ events: mockEvents }, { status: 200 });
  }),
  http.post('/api/events', async ({ request }) => {
    const newEvent = (await request.json()) as Event;
    mockEvents.push(newEvent);
    return HttpResponse.json({ event: newEvent }, { status: 201 });
  }),
  http.put('/api/events/:id', async ({ request, params }) => {
    const updatedEvent = (await request.json()) as Event;
    const index = mockEvents.findIndex((event) => event.id === params.id);

    if (index === -1) {
      return HttpResponse.json({ error: '이벤트를 찾을 수 없습니다.' }, { status: 404 });
    }

    mockEvents[index] = { ...updatedEvent, id: params.id as string };
    return HttpResponse.json({ event: updatedEvent }, { status: 200 });
  }),
  http.delete('/api/events/:id', async ({ params }) => {
    const index = mockEvents.findIndex((event) => event.id === params.id);
    if (index === -1) {
      return HttpResponse.json({ error: '이벤트를 찾을 수 없습니다.' }, { status: 404 });
    }

    mockEvents.splice(index, 1);
    return HttpResponse.json({ status: 200 });
  }),
];

export const initMockEvents = () => {
  mockEvents = structuredClone(events) as Event[];
};
