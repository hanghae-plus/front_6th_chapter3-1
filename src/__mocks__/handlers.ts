import { http, HttpResponse } from 'msw';

import { events } from '../__mocks__/response/events.json' assert { type: 'json' };
import { Event, EventForm } from '../types';
import { defaultMockEvents } from './mockData';

// 테스트용 에러 핸들러 생성 헬퍼 함수
export const createErrorHandler = (method: string, endpoint: string, statusCode: number = 500) => {
  return http[method as keyof typeof http](endpoint, () => {
    return HttpResponse.json({ error: 'Server Error' }, { status: statusCode });
  });
};

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json({
      events: defaultMockEvents,
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
