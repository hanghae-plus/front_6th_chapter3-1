import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';

const enqueueSnackbarFn = vi.fn();

vi.mock('notistack', async () => {
  const actual = await vi.importActual('notistack');
  return {
    ...actual,
    useSnackbar: () => ({
      enqueueSnackbar: enqueueSnackbarFn,
    }),
  };
});

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  const initialEvents: Event[] = [
    {
      id: '1',
      title: '기존 회의',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];
  setupMockHandlerCreation(initialEvents);

  const { result } = renderHook(() => useEventOperations(true));
  console.log(result.current.events);
  await waitFor(() => {
    console.log(result.current.events);
    expect(result.current.events).toEqual(initialEvents);
  });
});

//********************다시 작성 필요******************/
it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  const initialEvents: Event[] = [
    {
      id: '1',
      title: '기존 회의',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];
  setupMockHandlerCreation(initialEvents);
  const { result } = renderHook(() => useEventOperations(false));
  const newEvent: Event = {
    id: '',
    title: '신규 세미나',
    date: '2025-07-10',
    startTime: '11:00',
    endTime: '12:00',
    description: '신규 프로젝트 세미나',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  await act(async () => {
    await result.current.saveEvent(newEvent);
  });

  await waitFor(() => {
    console.log(result.current.events);
    expect(result.current.events).toEqual([initialEvents[0], { ...newEvent, id: '2' }]);
  });
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  setupMockHandlerUpdating();

  const { result } = renderHook(() => useEventOperations(true));
  await waitFor(() => {
    console.log(result.current.events);
    expect(result.current.events.length).toBe(2);
  });

  const updateEvent = {
    id: '2',
    title: '신규 세미나 업데이트',
    endTime: '13:00',
  } as Event;

  await act(async () => {
    await result.current.saveEvent(updateEvent);
  });

  await waitFor(() => {
    console.log(result.current.events);
    expect(result.current.events.length).toBe(2);
  });
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  setupMockHandlerDeletion();
  const { result } = renderHook(() => useEventOperations(true));
  await waitFor(() => {
    console.log(result.current.events);
    expect(result.current.events.length).toBe(1);
  });

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  await waitFor(() => {
    console.log(result.current.events);
    expect(result.current.events.length).toBe(0);
  });
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  server.use(
    http.get('/api/events', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  renderHook(() => useEventOperations(true));
  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('이벤트 로딩 실패', { variant: 'error' });
  });
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  setupMockHandlerUpdating();
  server.use(
    http.put('/api/events/:id', () => {
      return new HttpResponse(null, { status: 404 });
    })
  );

  const { result } = renderHook(() => useEventOperations(true));

  const updateEvent = {
    id: '2',
    title: '신규 세미나 업데이트',
    endTime: '13:00',
  } as Event;

  await act(async () => {
    await result.current.saveEvent(updateEvent);
    console.log(enqueueSnackbarFn.mock.calls);
    console.log(result.current.events);
  });

  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', { variant: 'error' });
    console.log(result.current.events);
  });
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  setupMockHandlerDeletion();
  server.use(
    http.delete('/api/events/:id', () => {
      return new HttpResponse(null, { status: 404 });
    })
  );
  const { result } = renderHook(() => useEventOperations(true));

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 삭제 실패', { variant: 'error' });
    console.log(enqueueSnackbarFn.mock.calls);
    console.log(result.current.events);
  });
});
