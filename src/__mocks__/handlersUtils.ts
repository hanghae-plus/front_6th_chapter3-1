import { http, HttpResponse } from 'msw';
import { Event } from '../types';
import { server } from '../setupTests';

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다.
// 이를 위한 제어가 필요할 것 같은데요.
// 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?

// ! 아래 이름을 사용하지 않아도 되니,
// 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요.
// 그리고 이 로직을 PR에 설명해주세요.... (-> 제가요?)

// server.use -> handler.ts에 있는 http 함수들은 모든 테스트에 기본적으로 깔려 있는 msw
// 그런데 테스트를 하다 보면 다른 상황에서의 API 호출(fetch)이 필요하니
// 그때 server.use로 handler.ts에 적혀 있는 msw를 덮어 씌우는 역할을 함
// 특정 상황에서만 사용되니 export
export const setupMockHandlerCreation = (initEvents = [] as Event[]) => {
  // 이벤트 생성 -> 이벤트 배열이 우선적으로 필요하고, 거기에 id를 추가한 새 이벤트를 넣는다
  // handlers.ts에 있는 http.get, http.post와 비슷...?
  // initEvents가 필요한 이유: 테스트마다 다른 값들이 필요할 수 있어서..

  const events = [...initEvents];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events });
    }),
    http.post('/api/events', async ({ request }) => {
      try {
        const newEvents = (await request.json()) as Event;
        newEvents.id = String(events.length + 1);
        events.push(newEvents);

        return HttpResponse.json({ newEvents }, { status: 201 });
      } catch (err) {
        return HttpResponse.json({ error: '이벤트 생성에 실패했습니다.' }, { status: 400 });
      }
    })
  );
};

export const setupMockHandlerUpdating = () => {
  // update면 http.put과 비슷하게 해도 되지 않을까?
  // 그런데 왜 인자 request가 없을까.. -> 기본적인 목업 데이터를 만들어라?

  const events = [
    {
      id: '1',
      title: '소희랑 밥 먹기',
      date: '2025-08-22',
      startTime: '21:00',
      endTime: '23:00',
      description: '수민지혜유진송이 초대하기',
      location: '강남역',
      category: '약속',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '병준이 집들이 가기',
      date: '2025-08-27',
      startTime: '18:00',
      endTime: '23:00',
      description: '4팀 7팀 다 모여',
      location: '병준이네 집',
      category: '약속',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  // 먼저 기존 데이터(위에 작성한 event)를 get으로 불러오고, put으로 추가
  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events });
    }),

    http.put('/api/events/:id', async ({ params, request }) => {
      // 업데이트
      const { id } = params;
      const updateEvent = (await request.json()) as Event;
      const index = events.findIndex((event) => event.id === id); // 업데이트할 이벤트 찾기

      if (index !== -1) {
        // 수정하고자 하는 이벤트가 (findIndex로) 잘 찾아졌으면
        events[index] = { ...events[index], ...updateEvent };
        return HttpResponse.json({ ...events[index], ...updateEvent }, { status: 200 });
      }

      // 수정하고자 하는 이벤트가 없으면
      return HttpResponse.json(null, { status: 404 });
    })
  );
};

export const setupMockHandlerDeletion = () => {
  const events = [
    {
      id: '1',
      title: '소희랑 밥 먹기',
      date: '2025-08-22',
      startTime: '21:00',
      endTime: '23:00',
      description: '수민지혜유진송이 초대하기',
      location: '강남역',
      category: '약속',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '병준이 집들이 가기',
      date: '2025-08-27',
      startTime: '18:00',
      endTime: '23:00',
      description: '4팀 7팀 다 모여',
      location: '병준이네 집',
      category: '약속',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events });
    }),
    http.delete('/api/events/:id', ({ params }) => {
      // 삭제

      const { id } = params;
      const index = events.findIndex((event) => event.id === id); // 삭제할 이벤트 찾기
      if (index !== -1) {
        // 삭제하고자 하는 이벤트가 잘 찾아졌으면
        events.splice(index, 1);
        return HttpResponse.json(null, { status: 204 });
      }

      // 삭제하고자 하는 이벤트가 없으면
      return HttpResponse.json(null, { status: 404 });
    })
  );
};
