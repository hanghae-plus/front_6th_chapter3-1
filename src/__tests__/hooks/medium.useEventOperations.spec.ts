import { act, renderHook, waitFor } from '@testing-library/react';
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

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  const initEvents: Event[] = [
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
  ];
  setupMockHandlerCreation(initEvents);
  const { result } = renderHook(() => useEventOperations(false));
  await waitFor(() => {
    expect(result.current.events).toHaveLength(1);
  });

  expect(result.current.events).toEqual(initEvents);
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  const initEvents: Event[] = [
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
  ];

  setupMockHandlerCreation(initEvents);
  const { result } = renderHook(() => useEventOperations(false));
  await waitFor(() => {
    expect(result.current.events).toHaveLength(1);
  });

  const newEvent = {
    id: '2',
    title: '새로운 회의',
    date: '2025-10-16',
    startTime: '10:00',
    endTime: '11:00',
    description: '새로운 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  } as Omit<Event, 'id'>;

  await act(async () => {
    await result.current.saveEvent(newEvent);
  });

  await waitFor(() => {
    expect(result.current.events).toHaveLength(2);
  });

  expect(result.current.events).toEqual(
    expect.arrayContaining([initEvents[0], expect.objectContaining({ title: '새로운 회의' })])
  );
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  setupMockHandlerUpdating();
  const { result } = renderHook(() => useEventOperations(true));
  const updatedEvent: Event = {
    id: '1',
    title: '수정 회의',
    date: '2025-10-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };
  await act(async () => await result.current.fetchEvents());
  await act(async () => await result.current.saveEvent(updatedEvent));
  expect(result.current.events).toHaveLength(2);
  expect(result.current.events[0].title).toBe('수정 회의');
  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 로딩 완료!', { variant: 'info' });
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  // setupMockHandlerDeletion();
  const { result } = renderHook(() => useEventOperations(false)); // 2) 훅 렌더링

  await waitFor(() => {
    // 3) 초기 로드 완료 확인
    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0].id).toBe('1');
  });
  console.log(result.current.events);
  await act(async () => {
    // 4) 실제 삭제 호출
    await result.current.deleteEvent('1');
  });
  console.log(result);
  await waitFor(() => {
    // 5) 재로딩 후 비어졌는지 확인
    expect(result.current.events).toHaveLength(0);
  });
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {});
