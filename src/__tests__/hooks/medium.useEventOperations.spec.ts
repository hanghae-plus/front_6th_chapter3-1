import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';
import { MOCK_EVENTS, METTING_0823 } from '../mockEvents.ts';

const enqueueSnackbarFn = vi.fn();

vi.mock('notistack', async () => {
  const actual = await vi.importActual('notistack');
  return {
    ...actual,
    useSnackbar: () => ({
      //해당 모듈을 오버드라이브하여 enqueueSnackbarFn 로 교체
      enqueueSnackbar: enqueueSnackbarFn,
    }),
  };
});

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  setupMockHandlerCreation(MOCK_EVENTS);

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.fetchEvents();
  });

  expect(result.current.events).toEqual(MOCK_EVENTS);
});

//Q.적절하게..... 저장...? 추가 인듯
it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  //빈 배열로 초기화
  setupMockHandlerCreation([]);

  const { result } = renderHook(() => useEventOperations(false));

  //초기에는 빈 상태
  expect(result.current.events).toEqual([]);

  //이벤트 추가
  await act(async () => {
    await result.current.saveEvent(METTING_0823);
  });

  //추가된 이벤트 확인
  expect(result.current.events).toEqual([METTING_0823]);
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  // 정의된 2개의 이벤트가 존재함
  setupMockHandlerUpdating();

  const { result } = renderHook(() => useEventOperations(true));

  await act(async () => {
    await result.current.fetchEvents();
  });

  //이벤트 title, endTime 수정
  const updatedEvent: Event = {
    ...result.current.events[0],
    title: '기존 회의(시간 수정됨)',
    endTime: '11:00',
  };

  await act(async () => {
    await result.current.saveEvent(updatedEvent);
  });

  expect(result.current.events[0].title).toEqual(updatedEvent.title);
  expect(result.current.events[0].endTime).toEqual(updatedEvent.endTime);
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  //1개의 이벤트가 존재
  setupMockHandlerDeletion();
  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.fetchEvents();
  });

  expect(result.current.events).toHaveLength(1);

  const deletedEventId = result.current.events[0].id;

  await act(async () => {
    await result.current.deleteEvent(deletedEventId);
  });

  expect(result.current.events).toHaveLength(0);
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  server.use(
    http.get('/api/events', () => {
      return HttpResponse.error();
    })
  );

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.fetchEvents();
  });

  //호출되었는지 체킹
  expect(enqueueSnackbarFn).toHaveBeenCalledWith('이벤트 로딩 실패', { variant: 'error' });
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  setupMockHandlerCreation(MOCK_EVENTS);

  const { result } = renderHook(() => useEventOperations(true));

  await act(async () => {
    await result.current.fetchEvents();
  });

  //존재하지 않는 100번 이벤트 업데이트
  const updatedEvent: Event = {
    ...result.current.events[0],
    id: '100',
    title: '기존 회의(시간 수정됨)',
  };

  await act(async () => {
    await result.current.saveEvent(updatedEvent);
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', { variant: 'error' });
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  server.use(
    http.delete('/api/events/:id', () => {
      return HttpResponse.error();
    })
  );

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 삭제 실패', { variant: 'error' });
});
