import { act, renderHook } from '@testing-library/react';

import { setupMockErrorHandler, setupMockHandler } from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { Event, EventForm } from '../../types.ts';
import { events as initialEvents } from '../../__mocks__/response/events.json' assert { type: 'json' };

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
    setupMockHandler();
  });

  it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
    const { result } = renderHook(() => useEventOperations(false));

    await act(async () => {
      await result.current.fetchEvents();
    });

    const { events } = result.current;
    const expected = initialEvents;

    console.log('events:', events);
    
    expect(events).toEqual(expected);
  });

  it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
    const { result } = renderHook(() => useEventOperations(false));

    const newEvent: EventForm = {
      title: '테스트',
      date: '2025-01-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    await act(async () => {
      await result.current.saveEvent(newEvent);
    });

    const { events } = result.current;

    console.log('events:', events);

    expect(events).toHaveLength(initialEvents.length + 1);
    expect(events[events.length - 1].title).toBe(newEvent.title);
    expect(events[events.length - 1].date).toBe(newEvent.date);
    expect(events[events.length - 1].startTime).toBe(newEvent.startTime);
    expect(events[events.length - 1].endTime).toBe(newEvent.endTime);
  });

  it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
    const { result } = renderHook(() => useEventOperations(true));

    await act(async () => {
      await result.current.fetchEvents();
    });

    const prevEvent = result.current.events[0];

    await act(async () => {
      await result.current.saveEvent({
        ...prevEvent,
        title: '테스트 수정',
        endTime: '11:00',
      });
    });

    const { events } = result.current;

    console.log('events:', events);

    expect(events[events.length - 1].title).toBe('테스트 수정');
    expect(events[events.length - 1].endTime).toBe('11:00');
  });

  it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
    const { result } = renderHook(() => useEventOperations(true));

    await act(async () => {
      await result.current.fetchEvents();
    });

    const prevEvent = result.current.events[0];

    await act(async () => {
      await result.current.deleteEvent(prevEvent.id);
    });

    const { events } = result.current;

    expect(events).toHaveLength(initialEvents.length - 1);
    expect(events).not.toContain(prevEvent);
  });

  it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
    const { result } = renderHook(() => useEventOperations(true));

    await act(async () => {
      await result.current.fetchEvents();
    });

    const prevEvent = result.current.events[0];
    const notExistEvent: Event = {
      id: 'notExistEvent',
      title: '테스트',
      date: '2025-01-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };
    
    expect(prevEvent.id).not.toBe(notExistEvent.id);

    await act(async () => {
      await result.current.saveEvent(notExistEvent);
    });

    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', { variant: 'error' });
  });
});

describe('useEventOperations 500 Error', () => {
  beforeEach(() => {
    setupMockErrorHandler();
  });
  
  it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
    const { result } = renderHook(() => useEventOperations(true));

    await act(async () => {
      await result.current.fetchEvents();
    });

    expect(enqueueSnackbarFn).toHaveBeenCalledWith('이벤트 로딩 실패', { variant: 'error' });
  });
  
  it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
    const { result } = renderHook(() => useEventOperations(true));

    await act(async () => {
      await result.current.deleteEvent('notExistEvent');
    });

    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 삭제 실패', { variant: 'error' });
  });
});