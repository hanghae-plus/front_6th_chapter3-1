import { act, renderHook, waitFor } from '@testing-library/react';
// import { http, HttpResponse } from 'msw';

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

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  const initEvents: Event[] = [];
  const mockHandlers = setupMockHandlerCreation(initEvents);
  server.use(mockHandlers.getHandler);

  const { result } = renderHook(() => useEventOperations(false));

  // await waitFor(() => {
  //   expect(result.current.events).toHaveLength(5);
  // });
  expect(result.current.events).toEqual(initEvents);
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  const initEvents: Event[] = [];
  const mockHandlers = setupMockHandlerCreation(initEvents);
  server.use(mockHandlers.getHandler, mockHandlers.postHandler);

  const { result } = renderHook(() => useEventOperations(false));

  // 초기 상태: 이벤트 없음
  await waitFor(() => {
    expect(result.current.events).toHaveLength(0);
  });

  const newEventData = {
    title: '새로운 회의',
    date: '2025-08-30',
    startTime: '14:00',
    endTime: '15:00',
    description: '새로운 프로젝트 회의',
    location: '회의실 C',
    category: '업무',
    repeat: { type: 'none' as const, interval: 0 },
    notificationTime: 10,
  };

  await act(async () => {
    await result.current.saveEvent(newEventData);
  });

  // 저장 후 이벤트 목록 확인
  await waitFor(() => {
    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0]).toMatchObject({
      title: '새로운 회의',
      date: '2025-08-30',
      startTime: '14:00',
      endTime: '15:00',
      description: '새로운 프로젝트 회의',
      location: '회의실 C',
      category: '업무',
    });
    expect(result.current.events[0].id).toBeDefined();
  });

  // 성공 토스트 확인
  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 추가되었습니다.', {
    variant: 'success',
  });
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  // 기존 이벤트 데이터 준비
  const existingEvent: Event = {
    id: 'existing-event-id',
    title: '기존 회의',
    date: '2025-08-30',
    startTime: '14:00',
    endTime: '15:00',
    description: '기존 회의 설명',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  const mockHandlers = setupMockHandlerUpdating([existingEvent]);
  server.use(mockHandlers.getHandler, mockHandlers.putHandler);

  const { result } = renderHook(() => useEventOperations(true));

  // 초기 상태: 기존 이벤트 1개
  await waitFor(() => {
    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0]).toMatchObject({
      id: 'existing-event-id',
      title: '기존 회의',
      endTime: '15:00',
    });
  });

  // 업데이트할 이벤트 데이터 (title과 endTime 변경)
  const updatedEventData: Event = {
    ...existingEvent,
    title: '업데이트된 회의',
    endTime: '16:30',
  };

  await act(async () => {
    await result.current.saveEvent(updatedEventData);
  });

  await waitFor(() => {
    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0]).toMatchObject({
      id: 'existing-event-id',
      title: '업데이트된 회의',
      endTime: '16:30',
      date: '2025-08-30',
      startTime: '14:00',
      location: '회의실 A',
    });
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 수정되었습니다.', {
    variant: 'success',
  });
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  const existingEvents: Event[] = [
    {
      id: 'event-1',
      title: '첫 번째 회의',
      date: '2025-08-30',
      startTime: '14:00',
      endTime: '15:00',
      description: '첫 번째 회의 설명',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: 'event-2',
      title: '두 번째 회의',
      date: '2025-08-31',
      startTime: '10:00',
      endTime: '11:00',
      description: '두 번째 회의 설명',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 5,
    },
  ];

  const mockHandlers = setupMockHandlerDeletion(existingEvents);
  server.use(mockHandlers.getHandler, mockHandlers.deleteHandler);

  const { result } = renderHook(() => useEventOperations(false));

  // 초기 상태: 기존 이벤트 2개
  await waitFor(() => {
    expect(result.current.events).toHaveLength(2);
    expect(result.current.events.map((e) => e.id)).toEqual(['event-1', 'event-2']);
  });

  // 첫 번째 이벤트 삭제
  await act(async () => {
    await result.current.deleteEvent('event-1');
  });

  // 삭제 후 이벤트 확인
  await waitFor(() => {
    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0]).toMatchObject({
      id: 'event-2',
      title: '두 번째 회의',
    });
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 삭제되었습니다.', {
    variant: 'info',
  });
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {});
