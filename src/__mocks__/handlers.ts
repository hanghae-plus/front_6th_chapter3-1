import { http, HttpResponse } from 'msw';

import { events as initialEvents } from '../__mocks__/response/events.json';
import { Event } from '../types';

let events: Event[] = JSON.parse(JSON.stringify(initialEvents)); // Use a deep copy to allow modification

export const handlers = [
  // 일정 조회 (GET)
  http.get('/api/events', () => {
    return HttpResponse.json({ events }); // Return as { events: [...] }
  }),

  // 일정 추가 (POST)
  http.post('/api/events', async ({ request }) => {
    const newEvent = (await request.json()) as Omit<Event, 'id'>;
    const createdEvent: Event = {
      ...newEvent,
      id: String(Date.now()), // Create a simple unique ID
    };
    events.push(createdEvent);
    return HttpResponse.json(createdEvent, { status: 201 });
  }),

  // 일정 수정 (PUT)
  http.put('/api/events/:id', async ({ params, request }) => {
    const { id } = params;
    const updatedEventData = (await request.json()) as Partial<Event>;
    const eventIndex = events.findIndex((event) => event.id === id);

    if (eventIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    events[eventIndex] = { ...events[eventIndex], ...updatedEventData };
    return HttpResponse.json(events[eventIndex]);
  }),

  // 일정 삭제 (DELETE)
  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;
    const eventIndex = events.findIndex((event) => event.id === id);

    if (eventIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    events.splice(eventIndex, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];

// Utility to reset events for clean tests
export const resetEvents = () => {
  events = JSON.parse(JSON.stringify(initialEvents));
};
