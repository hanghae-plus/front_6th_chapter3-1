import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event, EventForm } from '../../types.ts';

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
  const mockEvents = [
    {
      id: 'test-event-1',
      title: '테스트 이벤트',
      date: '2025-01-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '테스트용 이벤트',
      location: '테스트 장소',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
  ];
  setupMockHandlerCreation(mockEvents as Event[]);

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(result.current.events).toEqual(mockEvents);
  });
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  setupMockHandlerCreation([]);

  const newEvent = {
    title: '새로운 회의',
    date: '2025-01-15',
    startTime: '14:00',
    endTime: '15:00',
    description: '새 프로젝트 미팅',
    location: '회의실 C',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 5,
  } as EventForm;

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.saveEvent(newEvent);
  });

  await waitFor(() => {
    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0]).toMatchObject(newEvent);
    expect(result.current.events[0].id).toBeDefined();
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 추가되었습니다.', { variant: 'success' });
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  const existingEvent = {
    id: 'existing-1',
    title: '기존 회의',
    date: '2025-01-15',
    startTime: '10:00',
    endTime: '11:00',
    description: '기존 설명',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  } as Event;

  setupMockHandlerUpdating([existingEvent]);

  const { result } = renderHook(() => useEventOperations(true));

  const updatedEvent = {
    ...existingEvent,
    title: '수정된 회의',
    endTime: '12:00',
  } as EventForm;

  await act(async () => {
    await result.current.saveEvent(updatedEvent);
  });

  await waitFor(() => {
    const updatedEvent = result.current.events.find((event) => event.id === existingEvent.id);
    expect(updatedEvent?.title).toBe('수정된 회의');
    expect(updatedEvent?.endTime).toBe('12:00');
    expect(updatedEvent?.startTime).toBe('10:00');
    expect(updatedEvent?.location).toBe('회의실 A');
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 수정되었습니다.', { variant: 'success' });
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  const existingEvent = {
    id: 'existing-1',
    title: '기존 회의',
    date: '2025-01-15',
    startTime: '10:00',
    endTime: '11:00',
    description: '기존 설명',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  } as Event;

  setupMockHandlerDeletion([existingEvent]);

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.deleteEvent(existingEvent.id);
  });

  await waitFor(() => {
    expect(result.current.events).toHaveLength(0);
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 삭제되었습니다.', { variant: 'info' });
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ error: 'Server Error' }, { status: 500 });
    })
  );

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('이벤트 로딩 실패', { variant: 'error' });
  });

  expect(result.current.events).toHaveLength(0);
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  server.use(
    http.put('/api/events/:id', () => {
      return HttpResponse.json({ error: 'Event not found' }, { status: 404 });
    })
  );

  const { result } = renderHook(() => useEventOperations(true));

  const nonExistentEvent = {
    id: 'non-existent-id',
    title: '수정할 이벤트',
    date: '2025-01-15',
    startTime: '10:00',
    endTime: '11:00',
    description: '존재하지 않는 이벤트',
    location: '어딘가',
    category: '업무',
    repeat: { type: 'none' as const, interval: 0 },
    notificationTime: 10,
  };

  await act(async () => {
    await result.current.saveEvent(nonExistentEvent);
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', { variant: 'error' });
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  server.use(
    http.delete('/api/events/:id', () => {
      return HttpResponse.json({ error: 'Network Error' }, { status: 500 });
    })
  );

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.deleteEvent('existing-1');
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 삭제 실패', { variant: 'error' });
});
