import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event, EventForm } from '../../types.ts';
import { events as mockEventsData } from '../../__mocks__/response/events.json';

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
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
    const { result } = renderHook(() => useEventOperations(false));

    await waitFor(() => {
      expect(result.current.events.length).toBe(mockEventsData.length);
      expect(result.current.events[0].title).toBe('기존 회의');
    });
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 로딩 완료!', { variant: 'info' });
  });

  it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
    const { result } = renderHook(() => useEventOperations(false));
    const newEvent: EventForm = {
      title: '새 이벤트', date: '2025-07-23', startTime: '10:00', endTime: '11:00',
      description: '', location: '', category: '개인', repeat: { type: 'none', interval: 1 }, notificationTime: 10
    };

    await act(async () => {
      await result.current.saveEvent(newEvent);
    });

    expect(result.current.events.some(e => e.title === '새 이벤트')).toBe(true);
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 추가되었습니다.', { variant: 'success' });
  });

  it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
    const { result } = renderHook(() => useEventOperations(true));
    
    await waitFor(() => expect(result.current.events.length).toBe(mockEventsData.length));

    const eventToUpdate: Event = { ...result.current.events[0], title: '업데이트된 회의', endTime: '12:30' };

    await act(async () => {
      await result.current.saveEvent(eventToUpdate);
    });

    expect(result.current.events[0].title).toBe('업데이트된 회의');
    expect(result.current.events[0].endTime).toBe('12:30');
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 수정되었습니다.', { variant: 'success' });
  });

  it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
    const { result } = renderHook(() => useEventOperations(false));
    await waitFor(() => expect(result.current.events.length).toBe(mockEventsData.length));
    
    const eventToDeleteId = result.current.events[0].id;

    await act(async () => {
      await result.current.deleteEvent(eventToDeleteId);
    });

    expect(result.current.events.some(e => e.id === eventToDeleteId)).toBe(false);
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 삭제되었습니다.', { variant: 'info' });
  });

  it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
    server.use(http.get('/api/events', () => new HttpResponse(null, { status: 500 })));
    
    renderHook(() => useEventOperations(false));

    await waitFor(() => {
      expect(enqueueSnackbarFn).toHaveBeenCalledWith('이벤트 로딩 실패', { variant: 'error' });
    });
  });

  it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
    server.use(http.put('/api/events/:id', () => new HttpResponse(null, { status: 404 })));
    const { result } = renderHook(() => useEventOperations(true));
    const nonExistentEvent: Event = { id: 'non-existent', title: '없는 이벤트', date: '2025-01-01', startTime: '10:00', endTime: '11:00', description: '', location: '', category: '개인', repeat: { type: 'none', interval: 1 }, notificationTime: 10 };

    await act(async () => {
      await result.current.saveEvent(nonExistentEvent);
    });

    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', { variant: 'error' });
  });

  it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
    server.use(http.delete('/api/events/:id', () => new HttpResponse(null, { status: 500 })));
    const { result } = renderHook(() => useEventOperations(false));
    await waitFor(() => expect(result.current.events.length).toBe(mockEventsData.length));

    const eventToDeleteId = result.current.events[0].id;
    
    await act(async () => {
      await result.current.deleteEvent(eventToDeleteId);
    });

    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 삭제 실패', { variant: 'error' });
    expect(result.current.events.length).toBe(mockEventsData.length);
  });
});