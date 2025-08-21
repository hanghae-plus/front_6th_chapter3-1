import { act, renderHook, waitFor } from '@testing-library/react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeleteError,
  setupMockHandlerDeletion,
  setupMockHandlerLoadingError,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { Event } from '../../types.ts';
import { createEvent } from '../utils.ts';

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

it('저장되어있는 초기 이벤트 데이터를 불러오면 토스트 메시지가 노출된다.', async () => {
  const mockEvents = [
    createEvent({
      id: '1',
      title: 'Event',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
    }),
    createEvent({
      id: '2',
      title: '이벤트',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
    }),
  ];

  setupMockHandlerCreation(mockEvents);

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(result.current.events).toEqual(mockEvents);
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 로딩 완료!', { variant: 'info' });
});

it('이벤트를 추가하면 일정이 추가되고 토스트 메시지가 노출된다', async () => {
  const mockEvents: Event[] = [];
  setupMockHandlerCreation(mockEvents);

  const { result } = renderHook(() => useEventOperations(false));

  const newEvent = createEvent({
    id: 'event',
    title: '이벤트 추가',
    date: '2025-10-15',
    startTime: '09:00',
    endTime: '10:00',
  });

  await act(async () => {
    await result.current.saveEvent(newEvent);
  });

  await waitFor(() => {
    // id가 랜덤이라 toEqual 사용 불가
    expect(result.current.events[0]).toMatchObject({ title: newEvent.title, date: newEvent.date });
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 추가되었습니다.', { variant: 'success' });
});

it("기존 일정에서 'title', 'endTime' 값을 업데이트 하면 일정이 업데이트 되고 토스트 메시지가 노출된다.", async () => {
  setupMockHandlerUpdating();

  const { result } = renderHook(() => useEventOperations(true));

  await waitFor(() => {
    expect(result.current.events).toHaveLength(1);
  });

  const initialEvent = result.current.events[0];

  // 일정 수정
  const updatedEvent = {
    ...initialEvent,
    title: '이벤트 수정',
    endTime: '12:00',
  };

  await act(async () => {
    await result.current.saveEvent(updatedEvent as Event);
  });

  const savedUpdatedEvent = result.current.events.find((event) => event.id === updatedEvent.id);

  await waitFor(() => {
    expect(savedUpdatedEvent?.title).toBe('이벤트 수정');
    expect(savedUpdatedEvent?.endTime).toBe('12:00');
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 수정되었습니다.', { variant: 'success' });
});

it('존재하는 이벤트 삭제 시 아이템이 삭제되고 토스트 메시지가 노출된다', async () => {
  setupMockHandlerDeletion();

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(result.current.events).toHaveLength(1);
  });

  await act(async () => {
    await result.current.deleteEvent(result.current.events[0].id);
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 삭제되었습니다.', { variant: 'info' });
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  setupMockHandlerLoadingError();

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('이벤트 로딩 실패', { variant: 'error' });
  });

  expect(result.current.events).toHaveLength(0);
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  setupMockHandlerUpdating();

  const { result } = renderHook(() => useEventOperations(true));

  await waitFor(() => {
    expect(result.current.events).toHaveLength(1);
  });

  const updatedEvent = {
    id: 'noExistEvent',
    title: '존재하지 않는 이벤트',
    date: '2025-01-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '테스트',
    location: '테스트 장소',
    category: '테스트',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  await act(async () => {
    await result.current.saveEvent(updatedEvent as Event);
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', { variant: 'error' });
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  setupMockHandlerDeleteError();

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(result.current.events).toHaveLength(1);
  });

  await act(async () => {
    await result.current.deleteEvent(result.current.events[0].id);
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 삭제 실패', { variant: 'error' });
});
