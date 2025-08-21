import { http, HttpResponse } from 'msw';

import { createMockEvent } from '../__tests__/utils';
import { server } from '../setupTests';
import { Event } from '../types';

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.

// 각 테스트마다 다른 데이터를 사용하면 되지 않을까?
// 테스트가 끝나면 데이터를 초기화?

/**
 * handlersUtils.ts
 * - 테스트별로 다른 응답을 반환할 수 있도록 핸들러 동적 설정
 * - 각 테스트에서 독립적인 mock 데이터를 사용해 테스트가 병렬로 실행될때 데이터 충돌을 방지
 */

/** 이벤트 생성 */
export const setupMockHandlerCreation = (initEvents = [] as Event[]) => {
  //원본 데이터를 복사
  const events = [...initEvents]; //테스트 마다 다른 데이터 사용을 위해

  //기존 핸들러 초기화
  server.resetHandlers();

  server.use(
    // 기존 이벤트 목록 채워주기
    http.get('/api/events', () => {
      return HttpResponse.json({ events });
    }),

    // 이벤트 생성
    http.post('/api/events', async ({ request }) => {
      //새 이벤트
      const newEvent = (await request.json()) as Event;
      const createdEvent = { ...newEvent, id: String(events.length + 1) };

      // 이벤트 배열에 추가
      events.push(createdEvent);

      return HttpResponse.json(createdEvent, { status: 201 });
    })
  );
};

/** 이벤트 수정 */
export const setupMockHandlerUpdating = () => {
  //이벤트 생성
  const events = [
    createMockEvent(1, {
      title: '개발 공부',
      date: '2025-10-13',
      notificationTime: 10,
      startTime: '09:00',
      endTime: '10:00',
    }),
    createMockEvent(2, {
      title: '회의',
      date: '2025-10-13',
      notificationTime: 10,
      startTime: '11:00',
      endTime: '12:00',
    }),
  ];

  // 기존 핸들러 초기화
  server.resetHandlers();

  server.use(
    // 기존 이벤트 목록 채우기
    http.get('/api/events', () => {
      return HttpResponse.json({ events });
    }),

    http.put('/api/events/:id', async ({ request, params }) => {
      const { id } = params;

      //이벤트 수정
      const updatedEvent = (await request.json()) as Event;

      //이벤트 배열에서 수정
      const index = events.findIndex((event) => event.id === id);

      if (index !== -1) {
        //아이디가 있다면 이벤트 수정
        events[index] = { ...events[index], ...updatedEvent };
        return HttpResponse.json(events[index]);
      }

      return HttpResponse.json(null, { status: 404 });
    })
  );
};

/** 이벤트 삭제 */
export const setupMockHandlerDeletion = () => {
  //삭제할 이벤트
  let events = [
    createMockEvent(1, {
      title: '개발 공부',
      date: '2025-10-13',
      notificationTime: 10,
      startTime: '09:00',
      endTime: '10:00',
    }),
  ];

  // 기존 핸들러 초기화
  server.resetHandlers();

  server.use(
    // 기존 이벤트 목록 채우기
    http.get('/api/events', () => {
      return HttpResponse.json({ events });
    }),

    // DELETE 요청: 이벤트 삭제
    http.delete('/api/events/:id', ({ params }) => {
      // URL 파라미터에서 이벤트 ID 추출
      const { id } = params;

      const index = events.findIndex((event) => event.id === id);

      if (index !== -1) {
        // 기존 이벤트가 있다면 삭제
        events = events.filter((event) => event.id !== id);
        return new HttpResponse(null, { status: 204 });
      }

      // 기존 이벤트가 없다면 404 반환
      return HttpResponse.json(null, { status: 404 });
    })
  );
};
