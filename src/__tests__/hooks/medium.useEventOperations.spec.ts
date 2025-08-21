import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { randomUUID } from 'crypto';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event, EventForm } from '../../types.ts';
import { events } from '../../__mocks__/response/events.json' assert { type: 'json' };

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

describe('useEventOperations', () => {
  beforeEach(() => {
    enqueueSnackbarFn.mockClear();
  });

  it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
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
  });

  it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
    setupMockHandlerCreation();

    const { result } = renderHook(() => useEventOperations(false));
    const newEvent: EventForm = {
      title: '추가 안건 회의',
      date: '2025-10-15',
      startTime: '13:00',
      endTime: '15:00',
      description: '추가 안건으로 인한 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const initialCount = result.current.events.length;

    await act(async () => {
      await result.current.saveEvent(newEvent);
    });

    expect(result.current.events).toHaveLength(initialCount + 1);

    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 추가되었습니다.', {
      variant: 'success',
    });
  });

  it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
    setupMockHandlerUpdating();
    const { result } = renderHook(() => useEventOperations(true));

    await act(async () => {
      await result.current.fetchEvents();
    });

    const updatedEvent: Event = {
      ...result.current.events[0],
      id: result.current.events[0].id,
      title: '수정된 내용',
      endTime: '18:00',
    };

    await act(async () => {
      await result.current.saveEvent(updatedEvent);
    });

    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 수정되었습니다.', {
      variant: 'success',
    });

    expect(result.current.events[0].title).toBe('수정된 내용');
    expect(result.current.events[0].endTime).toBe('18:00');
  });

  it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
    setupMockHandlerDeletion();

    const { result } = renderHook(() => useEventOperations(false));
    await act(async () => {
      await result.current.fetchEvents();
    });

    expect(result.current.events).toHaveLength(1);

    const initialCount = result.current.events.length;
    const removeEventId = result.current.events[0].id;

    await act(async () => {
      await result.current.deleteEvent(removeEventId);
    });

    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 삭제되었습니다.', {
      variant: 'info',
    });

    expect(result.current.events).toHaveLength(initialCount - 1);
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

    expect(enqueueSnackbarFn).toHaveBeenCalledWith('이벤트 로딩 실패', { variant: 'error' });
    expect(result.current.events).toEqual([]);
  });

  it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
    setupMockHandlerUpdating();

    const { result } = renderHook(() => useEventOperations(true));

    await act(async () => {
      await result.current.fetchEvents();
    });

    const updatedEvent: Event = {
      id: '존재하지 않는 id',
      title: '수정된 내용',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '18:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    await act(async () => {
      await result.current.saveEvent(updatedEvent);
    });

    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', {
      variant: 'error',
    });
  });

  it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
    let testEvents = [...events];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: testEvents });
      }),
      http.delete<{ id: string }>('/api/events/:id', async ({ params }) => {
        const { id: _id } = params;
        return HttpResponse.error();
      })
    );

    const { result } = renderHook(() => useEventOperations(false));
    await act(async () => {
      await result.current.fetchEvents();
    });

    const initialCount = result.current.events.length;

    await act(async () => {
      await result.current.deleteEvent('존재하지 않는 id');
    });

    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 삭제 실패', {
      variant: 'error',
    });

    expect(result.current.events).toHaveLength(initialCount);
  });
});
