import { act, renderHook, waitFor } from '@testing-library/react';

import { resetMockEvents } from '../../__mocks__/handlers.ts';
import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerLoading,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { events } from '../../__mocks__/response/events.json' assert { type: 'json' };
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';

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
  resetMockEvents();
  enqueueSnackbarFn.mockClear();
  server.resetHandlers();
});

it('저장되어있는 초기 이벤트 데이터를 불러오고 로딩완료 토스트가 표시되어야 한다', async () => {
  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(result.current.events).not.toBeNull();
    expect(result.current.events).toHaveLength(1);
  });

  // GET으로 불러온 데이터와 json의 데이터가 일치하는지 확인
  expect(result.current.events[0]).toEqual(events[0]);

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 로딩 완료!', { variant: 'info' });
});

it('새로운 이벤트 데이터를 전달하면 저장되고 성공 토스트가 표시되어야 한다', async () => {
  const { result } = renderHook(() => useEventOperations(false));

  const newEventData = {
    title: '새로운 회의',
    date: '2025-08-25',
    startTime: '14:00',
    endTime: '15:00',
    description: '신규 이벤트 테스트',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none' as const, interval: 0 },
    notificationTime: 10,
  };

  await waitFor(() => {
    expect(result.current.events).toHaveLength(1);
  });

  await act(async () => {
    await result.current.saveEvent(newEventData);
  });

  await waitFor(() => {
    expect(result.current.events).toHaveLength(2);
  });

  const addedEvent = result.current.events[1];
  expect(addedEvent).toMatchObject(newEventData);
  expect(addedEvent.id).toBeDefined();

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 추가되었습니다.', {
    variant: 'success',
  });
});

// 디테일에 따라 코드 길이가 매우 길어지므로 title과 endTime 변경만 검증하고 나머지 필드는 생략하기로 결정.
it('존재하는 이벤트 데이터를 수정하면 변경사항이 업데이트되고 수정 토스트가 표시되어야 한다', async () => {
  const { result } = renderHook(() => useEventOperations(true));

  await waitFor(() => {
    expect(result.current.events).toHaveLength(1);
  });

  const existingEvent = result.current.events[0];
  expect(existingEvent.id).toBe('1');

  const updatedEventData = {
    ...existingEvent,
    title: '수정된 회의',
    endTime: '11:00',
  };

  await act(async () => {
    await result.current.saveEvent(updatedEventData);
  });

  await waitFor(() => {
    const updatedEvent = result.current.events.find((event) => event.id === '1');
    // 수정된 값
    expect(updatedEvent?.title).toBe('수정된 회의');
    expect(updatedEvent?.endTime).toBe('11:00');
    // 유지된 값
    expect(updatedEvent?.startTime).toBe('09:00');
    expect(updatedEvent?.description).toBe('기존 팀 미팅');
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 수정되었습니다.', {
    variant: 'success',
  });
});

it('존재하는 이벤트 삭제 시 해당 이벤트가 제거되고 삭제 토스트가 표시되어야 한다.', async () => {
  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(result.current.events).toHaveLength(1);
  });

  const existingEvent = result.current.events[0];
  expect(existingEvent.id).toBe('1');

  await act(async () => {
    await result.current.deleteEvent(existingEvent.id);
  });

  await waitFor(() => {
    expect(result.current.events).toHaveLength(0);
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 삭제되었습니다.', {
    variant: 'info',
  });
});

it("새로운 이벤트 생성 실패 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  // MSW 핸들러를 생성 실패로 설정
  setupMockHandlerCreation();

  const { result } = renderHook(() => useEventOperations(false));

  // 초기 데이터 로딩 대기
  await waitFor(() => {
    expect(result.current.events).toHaveLength(1);
  });

  const newEventData = {
    title: '새로운 회의',
    date: '2025-08-25',
    startTime: '14:00',
    endTime: '15:00',
    description: '생성 실패 테스트',
    location: '회의실 C',
    category: '업무',
    repeat: { type: 'none' as const, interval: 0 },
    notificationTime: 10,
  };

  // 네트워크 오류 상황에서 이벤트 생성 시도
  await act(async () => {
    await result.current.saveEvent(newEventData);
  });

  // 에러 토스트 메시지 확인
  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', {
      variant: 'error',
    });
  });

  // 생성 실패로 인해 events 상태가 변경되지 않았는지 확인
  expect(result.current.events).toHaveLength(1);
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  // MSW 핸들러를 로딩 실패로 설정
  setupMockHandlerLoading();

  const { result } = renderHook(() => useEventOperations(false));

  // 서버 에러처리를 기다려야하므로 waitFor 래핑
  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('이벤트 로딩 실패', {
      variant: 'error',
    });
  });

  expect(result.current.events).toHaveLength(0);
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  // MSW 핸들러를 404 에러로 설정
  setupMockHandlerUpdating();

  const { result } = renderHook(() => useEventOperations(true));

  await waitFor(() => {
    expect(result.current.events).toHaveLength(1);
  });

  const notExistentEvent = {
    id: '존재하지 않는 ID',
    title: '존재하지 않는 이벤트',
    date: '2025-08-30',
    startTime: '10:00',
    endTime: '11:00',
    description: '존재하지 않는 설명',
    location: '존재하지 않는 장소',
    category: '존재하지 않는 카테고리',
    repeat: { type: 'none' as const, interval: 0 },
    notificationTime: 0,
  };

  await act(async () => {
    await result.current.saveEvent(notExistentEvent);
  });

  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', {
      variant: 'error',
    });
  });

  // 아무 일도 일어나지 않았으므로 초기 데이터 그대로 유지
  expect(result.current.events).toHaveLength(1);
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  // MSW 핸들러를 네트워크 에러로 설정
  setupMockHandlerDeletion();

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(result.current.events).toHaveLength(1);
  });

  const existingEvent = result.current.events[0];
  expect(existingEvent.id).toBe('1');

  await act(async () => {
    await result.current.deleteEvent(existingEvent.id);
  });

  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 삭제 실패', {
      variant: 'error',
    });
  });

  expect(result.current.events).toHaveLength(1);
  expect(result.current.events[0].id).toBe('1');
});
