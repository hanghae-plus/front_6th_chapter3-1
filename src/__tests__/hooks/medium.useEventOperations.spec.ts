import { act, renderHook } from '@testing-library/react';
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

test('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  // Given: 기존 이벤트가 있는 MSW 핸들러 설정
  setupMockHandlerCreation([
    {
      id: '1',
      title: '기존 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 10,
    },
  ]);

  // When: useEventOperations 훅을 렌더링
  const { result } = renderHook(() => useEventOperations(false));

  // Then: 초기 이벤트 데이터가 로드되어야 함
  await act(async () => {
    await result.current.fetchEvents();
  });

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

test('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  // Given: 빈 이벤트 배열로 초기화된 MSW 핸들러와 새로운 이벤트 데이터 설정
  setupMockHandlerCreation([]);
  const newEvent = {
    title: '새로운 회의',
    date: '2024-12-25',
    startTime: '14:00',
    endTime: '15:30',
    description: '팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none' as const, interval: 0 },
    notificationTime: 10,
  };

  const { result } = renderHook(() => useEventOperations(false));

  // When: 새로운 이벤트를 저장
  await act(async () => {
    await result.current.saveEvent(newEvent);
  });

  // Then: 성공 메시지가 표시되고 이벤트가 저장되어야 함
  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 추가되었습니다.', {
    variant: 'success',
  });

  expect(result.current.events).toHaveLength(1);
  expect(result.current.events[0].title).toBe('새로운 회의');
});

test("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  // Given: 기존 이벤트가 있는 MSW 핸들러와 수정할 이벤트 데이터 설정
  setupMockHandlerUpdating();

  const updatedEvent: Event = {
    id: '1',
    title: '수정된 회의',
    date: '2025-08-17',
    startTime: '09:00',
    endTime: '11:00',
    description: '수정하기~',
    location: '항해 젭',
    category: '개인',
    repeat: { type: 'none' as const, interval: 0 },
    notificationTime: 10,
  };

  const { result } = renderHook(() => useEventOperations(true));

  // When: 기존 이벤트를 수정
  await act(async () => {
    await result.current.saveEvent(updatedEvent);
  });

  // Then: 수정 성공 메시지가 표시되어야 함
  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 수정되었습니다.', {
    variant: 'success',
  });

  expect(result.current.events[0].title).toBe('수정된 회의');
  expect(result.current.events[0].endTime).toBe('11:00');
});

test('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  // Given: 삭제할 이벤트가 있는 MSW 핸들러 설정
  setupMockHandlerDeletion();

  const { result } = renderHook(() => useEventOperations(false));

  // When: 기존 이벤트를 삭제
  await act(async () => {
    await result.current.deleteEvent('1');
  });

  // Then: 삭제 성공 메시지가 표시되어야 함
  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 삭제되었습니다.', {
    variant: 'info',
  });

  expect(result.current.events).toHaveLength(1);
});

test("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  // Given: 네트워크 오류를 시뮬레이션하는 MSW 핸들러 설정
  server.use(
    http.get('/api/events', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  // When: useEventOperations 훅을 렌더링하여 이벤트 로딩 시도
  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.fetchEvents();
  });

  // Then: 로딩 실패 메시지가 표시되어야 함
  expect(enqueueSnackbarFn).toHaveBeenCalledWith('이벤트 로딩 실패', {
    variant: 'error',
  });
});

test("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  // Given: 존재하지 않는 이벤트 수정을 시뮬레이션하는 MSW 핸들러 설정
  server.use(
    http.put('/api/events/999', () => {
      return new HttpResponse(null, { status: 404 });
    })
  );

  const nonExistentEvent: Event = {
    id: '43434',
    title: '존재하지 않는 이벤트',
    date: '2033-08-21',
    startTime: '14:00',
    endTime: '15:00',
    description: '없는 이벤트',
    location: '없는 장소',
    category: '없는 카테고리',
    repeat: { type: 'none' as const, interval: 0 },
    notificationTime: 10,
  };

  const { result } = renderHook(() => useEventOperations(true));

  // When: 존재하지 않는 이벤트를 수정 시도
  await act(async () => {
    await result.current.saveEvent(nonExistentEvent);
  });

  // Then: 저장 실패 메시지가 표시되어야 함
  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', {
    variant: 'error',
  });
});

test("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  // Given: 삭제 실패를 시뮬레이션하는 MSW 핸들러 설정
  server.use(
    http.delete('/api/events/1', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  const { result } = renderHook(() => useEventOperations(false));

  // When: 이벤트 삭제 시도
  await act(async () => {
    await result.current.deleteEvent('1');
  });

  // Then: 삭제 실패 메시지가 표시되어야 함
  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 삭제 실패', {
    variant: 'error',
  });

  expect(result.current.events).toHaveLength(1);
});
