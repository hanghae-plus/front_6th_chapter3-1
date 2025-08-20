import { http, HttpResponse } from 'msw';

import { events } from '../__mocks__/response/events.json' assert { type: 'json' };
import { Event } from '../types';

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.

/**
 * handlers.ts
 * API 호출시 그 요청을 가로채서 테스트용 응답 반환
 * 실제 API 호출을 방지하고 테스트 환경에서 사용할 수 있는 데이터를 제공
 *
 * - http: HTTP 요청 메서드들을 제공
 * - HttpResponse: HTTP 응답 생성 유틸리티
 */

export const handlers = [
  // 이벤트 조회
  http.get('/api/events', () => {
    return HttpResponse.json(events);
  }),

  // 이벤트 생성
  http.post('/api/events', async ({ request }) => {
    const newEvent = (await request.json()) as Event;

    const createEvent = {
      ...newEvent,
      id: events.length + 1,
    };

    return HttpResponse.json(createEvent, { status: 201 });
  }),

  // 이벤트 수정
  http.put('/api/events/:id', async ({ params, request }) => {
    const { id } = params;
    const updateEvent = (await request.json()) as Event;

    // 기존 이벤트 찾아서 수정
    const index = events.findIndex((event) => event.id === id);

    if (index !== -1) {
      // 기존 이벤트가 있다면 수정
      return HttpResponse.json({ ...events[index], ...updateEvent }, { status: 200 });
    }

    // 기존 이벤트가 없다면 404 반환
    return HttpResponse.json(null, { status: 404 });
  }),

  // 이벤트 삭제
  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;
    const index = events.findIndex((event) => event.id === id);

    if (index !== -1) {
      // 기존 이벤트가 있다면 삭제
      return new HttpResponse(null, { status: 204 });
    }

    // 기존 이벤트가 없다면 404 반환
    return HttpResponse.json(null, { status: 404 });
  }),
];
