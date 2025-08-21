import { renderHook, waitFor } from '@testing-library/react';
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

beforeEach(() => {
  enqueueSnackbarFn.mockClear();
});

afterEach(() => {
  server.resetHandlers();
});

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '테스트 이벤트',
      date: '2025-01-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '테스트',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    })
  );

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0]).toEqual(mockEvents[0]);
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 로딩 완료!', { variant: 'info' });
  });
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  const newEvent: Omit<Event, 'id'> = {
    title: '새 이벤트',
    date: '2025-01-16',
    startTime: '14:00',
    endTime: '15:00',
    description: '새로운 이벤트',
    location: '새 장소',
    category: '새 카테고리',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 15,
  };

  setupMockHandlerCreation();

  const { result } = renderHook(() => useEventOperations(false));
  result.current.saveEvent(newEvent);

  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 추가되었습니다.', {
      variant: 'success',
    });
  });
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  const existingEvent: Event = {
    id: '1',
    title: '기존 이벤트',
    date: '2025-01-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '기존 설명',
    location: '기존 장소',
    category: '기존',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  const updatedEvent: Event = {
    ...existingEvent,
    title: '수정된 이벤트',
    endTime: '11:00',
  };

  setupMockHandlerUpdating();

  const { result } = renderHook(() => useEventOperations(true));
  result.current.saveEvent(updatedEvent);

  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 수정되었습니다.', {
      variant: 'success',
    });
  });
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  setupMockHandlerDeletion();

  const { result } = renderHook(() => useEventOperations(false));
  result.current.deleteEvent('1');

  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 삭제되었습니다.', { variant: 'info' });
  });
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  server.use(
    http.get('/api/events', () => {
      return HttpResponse.error();
    })
  );

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('이벤트 로딩 실패', { variant: 'error' });
    expect(result.current.events).toHaveLength(0);
  });
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  const nonExistentEvent: Event = {
    id: '999',
    title: '존재하지 않는 이벤트',
    date: '2025-01-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '존재하지 않는 설명',
    location: '존재하지 않는 장소',
    category: '존재하지 않는',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  server.use(
    http.put(`/api/events/${nonExistentEvent.id}`, () => {
      return HttpResponse.error();
    })
  );

  const { result } = renderHook(() => useEventOperations(true));
  result.current.saveEvent(nonExistentEvent);

  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', { variant: 'error' });
  });
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  server.use(
    http.delete('/api/events/1', () => {
      return HttpResponse.error();
    })
  );

  const { result } = renderHook(() => useEventOperations(false));
  result.current.deleteEvent('1');

  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 삭제 실패', { variant: 'error' });
  });
});
