import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { EventForm } from '../../types.ts';
import { createMockEvent } from '../utils.ts';

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

it('fetchEvents를 실행하면 이벤트 데이터를 로드하고 그 결과를 State에 반영한다', async () => {
  const events = [createMockEvent(1), createMockEvent(2)];
  setupMockHandlerCreation(events);

  const { result } = renderHook(() => useEventOperations(false));

  expect(result.current.events).toEqual([]);

  await act(async () => {
    await result.current.fetchEvents();
  });

  expect(result.current.events).toEqual(events);
});

it('saveEvent를 실행하면 이벤트 데이터를 저장하고 그 결과를 State에 반영한다', async () => {
  const events = [createMockEvent(1)];
  const newEvent: EventForm = {
    title: '새로운 회의',
    date: '2025-10-15',
    startTime: '10:00',
    endTime: '11:00',
    description: '새로운 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  setupMockHandlerCreation(events);

  const { result } = renderHook(() => useEventOperations(false));

  expect(result.current.events).toEqual([]);

  await act(async () => {
    await result.current.saveEvent(newEvent);
  });

  expect(result.current.events).toHaveLength(2);
  expect(result.current.events).toEqual([...events, { ...newEvent, id: '2' }]);
});

it("'title', 'endTime'을 변경하면 이벤트 데이터가 업데이트된다", async () => {
  setupMockHandlerUpdating();

  const { result } = renderHook(() => useEventOperations(true));
  const mockEvents = [
    {
      id: '1',
      title: '기존 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '새로운 회의',
      date: '2025-10-15',
      startTime: '11:00',
      endTime: '12:00',
      description: '새로운 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  await act(async () => {
    await result.current.fetchEvents();
  });

  expect(result.current.events).toEqual(mockEvents);

  await act(async () => {
    await result.current.saveEvent({
      id: '1',
      title: '변경된 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '12:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    });
  });

  expect(result.current.events).toEqual([
    {
      id: '1',
      title: '변경된 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '12:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '새로운 회의',
      date: '2025-10-15',
      startTime: '11:00',
      endTime: '12:00',
      description: '새로운 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ]);
});

it('이벤트 삭제 시 이벤트 리스트에서 삭제된다.', async () => {
  setupMockHandlerDeletion();

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.fetchEvents();
  });

  expect(result.current.events).toHaveLength(1);
  expect(result.current.events).toEqual([
    {
      id: '1',
      title: '기존 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ]);

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  expect(result.current.events).toHaveLength(0);
  expect(result.current.events).toEqual([]);
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시된다", async () => {
  server.use(
    http.get('/api/events', () => {
      return HttpResponse.error();
    })
  );

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.fetchEvents();
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('이벤트 로딩 실패', { variant: 'error' });
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 텍스트와 함께 에러 토스트가 표시된다", async () => {
  setupMockHandlerUpdating();

  const { result } = renderHook(() => useEventOperations(true));

  await act(async () => {
    await result.current.saveEvent({
      id: '3',
      title: '기존 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    });
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', { variant: 'error' });
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트와 함께 에러 토스트가 표시된다", async () => {
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
