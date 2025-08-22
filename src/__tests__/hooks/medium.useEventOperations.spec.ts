import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils';
import { useEventOperations } from '../../hooks/useEventOperations';
import { server } from '../../setupTests';
import type { Event } from '../../types';

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
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '팀 회의',
      date: '2025-08-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
  ];

  setupMockHandlerCreation(mockEvents);

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => await result.current.fetchEvents());
  expect(result.current.events).toEqual(mockEvents);
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  const newEvent: Omit<Event, 'id'> = {
    title: '프로젝트 회의',
    date: '2025-08-20',
    startTime: '14:00',
    endTime: '15:00',
    description: '주간 프로젝트 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => await result.current.saveEvent(newEvent));
  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 추가되었습니다.', { variant: 'success' });
  expect(result.current.events).toHaveLength(2);
  expect(result.current.events[1].title).toEqual(newEvent.title);
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  setupMockHandlerUpdating();

  const { result } = renderHook(() => useEventOperations(true));

  const updatedEvent: Event = {
    id: '1',
    title: '수정된 회의',
    date: '2025-10-15',
    startTime: '09:00',
    endTime: '10:30',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  await act(async () => await result.current.fetchEvents());
  await act(async () => await result.current.saveEvent(updatedEvent));
  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 수정되었습니다.', { variant: 'success' });
  expect(result.current.events[0].title).toBe('수정된 회의');
  expect(result.current.events[0].endTime).toBe('10:30');
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  setupMockHandlerDeletion();

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => await result.current.fetchEvents());
  expect(result.current.events).toHaveLength(1);

  await act(async () => await result.current.deleteEvent('1'));
  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 삭제되었습니다.', { variant: 'info' });
  expect(result.current.events).toHaveLength(0);
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  server.use(
    http.get('/api/events', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => await result.current.fetchEvents());
  expect(enqueueSnackbarFn).toHaveBeenCalledWith('이벤트 로딩 실패', { variant: 'error' });
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  server.use(
    http.put('/api/events/:id', () => {
      return new HttpResponse(null, { status: 404 });
    })
  );

  const { result } = renderHook(() => useEventOperations(true));

  const nonExistentEvent: Event = {
    id: '404',
    title: '존재하지 않는 이벤트',
    date: '2025-08-20',
    startTime: '10:00',
    endTime: '11:00',
    description: '테스트용',
    location: '테스트',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  await act(async () => await result.current.saveEvent(nonExistentEvent));
  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', { variant: 'error' });
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  server.use(
    http.delete('/api/events/:id', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => await result.current.deleteEvent('1'));
  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 삭제 실패', { variant: 'error' });
});
