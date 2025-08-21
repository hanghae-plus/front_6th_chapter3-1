import { http, HttpResponse } from 'msw';

import { events } from '../__mocks__/response/events.json' assert { type: 'json' };
import { Event, EventForm } from '../types';

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json({
      events: [
        {
          id: 1,
          title: '모각코',
          date: '2025-08-21',
          startTime: '10:00',
          endTime: '11:00',
        },
      ],
    });
  }),

  http.post('/api/events', async ({ request }) => {
    const newEventData = (await request.json()) as EventForm;

    const newEvent: Event = {
      id: crypto.randomUUID(),
      ...newEventData,
    };

    return HttpResponse.json(newEvent, {
      status: 201,
    });
  }),

  http.put('/api/events/:id', async ({ params, request }) => {
    const eventId = params.id;
    const updatedEventData = (await request.json()) as EventForm;

    const existingEvent = events.find((event) => event.id === eventId);

    if (!existingEvent) {
      return HttpResponse.json(
        {
          error: '이벤트를 찾을 수 없습니다.',
        },
        {
          status: 404,
        }
      );
    }

    const updatedEvent: Event = {
      ...existingEvent,
      ...updatedEventData,
    };

    return HttpResponse.json(updatedEvent);
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const eventId = params.id;
    const existingEvent = events.find((event) => event.id === eventId);

    if (!existingEvent) {
      return HttpResponse.json(
        {
          error: '삭제할 이벤트가 없습니다.',
        },
        {
          status: 404,
        }
      );
    }

    return new HttpResponse(null, { status: 204 });
  }),
];
