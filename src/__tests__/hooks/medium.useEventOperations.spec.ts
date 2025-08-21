import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { createTestEvent } from '../utils.ts';
import { createMockHandlers } from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';

const initialEventData = [
  createTestEvent({
    id: '1',
    title: '테스트 이벤트',
    date: '2025-08-21',
    startTime: '10:00',
    endTime: '11:00',
  }),
  createTestEvent({
    id: '2',
    title: '테스트 이벤트2',
    date: '2025-08-22',
    startTime: '10:00',
    endTime: '11:00',
  }),
  createTestEvent({
    id: '3',
    title: '테스트 이벤트3',
    date: '2025-08-23',
    startTime: '10:00',
    endTime: '11:00',
  }),
];

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

beforeEach(() => {
  enqueueSnackbarFn.mockClear();
});

describe('초기 이벤트 데이터 로드', () => {
  // 저장되어있는 초기 이벤트 데이터를 적절하게 불러온다
  it('초기 이벤트 데이터와 로드된 이벤트 데이터가 동일해야 한다.', async () => {
    const { handlers, getEvents } = createMockHandlers(initialEventData);
    server.use(...handlers);

    const { result } = renderHook(() => useEventOperations(false));

    expect(result.current.events).toEqual([]);

    await waitFor(() => {
      const events = result.current.events;
      expect(events).toHaveLength(initialEventData.length);
    });

    const currentEvents = result.current.events;
    const mockedEvents = getEvents();

    expect(currentEvents).toEqual(mockedEvents);
  });
});

describe('이벤트 생성/수정/삭제', () => {
  // 정의된 이벤트 정보를 기준으로 적절하게 저장이 된다
  it('사용자가 새롭게 입력한 정보가 저장된다.', async () => {
    const { handlers, getEvents } = createMockHandlers();
    server.use(...handlers);

    const { result } = renderHook(() => useEventOperations(false));

    act(() => {
      result.current.saveEvent({
        title: '운동가기',
        date: '2025-10-15',
        startTime: '10:00:00',
        endTime: '11:00:00',
        description: '헬스장에 가서 운동을 한다.',
        location: '헬스장',
        category: '운동',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 0,
      });
    });

    await waitFor(() => {
      const currentEvents = result.current.events;
      const mockedEvents = getEvents();

      expect(currentEvents).toEqual(mockedEvents);
    });
  });

  it('사용자가 수정한 정보가 저장된다.', async () => {
    const { handlers, getEvents } = createMockHandlers(initialEventData);
    server.use(...handlers);

    const { result } = renderHook(() => useEventOperations(true));

    act(() => {
      result.current.saveEvent({
        id: '1',
        title: '운동가기',
        date: '2025-10-15',
        startTime: '13:00:00',
        endTime: '14:00:00',
        description: '헬스장에 가서 운동을 한다.',
        location: '헬스장',
        category: '운동',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 0,
      });
    });

    await waitFor(() => {
      const currentEvents = result.current.events;
      const mockedEvents = getEvents();

      expect(currentEvents).toEqual(mockedEvents);
    });
  });

  it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
    const { handlers, getEvents } = createMockHandlers(initialEventData);
    server.use(...handlers);

    const { result } = renderHook(() => useEventOperations(true));

    act(() => {
      result.current.saveEvent({
        id: '1',
        title: '운동가기(헬스장)',
        date: '2025-10-15',
        startTime: '13:00:00',
        endTime: '15:00:00',
        description: '헬스장에 가서 운동을 한다.',
        location: '헬스장',
        category: '운동',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 0,
      });
    });

    await waitFor(() => {
      const updatedEvents = getEvents();
      const updateEvent = updatedEvents.find((event: Event) => event.id === '1');

      expect(updateEvent?.title).toBe('운동가기(헬스장)');
      expect(updateEvent?.endTime).toBe('15:00:00');
    });
  });

  it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
    const { handlers, getEvents } = createMockHandlers();
    server.use(...handlers);

    const { result } = renderHook(() => useEventOperations(false));

    act(() => {
      result.current.deleteEvent('1');
    });

    await waitFor(() => {
      expect(result.current.events).toEqual(getEvents());
    });
  });
});

describe('이벤트 로딩 실패', () => {
  it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
    const { handlers } = createMockHandlers(initialEventData);
    server.use(...handlers);
    server.use(http.get('/api/events', () => HttpResponse.error()));

    renderHook(() => useEventOperations(false));

    await waitFor(() => {
      expect(enqueueSnackbarFn).toHaveBeenCalledWith('이벤트 로딩 실패', { variant: 'error' });
    });
  });
});

describe('존재하지 않는 이벤트 수정', () => {
  it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
    const { handlers } = createMockHandlers(initialEventData);
    server.use(...handlers);

    server.use(http.put('/api/events/:id', () => HttpResponse.error()));

    const { result } = renderHook(() => useEventOperations(true));

    act(() => {
      result.current.saveEvent({
        id: '999',
        title: '수정된 이벤트',
        date: '2025-10-15',
        startTime: '10:00:00',
        endTime: '11:00:00',
        description: '수정된 설명',
        location: '수정된 위치',
        category: '수정된 카테고리',
        repeat: { type: 'none' as const, interval: 0 },
        notificationTime: 0,
      });
    });

    await waitFor(() => {
      expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', { variant: 'error' });
    });
  });
});

describe('네트워크 오류', () => {
  it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
    const { handlers } = createMockHandlers(initialEventData);
    server.use(...handlers);
    server.use(http.delete('/api/events/:id', () => HttpResponse.error()));

    const { result } = renderHook(() => useEventOperations(false));

    act(() => {
      result.current.deleteEvent('1');
    });

    await waitFor(() => {
      expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 삭제 실패', { variant: 'error' });
    });
  });
});
