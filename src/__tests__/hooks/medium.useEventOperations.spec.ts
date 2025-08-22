import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { events } from '../../__mocks__/response/events.json' assert { type: 'json' };
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
    vi.clearAllMocks();
    enqueueSnackbarFn.mockClear();
  });

  it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: events as Event[] }, { status: 200 });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await waitFor(() => {
      expect(result.current.events).toEqual(events);
    });

    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 로딩 완료!', { variant: 'info' });
  });

  it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
    let mockEvents = [...(events as Event[])];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents }, { status: 200 });
      }),
      http.post('/api/events', async ({ request }) => {
        const eventData = await request.json();
        const eventWithId: Event = {
          ...(eventData as Event),
          id: 'new-id-123',
        };
        mockEvents.push(eventWithId);
        return HttpResponse.json(
          {
            success: true,
            event: eventWithId,
            message: '일정이 성공적으로 추가되었습니다.',
          },
          { status: 201 }
        );
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await waitFor(() => {
      expect(result.current.events).toEqual(events);
    });

    const newEvent: Event = {
      id: '1',
      title: '테스트 이벤트',
      date: '2025-05-14',
      startTime: '10:00',
      endTime: '11:00',
      description: '테스트 이벤트 설명',
      location: '테스트 장소',
      category: '테스트 카테고리',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    act(() => {
      result.current.saveEvent(newEvent);
    });

    await waitFor(() => {
      expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 추가되었습니다.', {
        variant: 'success',
      });
    });
  });

  it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
    let mockEvents = [...(events as Event[])];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents }, { status: 200 });
      }),
      http.put('/api/events/:id', async ({ request, params }) => {
        const eventData = await request.json();
        const index = mockEvents.findIndex((event) => event.id === params.id);

        if (index !== -1) {
          mockEvents[index] = { ...mockEvents[index], ...(eventData as Partial<Event>) };
        }

        return HttpResponse.json(
          {
            success: true,
            event: mockEvents[index],
            message: '일정이 성공적으로 수정되었습니다.',
          },
          { status: 200 }
        );
      })
    );

    const { result } = renderHook(() => useEventOperations(true));

    await waitFor(() => {
      expect(result.current.events).toEqual(events);
    });

    const event = events[0] as Event;
    const updatedEvent: Event = {
      ...event,
      title: '수정된 이벤트',
      endTime: '12:00',
    };

    act(() => {
      result.current.saveEvent(updatedEvent);
    });

    await waitFor(() => {
      expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 수정되었습니다.', {
        variant: 'success',
      });
    });
  });

  it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
    let mockEvents = [...(events as Event[])];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents }, { status: 200 });
      }),
      http.delete('/api/events/:id', ({ params }) => {
        const index = mockEvents.findIndex((event) => event.id === params.id);

        if (index !== -1) {
          mockEvents.splice(index, 1);
        }

        return HttpResponse.json({ event: events[0] }, { status: 200 });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await waitFor(() => {
      expect(result.current.events).toEqual(events);
    });

    const initialLength = result.current.events.length;

    act(() => {
      result.current.deleteEvent(events[0].id);
    });

    await waitFor(() => {
      expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 삭제되었습니다.', { variant: 'info' });
    });

    // 실제로 이벤트가 삭제되었는지 검증
    await waitFor(() => {
      expect(result.current.events.length).toBe(initialLength - 1);
    });
  });

  it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await waitFor(() => {
      expect(enqueueSnackbarFn).toHaveBeenCalledWith('이벤트 로딩 실패', { variant: 'error' });
    });

    expect(result.current.events).toEqual([]);
  });

  it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
    let mockEvents = [...(events as Event[])];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents }, { status: 200 });
      }),
      http.put('/api/events/:id', () => {
        return HttpResponse.json({ error: '이벤트를 찾을 수 없습니다.' }, { status: 404 });
      })
    );

    const { result } = renderHook(() => useEventOperations(true));

    await waitFor(() => {
      expect(result.current.events).toEqual(events);
    });

    const event = events[0] as Event;
    const updatedEvent: Event = {
      ...event,
      id: '2',
      title: '수정된 이벤트',
    };

    act(() => {
      result.current.saveEvent(updatedEvent);
    });

    await waitFor(() => {
      expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', { variant: 'error' });
    });

    expect(result.current.events).toEqual(events);
  });

  it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
    let mockEvents = [...(events as Event[])];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents }, { status: 200 });
      }),
      http.delete('/api/events/:id', () => {
        return HttpResponse.json({ error: 'Network Error' }, { status: 500 });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await waitFor(() => {
      expect(result.current.events).toEqual(events);
    });

    const initialLength = result.current.events.length;

    act(() => {
      result.current.deleteEvent(events[0].id);
    });

    await waitFor(() => {
      expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 삭제 실패', { variant: 'error' });
    });

    // 삭제 실패 시 이벤트 개수가 변하지 않았는지 검증
    expect(result.current.events.length).toBe(initialLength);
  });
});
