import { http, HttpResponse } from 'msw';

import { Event, EventForm } from '../types';
import { defaultMockEvents } from './mockData';

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.

export const createMockEventHandler = (initEvents = defaultMockEvents as Event[]) => {
  const testEvents = [...initEvents];

  return {
    get: () => {
      return http.get('/api/events', () => {
        return HttpResponse.json({
          events: testEvents,
        });
      });
    },
    post: () => {
      return http.post('/api/events', async ({ request }) => {
        const newEventData = (await request.json()) as EventForm;

        const newEvent: Event = {
          id: crypto.randomUUID(),
          ...newEventData,
        };

        testEvents.push(newEvent);

        return HttpResponse.json(newEvent, {
          status: 201,
        });
      });
    },
    put: () => {
      return http.put('/api/events/:id', async ({ params, request }) => {
        const eventId = params.id;
        const updatedEventData = (await request.json()) as EventForm;
        const existingEventIndex = testEvents.findIndex((event) => event.id === eventId);

        if (existingEventIndex === -1) {
          return HttpResponse.json(
            {
              error: '이벤트를 찾을 수 없습니다.',
            },
            {
              status: 404,
            }
          );
        }

        testEvents[existingEventIndex] = { ...testEvents[existingEventIndex], ...updatedEventData };

        return HttpResponse.json(testEvents[existingEventIndex]);
      });
    },
    delete: () => {
      return http.delete('/api/events/:id', ({ params }) => {
        const eventId = params.id;
        const existingEventIndex = testEvents.findIndex((event) => event.id === eventId);

        if (existingEventIndex === -1) {
          return HttpResponse.json(
            {
              error: '삭제할 이벤트가 없습니다.',
            },
            {
              status: 404,
            }
          );
        }

        testEvents.splice(existingEventIndex, 1);

        return new HttpResponse(null, { status: 204 });
      });
    },
  };
};
