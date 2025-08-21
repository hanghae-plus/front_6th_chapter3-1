import { randomUUID } from 'crypto';

import { http, HttpResponse } from 'msw';

import { events } from '../__mocks__/response/events.json' assert { type: 'json' };
import { server } from '../setupTests';
import { Event, EventForm } from '../types';

export const setupMockHandler = (initEvents = events) => {
  const testEvents = [...initEvents] as Event[];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: testEvents });
    }),

    http.post<never, EventForm, Event>('/api/events', async ({ request }) => {
      const newEvent = await request.json();
      const eventWithId: Event = {
        ...newEvent,
        id: randomUUID(),
      };
      testEvents.push(eventWithId);
      return HttpResponse.json(eventWithId, { status: 201 });
    }),

    http.put<{ id: string }, Event, Event>('/api/events/:id', async ({ params, request }) => {
      const { id } = params;
      const updatedEvent = await request.json();

      const index = testEvents.findIndex((event) => event.id === id);
      if (index !== -1) {
        testEvents[index] = { ...updatedEvent, id };
        return HttpResponse.json(testEvents[index]);
      }
      return new HttpResponse(null, { status: 404 });
    }),

    http.delete<{ id: string }>('/api/events/:id', ({ params }) => {
      const { id } = params;
      const index = testEvents.findIndex((event) => event.id === id);

      if (index !== -1) {
        testEvents.splice(index, 1);
        return new HttpResponse(null, { status: 204 });
      }
      return new HttpResponse(null, { status: 404 });
    })
  );
};

export const setupGetErrorHandler = () => {
  server.use(http.get('/api/events', () => HttpResponse.error()));
};

export const setupDeleteErrorHandler = (initEvents = events) => {
  const testEvents = [...initEvents] as Event[];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: testEvents });
    }),
    http.delete('/api/events/:id', () => HttpResponse.error())
  );
};

export const createDefaultEvents = (date: Date = new Date()) => {
  const today = date;
  const currentDateStr = today.toISOString().split('T')[0];

  return [
    {
      id: 'mock-1',
      title: '회의',
      date: currentDateStr,
      startTime: '09:00',
      endTime: '10:00',
      description: '팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: 'mock-2',
      title: '점심 약속',
      date: currentDateStr,
      startTime: '12:00',
      endTime: '13:00',
      description: '친구와 점심',
      location: '식당',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ] as Event[];
};
