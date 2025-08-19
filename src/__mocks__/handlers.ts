import { randomUUID } from 'crypto';
import { http, HttpResponse, HttpHandler } from 'msw';

import { events } from '../__mocks__/response/events.json' assert { type: 'json' };
import { Event, EventForm } from '../types';

const data = {
  events: [...events],
}

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export const createHandler = (initialEvents: Event[] = []) => {
  if (initialEvents.length > 0) {
    data.events = initialEvents;
  }

  return [
    http.get('/api/events', () => {
      return HttpResponse.json({ events: data.events });
    }),
  
    http.post('/api/events', async ({ request }) => {
      const eventData = (await request.json()) as EventForm;
      const newEvent = { id: randomUUID(), ...eventData };
      data.events.push(newEvent);
  
      return HttpResponse.json({ events: data.events }, { status: 201 });
    }),
  
    http.put('/api/events/:id', async ({ params, request }) => {
      const { id } = params;
      const eventIndex = data.events.findIndex((event) => event.id === id);
      if (eventIndex > -1) {
        const eventData = (await request.json()) as EventForm;
        data.events[eventIndex] = { ...data.events[eventIndex], ...eventData };
        return HttpResponse.json({ events: data.events[eventIndex] });
      }
      return HttpResponse.json({ message: 'Event not found' }, { status: 404 });
    }),
  
    http.delete('/api/events/:id', ({ params }) => {
      const { id } = params;
      data.events = data.events.filter((event) => event.id !== id);
      return HttpResponse.json({ events: null }, { status: 204 });
    }),
  ];
}

export const createErrorHandler = () => {
  return [
    http.get('/api/events', () => {
      return HttpResponse.json({ message: 'Error' }, { status: 500 });
    }),

    http.post('/api/events', () => {
      return HttpResponse.json({ message: 'Error' }, { status: 500 });
    }),

    http.put('/api/events/:id', () => {
      return HttpResponse.json({ message: 'Error' }, { status: 500 });
    }),

    http.delete('/api/events/:id', () => {
      return HttpResponse.json({ message: 'Error' }, { status: 500 });
    }),
  ];
}

export const handlers: HttpHandler[] = createHandler();
