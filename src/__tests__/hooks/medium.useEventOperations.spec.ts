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

describe('useEventOperations', () => {
  beforeEach(() => {
    // mock 이벤트 초기화
    enqueueSnackbarFn.mockClear();
  });

  it('저장되어있는 초기 이벤트가 없을 경우 빈 배열을 가져온다.', async () => {
    const initEvents: Event[] = [];
    setupMockHandlerCreation(initEvents);

    const { result } = renderHook(() => useEventOperations(false));

    expect(result.current.events).toEqual([]);
  });

  it('저장되어있는 초기 이벤트가 있을 경우 데이터를 적절하게 불러온다', async () => {
    const createEvents: Event[] = [
      {
        id: '1',
        title: '회의 시간',
        date: '2025-07-15',
        startTime: '10:10',
        endTime: '11:10',
        description: '팀 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10, // 10분전
      },
    ];

    await act(async () => {
      setupMockHandlerCreation(createEvents);
    });

    const { result } = renderHook(() => useEventOperations(false));

    await waitFor(() => {
      expect(result.current.events).toHaveLength(1);
    });

    expect(result.current.events).toEqual([createEvents[0]]);
  });

  it('이벤트 정보를 받아 기존 이벤트 배열에 정상적으로 저장이 된다', async () => {
    const initEvents: Event[] = [];
    setupMockHandlerCreation(initEvents);

    const newEvent: Event = {
      id: '1',
      title: '새로운 회의',
      date: '2025-07-16',
      startTime: '12:00',
      endTime: '13:00',
      description: '새로운 팀 미팅',
      location: '회의실 D',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 15,
    };

    const { result } = renderHook(() => useEventOperations(false));

    await act(async () => {
      await result.current.saveEvent(newEvent);
    });

    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0]).toEqual(newEvent);
    expect(enqueueSnackbarFn).toHaveBeenLastCalledWith('일정이 추가되었습니다.', {
      variant: 'success',
    });
  });

  it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
    setupMockHandlerUpdating();

    const { result } = renderHook(() => useEventOperations(true));

    // 초기 이벤트 로드 기다린 이후에 확인
    await waitFor(() => {
      expect(result.current.events).toHaveLength(2);
    });

    const [event1, event2] = result.current.events;

    await act(async () => {
      await result.current.saveEvent({
        ...event1,
        title: '업데이트된 회의',
        endTime: '10:30',
      });
    });

    expect(result.current.events).toHaveLength(2);
    expect(result.current.events[0]).not.toEqual(event1);
    expect(result.current.events[0].title).toBe('업데이트된 회의');
    expect(result.current.events[0].endTime).toBe('10:30');
    expect(result.current.events[1]).toEqual(event2);
    expect(enqueueSnackbarFn).toHaveBeenLastCalledWith('일정이 수정되었습니다.', {
      variant: 'success',
    });
  });

  it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
    setupMockHandlerDeletion();

    const { result } = renderHook(() => useEventOperations(false));

    // 초기 이벤트 로드 기다린 이후에 확인
    await waitFor(() => {
      expect(result.current.events).toHaveLength(1);
    });

    const eventToDelete = result.current.events[0];

    await act(async () => {
      await result.current.deleteEvent(eventToDelete.id);
    });

    expect(result.current.events).toHaveLength(0);
    expect(enqueueSnackbarFn).toHaveBeenLastCalledWith('일정이 삭제되었습니다.', {
      variant: 'info',
    });
  });

  it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: [] }, { status: 500 });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await act(async () => {
      await result.current.fetchEvents();
    });

    expect(enqueueSnackbarFn).toHaveBeenLastCalledWith('이벤트 로딩 실패', {
      variant: 'error',
    });
  });

  it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
    server.use(
      http.put('/api/events/:id', () => {
        return HttpResponse.json({}, { status: 404 });
      })
    );

    const { result } = renderHook(() => useEventOperations(true));

    await act(async () => {
      await result.current.saveEvent({
        id: 'no-id',
        title: '수정할 이벤트',
        date: '2025-07-17',
        startTime: '14:00',
        endTime: '15:00',
        description: '수정할 이벤트 설명',
        location: '회의실 E',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      });
    });

    await waitFor(() => {
      expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', {
        variant: 'error',
      });
    });
  });

  it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
    server.use(
      http.delete('/api/events/:id', () => {
        return HttpResponse.json({}, { status: 500 });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await act(async () => {
      await result.current.deleteEvent('1');
    });

    await waitFor(() => {
      expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 삭제 실패', {
        variant: 'error',
      });
    });
  });
});
