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
import realEvents from '../../__mocks__/response/realEvents.json';
import newEvents from '../../__mocks__/response/events.json';

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
  const events = realEvents.events as Event[];
  // 여기서 인자는 초기 이벤트 배열
  setupMockHandlerCreation(events);

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.fetchEvents();
  });

  expect(result.current.events).toEqual(events);
});

// 이벤트 추가
it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  setupMockHandlerCreation([]);

  const { result } = renderHook(() => useEventOperations(false));
  const newEvent = {
    title: '기존 회의 3',
    date: '2025-10-15',
    startTime: '09:00',
    endTime: '15:00',
    description: '기존 팀 미팅 3',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  } as Event;

  await act(async () => {
    await result.current.saveEvent(newEvent);
  });

  const savedEvent = result.current.events.find((event) => event.title === newEvent.title);

  // 추가한 이벤트가 맞는지 제목, 시간으로 확인 (아이디로 확인 불가)
  expect(savedEvent).toMatchObject({
    title: newEvent.title,
    startTime: newEvent.startTime,
    endTime: newEvent.endTime,
  });
});

// 이벤트 수정
it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  setupMockHandlerUpdating();

  // editing = true
  const { result } = renderHook(() => useEventOperations(true));
  const newEvent: Event = {
    id: '1',
    title: '기존 회의 3',
    date: '2025-10-15',
    startTime: '09:00',
    endTime: '15:00',
    description: '기존 팀 미팅 3',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  await act(async () => {
    result.current.saveEvent(newEvent);
  });

  // 수정된 이벤트를 아이디로 찾음
  const savedEvent = result.current.events.find((event) => event.id === newEvent.id);

  // 이벤트가 수정되었는지 제목, 시간으로 확인
  expect(savedEvent).toMatchObject({
    title: newEvent.title,
    endTime: newEvent.endTime,
  });
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  setupMockHandlerDeletion();

  const { result } = renderHook(() => useEventOperations(true));

  await act(async () => {
    result.current.deleteEvent('1');
  });

  expect(result.current.events).toEqual([]);
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {});
