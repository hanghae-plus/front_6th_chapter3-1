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

// 테스트에서 토스트 메시지 호출을 추적하기 위한 mock 함수 생성
const enqueueSnackbarFn = vi.fn();

// notistack의 useSnackbar 훅을 mock 처리하여 실제 토스트 대신 mock 함수가 호출되도록 설정
vi.mock('notistack', async () => {
  const actual = await vi.importActual('notistack');
  return {
    ...actual,
    useSnackbar: () => ({
      enqueueSnackbar: enqueueSnackbarFn,
    }),
  };
});

// events.json, realEvent.json 파일은 실제 handlers에서 쓰는 데이터(DB)이기 때문에 테스트 환경에서 쓰면 문제가 생김.
// 따로 이벤트 데이터를 만들어서 테스트 해야함.

const events = [
  {
    id: '1',
    title: '팀 회의',
    date: '2025-10-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '2',
    title: '점심 약속',
    date: '2025-10-01',
    startTime: '12:30',
    endTime: '13:30',
    description: '동료와 점심 식사',
    location: '구내식당',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '3',
    title: '기본 업무 마감',
    date: '2025-10-01',
    startTime: '14:00',
    endTime: '16:00',
    description: '기본 업무 마감',
    location: '사무실',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '4',
    title: '생일 파티',
    date: '2025-10-01',
    startTime: '19:00',
    endTime: '22:00',
    description: '내 생일 파티',
    location: '집',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '5',
    title: '과제',
    date: '2025-10-01',
    startTime: '22:30',
    endTime: '01:30',
    description: '기본 과제',
    location: '집',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
] as Event[];

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  setupMockHandlerCreation(events);
  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.fetchEvents();
  });

  expect(result.current.events).toEqual(events);
  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 로딩 완료!', { variant: 'info' });
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  setupMockHandlerCreation(events);
  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.saveEvent({
      id: '6',
      title: '아침 기상',
      date: '2025-10-02',
      startTime: '06:30',
      endTime: '06:50',
      description: '아침 기상',
      location: '집',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    } as Event);
  });

  expect(result.current.events).toEqual([
    ...events,
    {
      id: '6',
      title: '아침 기상',
      date: '2025-10-02',
      startTime: '06:30',
      endTime: '06:50',
      description: '아침 기상',
      location: '집',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    } as Event,
  ]);
  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 추가되었습니다.', { variant: 'success' });
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  setupMockHandlerUpdating();

  const { result } = renderHook(() => useEventOperations(true));

  await act(async () => {
    await result.current.fetchEvents();
  });

  const prevEvent = result.current.events[0];

  await act(async () => {
    await result.current.saveEvent({
      ...prevEvent,
      title: '부서 회의',
      endTime: '11:30',
    } as Event);
  });

  expect(result.current.events[0].title).toBe('부서 회의');
  expect(result.current.events[0].endTime).toBe('11:30');
  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 수정되었습니다.', { variant: 'success' });
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  setupMockHandlerDeletion();
  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.fetchEvents();
  });

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  expect(result.current.events).not.toContain(events.find((event) => event.id === '1'));
  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 삭제되었습니다.', { variant: 'info' });
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ error: '이벤트 로딩 실패' }, { status: 500 });
    })
  );
  const { result } = renderHook(() => useEventOperations(false));
  await act(async () => {
    await result.current.fetchEvents();
  });
  expect(enqueueSnackbarFn).toHaveBeenCalledWith('이벤트 로딩 실패', { variant: 'error' });
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  server.use(
    http.put('/api/events/:id', async () => {
      return HttpResponse.json({ error: '이벤트가 존재하지 않습니다.' }, { status: 500 });
    })
  );
  const { result } = renderHook(() => useEventOperations(true));

  await act(async () => {
    await result.current.fetchEvents();
  });

  await act(async () => {
    await result.current.saveEvent({
      id: '9',
      title: '팀 회의',
      date: '2025-10-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    } as Event);
  });
  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', { variant: 'error' });
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  server.use(
    http.delete('/api/events/:id', async () => {
      return HttpResponse.json({ error: '일정 삭제 실패' }, { status: 500 });
    })
  );
  const { result } = renderHook(() => useEventOperations(false));
  await act(async () => {
    await result.current.fetchEvents();
  });
  await act(async () => {
    await result.current.deleteEvent('1');
  });
  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 삭제 실패', { variant: 'error' });
});
