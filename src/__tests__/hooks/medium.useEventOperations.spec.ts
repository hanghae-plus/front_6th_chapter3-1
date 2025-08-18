import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { events } from '../../__mocks__/response/events.json' assert { type: 'json' };
import { resetMockEvents } from '../../__mocks__/handlers.ts';
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
  resetMockEvents();
  enqueueSnackbarFn.mockClear();
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

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {});
