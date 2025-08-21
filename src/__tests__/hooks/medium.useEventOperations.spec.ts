import { renderHook, waitFor, act } from '@testing-library/react';

import { createErrorHandler } from '../../__mocks__/handlers.ts';
import { createMockEventHandler } from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { expect } from 'vitest';

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

it('GET /api/events 호출하여 이벤트 목록을 불러오고, 로딩 완료시 스낵바에 "일정 로딩 완료!" 메시지를 띄운다', async () => {
  const { result } = renderHook(() => useEventOperations(false));

  expect(result.current.events).toEqual([]);

  await waitFor(() => {
    expect(result.current.events).toHaveLength(1);
  });

  expect(result.current.events[0]).toEqual(
    expect.objectContaining({
      id: '1',
      title: '모각코',
      date: '2025-08-21',
      startTime: '10:00',
      endTime: '11:00',
    })
  );

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 로딩 완료!', {
    variant: 'info',
  });
});

it('POST /api/events로 새 이벤트 생성 후, GET 재호출하여 목록을 업데이트하고 "일정이 추가되었습니다." 스낵바를 표시한다', async () => {
  const newEventData = {
    title: '새로운 회의',
    date: '2025-08-22',
    startTime: '14:00',
    endTime: '15:00',
    description: '새로운 팀 미팅',
    location: '회의실 C',
    category: '업무',
    repeat: { type: 'none' as const, interval: 1 },
    notificationTime: 5,
  };

  const mockHandler = createMockEventHandler();
  server.use(mockHandler.get(), mockHandler.post());

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(result.current.events).toHaveLength(1);
  });

  enqueueSnackbarFn.mockClear();

  await act(async () => {
    await result.current.saveEvent(newEventData);
  });

  expect(result.current.events).toHaveLength(2);

  const addedEvent = result.current.events.find((e) => e.title === '새로운 회의');
  expect(addedEvent).toEqual(expect.objectContaining(newEventData));

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 추가되었습니다.', {
    variant: 'success',
  });
});

it('PUT /api/events/:id로 기존 이벤트 수정 후, GET 재호출하여 목록을 업데이트하고 "일정이 수정되었습니다." 스낵바를 표시한다', async () => {
  const updatedEventData = {
    id: '1',
    title: '수정된 모각코', // 타이틀 변경
    date: '2025-08-21',
    startTime: '10:00',
    endTime: '12:00', // 11:00 → 12:00로 변경
    description: '수정된 모각코 스터디',
    location: '도서관', // 카페 → 도서관으로 변경
    category: '개인',
    repeat: { type: 'none' as const, interval: 1 },
    notificationTime: 10,
  };

  const mockHandler = createMockEventHandler();
  server.use(mockHandler.get(), mockHandler.put());

  const { result } = renderHook(() => useEventOperations(true));

  await waitFor(() => {
    expect(result.current.events).toHaveLength(1);
  });

  enqueueSnackbarFn.mockClear();

  await act(async () => {
    await result.current.saveEvent(updatedEventData);
  });

  expect(result.current.events).toHaveLength(1);

  const updatedEvent = result.current.events[0];
  expect(updatedEvent.title).toBe('수정된 모각코');
  expect(updatedEvent.endTime).toBe('12:00');
  expect(updatedEvent.location).toBe('도서관');

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 수정되었습니다.', {
    variant: 'success',
  });
});

it('DELETE /api/events/:id로 이벤트 삭제 후, GET 재호출하여 목록을 업데이트하고 "일정이 삭제되었습니다." 스낵바를 표시한다', async () => {
  const mockHandler = createMockEventHandler();
  server.use(mockHandler.get(), mockHandler.delete());

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(result.current.events).toHaveLength(1);
  });

  enqueueSnackbarFn.mockClear();

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  expect(result.current.events).toHaveLength(0);

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 삭제되었습니다.', {
    variant: 'info',
  });
});

it('GET /api/events 요청 실패 시, "이벤트 로딩 실패" 에러 스낵바를 표시한다', async () => {
  server.use(createErrorHandler('get', '/api/events', 500));

  const { result } = renderHook(() => useEventOperations(false));

  expect(result.current.events).toEqual([]);

  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('이벤트 로딩 실패', {
      variant: 'error',
    });
  });
});

it('PUT /api/events/:id 요청이 404로 실패 시, "일정 저장 실패" 에러 스낵바를 표시한다', async () => {
  const mockHandler = createMockEventHandler();
  server.use(mockHandler.get(), createErrorHandler('put', '/api/events/:id', 404));

  const { result } = renderHook(() => useEventOperations(true));

  await waitFor(() => {
    expect(result.current.events).toHaveLength(1);
  });

  enqueueSnackbarFn.mockClear();

  const nonExistentEventData = {
    id: '999', // 존재하지 않는 ID
    title: '존재하지 않는 이벤트',
    date: '2025-08-21',
    startTime: '10:00',
    endTime: '11:00',
    description: '테스트',
    location: '테스트',
    category: '업무',
    repeat: { type: 'none' as const, interval: 1 },
    notificationTime: 10,
  };

  await act(async () => {
    await result.current.saveEvent(nonExistentEventData);
  });

  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', {
      variant: 'error',
    });
  });
});

it('DELETE /api/events/:id 요청이 네트워크 오류로 실패 시, "일정 삭제 실패" 에러 스낵바를 표시한다', async () => {
  const mockHandler = createMockEventHandler();
  server.use(mockHandler.get(), createErrorHandler('delete', '/api/events/:id', 500));

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(result.current.events).toHaveLength(1);
  });

  enqueueSnackbarFn.mockClear();

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 삭제 실패', {
      variant: 'error',
    });
  });
});
