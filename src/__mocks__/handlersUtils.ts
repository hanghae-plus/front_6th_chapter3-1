import { randomUUID } from 'crypto';

import { http, HttpResponse } from 'msw';

import { events } from '../__mocks__/response/events.json' assert { type: 'json' };
import { server } from '../setupTests';
import { Event, EventForm } from '../types';

// ! HARD
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.
export const setupGetHandler = (eventManager: ReturnType<typeof TestEventManager>) => {
  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: eventManager.getAllEvents() });
    })
  );
};

export const setupPostHandler = (eventManager: ReturnType<typeof TestEventManager>) => {
  server.use(
    http.post<never, EventForm, Event>('/api/events', async ({ request }) => {
      const newEvent = await request.json();
      const createdEvent = eventManager.addEvent(newEvent);
      return HttpResponse.json(createdEvent, { status: 201 });
    })
  );
};

export const setupPutHandler = (eventManager: ReturnType<typeof TestEventManager>) => {
  server.use(
    http.put<{ id: string }, Event, Event>('/api/events/:id', async ({ params, request }) => {
      const { id } = params;
      const updatedEvent = await request.json();

      const result = eventManager.updateEvent(id, updatedEvent);
      if (result) {
        return HttpResponse.json(result);
      }
      return new HttpResponse(null, { status: 404 });
    })
  );
};

export const setupDeleteHandler = (eventManager: ReturnType<typeof TestEventManager>) => {
  server.use(
    http.delete<{ id: string }>('/api/events/:id', ({ params }) => {
      const { id } = params;
      const success = eventManager.deleteEvent(id);

      if (success) {
        return new HttpResponse(null, { status: 204 });
      }
      return new HttpResponse(null, { status: 404 });
    })
  );
};

export const TestEventManager = (initEvents = events) => {
  let events = [...initEvents] as Event[];

  return {
    getAllEvents() {
      return [...events];
    },

    addEvent(eventData: EventForm): Event {
      const newEvent: Event = {
        ...eventData,
        id: randomUUID(),
      };
      events.push(newEvent);
      return newEvent;
    },

    updateEvent(id: string, eventData: Event): Event | null {
      const index = events.findIndex((event) => event.id === id);
      if (index !== -1) {
        events[index] = { ...eventData, id };
        return events[index];
      }
      return null;
    },

    deleteEvent(id: string): boolean {
      const index = events.findIndex((event) => event.id === id);
      if (index !== -1) {
        events.splice(index, 1);
        return true;
      }
      return false;
    },

    reset(newInitEvents = events) {
      events = [...newInitEvents] as Event[];
    },
  };
};

export const createTestEventManager = TestEventManager;

export const setupGetErrorHandler = () => {
  server.use(http.get('/api/events', () => HttpResponse.error()));
};

export const setupDeleteErrorHandler = (initEvents = events) => {
  const eventManager = createTestEventManager(initEvents);

  setupGetHandler(eventManager);
  server.use(http.delete('/api/events/:id', () => HttpResponse.error()));

  return eventManager;
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
