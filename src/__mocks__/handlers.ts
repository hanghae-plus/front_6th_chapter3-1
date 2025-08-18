import { http, HttpResponse } from 'msw';

import { events } from '../__mocks__/response/events.json' assert { type: 'json' };
import { Event, EventForm } from '../types';

// 메모리상에서 mockEvents로 변경사항을 기억하기위해 events 객체 복사
let mockEvents = [...events] as Event[];

export const resetMockEvents = () => {
  mockEvents = [...events] as Event[];
};

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json({ events: mockEvents });
  }),

  http.post('/api/events', async ({ request }) => {
    const newEvent = (await request.json()) as EventForm;
    const eventWithId: Event = {
      id: crypto.randomUUID(),
      ...newEvent,
    };

    mockEvents.push(eventWithId);

    return HttpResponse.json(eventWithId, { status: 201 });
  }),

  http.put('/api/events/:id', async ({ params, request }) => {
    const { id } = params;
    const updateData = (await request.json()) as Partial<EventForm>;

    const eventIndex = mockEvents.findIndex((event: Event) => event.id === id);

    if (eventIndex === -1) return new HttpResponse('존재하지 않는 이벤트입니다', { status: 404 });

    const updatedEvent: Event = {
      ...mockEvents[eventIndex],
      ...updateData,
    };

    mockEvents[eventIndex] = updatedEvent;

    return HttpResponse.json(updatedEvent);
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;

    const eventIndex = mockEvents.findIndex((event: Event) => event.id === id);

    if (eventIndex === -1) return new HttpResponse('존재하지 않는 이벤트입니다', { status: 404 });

    mockEvents.splice(eventIndex, 1);

    return new HttpResponse(null, { status: 204 });
  }),
];
