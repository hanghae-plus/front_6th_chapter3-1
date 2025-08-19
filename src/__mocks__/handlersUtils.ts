import { randomUUID } from 'crypto';

import { http, HttpResponse } from 'msw';

import { Event } from '../types';

type RequestMethod = 'get' | 'post' | 'put' | 'delete';

type IsSuccess<M extends RequestMethod> = Record<`${M}IsSuccess`, boolean>;

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.
export const setupMockHandlerCreation = (
  initEvents = [] as Event[],
  successFlags: Partial<IsSuccess<'get' | 'post'>> = {}
) => {
  const store = { current: structuredClone(initEvents) as Event[] };
  const { getIsSuccess = true, postIsSuccess = true } = successFlags;

  return [
    http.get('/api/events', () => {
      if (getIsSuccess)
        return HttpResponse.json(
          { events: store.current },
          {
            status: 200,
          }
        );
      return HttpResponse.json({ message: 'fetch fail' }, { status: 500 });
    }),
    http.post('/api/events', async ({ request }) => {
      const requestJson = (await request.json()) as Omit<Event, 'id'>;
      const newEvent = {
        id: randomUUID(),
        ...requestJson,
      };
      if (postIsSuccess) return HttpResponse.json(newEvent, { status: 201 });
      return HttpResponse.json({ message: 'not found' }, { status: 404 });
    }),
  ];
};

export const setupMockHandlerUpdating = (
  initEvents: Event[] = [],
  successFlags: Partial<IsSuccess<'get' | 'put'>> = {}
) => {
  const { getIsSuccess = true } = successFlags;

  const store = { current: structuredClone(initEvents) as Event[] };
  return [
    http.get('/api/events', () => {
      if (getIsSuccess)
        return HttpResponse.json(
          { events: store.current },
          {
            status: 200,
          }
        );
      return HttpResponse.json({ message: 'fetch fail' }, { status: 500 });
    }),
    http.put('/api/events/:id', async ({ params, request }) => {
      const id = params.id as string;

      const eventList = store.current as Event[];
      const updatedIndex = eventList.findIndex((event) => event.id === id);
      if (updatedIndex < 0) return HttpResponse.json({ message: 'Not Found' }, { status: 404 });

      const updatedEvent = (await request.json()) as Partial<Event>;
      const resultEvent = { ...eventList[updatedIndex], ...updatedEvent, id };
      store.current[updatedIndex] = resultEvent;
      return HttpResponse.json(resultEvent, { status: 200 });
    }),
  ];
};

export const setupMockHandlerDeletion = (initEvents: Event[] = []) => {
  const store = { current: structuredClone(initEvents) as Event[] };

  return [
    http.get('/api/events', () => {
      return HttpResponse.json(
        { events: store.current },
        {
          status: 200,
        }
      );
    }),
    http.delete('/api/events/:id', ({ params }) => {
      const id = params.id as string;

      const eventList = store.current as Event[];
      const deletedIndex = eventList.findIndex((event) => event.id === id);

      const hasEvent = eventList.some((event) => event.id === id);
      if (!hasEvent) return HttpResponse.json({ message: 'Not Found' }, { status: 404 });

      eventList.splice(deletedIndex, 1);
      return new HttpResponse(null, { status: 204 });
    }),
  ];
};
