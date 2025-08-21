import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { expect } from 'vitest';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { EventForm } from '../../types.ts';
import { createEvent } from '../__fixture__/eventFactory.ts';

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
  // 초기 데이터 설정?
  setupMockHandlerCreation([createEvent({ id: '1', date: '2025-01-01', title: 'event 1' })]);

  const { result } = renderHook(() => useEventOperations(false, enqueueSnackbarFn));

  await waitFor(() => {
    expect(result.current.events).toHaveLength(1);
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 로딩 완료!', { variant: 'info' });
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  setupMockHandlerCreation([]);

  const { result } = renderHook(() => useEventOperations(false, enqueueSnackbarFn));
  await waitFor(() => {
    expect(result.current.events).toHaveLength(0);
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 로딩 완료!', { variant: 'info' });

  const addEvent: EventForm = {
    date: '2025-07-01',
    startTime: '12:00',
    endTime: '13:00',
    title: '점심',
    description: '점심시간',
    location: '회사',
    category: '휴식',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };
  await act(async () => {
    await result.current.saveEvent(addEvent);
  });
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  setupMockHandlerUpdating();
  const { result } = renderHook(() => useEventOperations(true, enqueueSnackbarFn));
  await waitFor(() => {
    expect(result.current.events).toHaveLength(2);
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 로딩 완료!', { variant: 'info' });

  await act(async () => {
    await result.current.saveEvent({
      ...result.current.events[0],
      title: 'edit 회의12',
      endTime: '13:00',
    });
  });

  expect(result.current.events).toEqual([
    { ...result.current.events[0], title: 'edit 회의12', endTime: '13:00' },

    result.current.events[1],
  ]);
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  setupMockHandlerDeletion();

  const { result } = renderHook(() => useEventOperations(false, enqueueSnackbarFn));
  await waitFor(() => {
    expect(result.current.events).toHaveLength(1);
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 로딩 완료!', { variant: 'info' });

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  expect(result.current.events).toEqual([]);
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  // 일부러 에러내기
  server.use(
    http.get('/api/events', () => {
      return HttpResponse.error();
    })
  );

  renderHook(() => useEventOperations(false, enqueueSnackbarFn));

  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('이벤트 로딩 실패', { variant: 'error' });
  });
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  server.use(
    http.put('/api/events/:id', () => {
      return HttpResponse.error();
    })
  );
  const { result } = renderHook(() => useEventOperations(true, enqueueSnackbarFn));
  const editEvent = {
    id: '1',
    title: '회의2',
    date: '2025-10-15',
    startTime: '11:00',
    endTime: '12:00',
    description: '기존 팀 미팅 2',
    location: '회의실 C',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  } as EventForm;

  await act(async () => {
    await result.current.saveEvent({
      ...editEvent,
    });
  });

  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', { variant: 'error' });
  });
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  server.use(
    http.delete('/api/events/:id', () => {
      return HttpResponse.error();
    })
  );

  const { result } = renderHook(() => useEventOperations(false, enqueueSnackbarFn));
  await act(async () => {
    await result.current.deleteEvent('1');
  });

  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 삭제 실패', { variant: 'error' });
  });
});
