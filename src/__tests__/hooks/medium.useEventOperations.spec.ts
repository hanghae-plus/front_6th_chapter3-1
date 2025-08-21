import { act, renderHook, waitFor } from '@testing-library/react';

import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { Event } from '../../types.ts';
import { mockNotificationEvents } from '../test-data.ts';

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
  const mockData = { events: mockNotificationEvents };
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: vi.fn().mockResolvedValue(mockData),
  });

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(result.current.events).toEqual(mockNotificationEvents);
  });

  // fetch 함수가 올바른 URL로 한 번 호출되었는지 확인하는 추가 검증
  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(global.fetch).toHaveBeenCalledWith('/api/events');
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  global.fetch = vi
    .fn()
    .mockResolvedValueOnce({
      // saveEvent의 POST 호출에 대한 응답
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    })
    .mockResolvedValueOnce({
      // fetchEvents의 GET 호출에 대한 응답
      ok: true,
      json: vi.fn().mockResolvedValue({ events: mockNotificationEvents }),
    });

  // editing을 false로 설정하여 POST 동작을 테스트합니다.
  const { result } = renderHook(() => useEventOperations(false));

  // 이전에 설명했듯이, useEffect의 초기 호출을 기다려야 합니다.
  await act(async () => {
    // saveEvent를 호출하여 POST 요청을 트리거합니다.
    await result.current.saveEvent(mockNotificationEvents[0]);
  });

  // 첫 번째 fetch 호출이 POST 메서드와 올바른 URL, body를 가졌는지 확인합니다.
  expect(global.fetch).toHaveBeenCalledWith('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mockNotificationEvents[0]),
  });
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  const initialEvents: Event[] = [
    {
      id: '1',
      title: '기존 일정',
      endTime: '10:00',
      category: 'study',
      date: '2025-08-20',
      description: '기존 설명',
      location: '강의실',
      notificationTime: 10,
      repeat: { interval: 0, type: 'none' },
      startTime: '09:00',
    },
    {
      id: '2',
      title: '다른 일정',
      endTime: '12:00',
      category: 'work',
      date: '2025-08-21',
      description: '다른 설명',
      location: '사무실',
      notificationTime: 10,
      repeat: { interval: 0, type: 'none' },
      startTime: '11:00',
    },
  ];

  const updatedEvent: Event = {
    ...initialEvents[0],
    title: '업데이트된 일정',
    endTime: '11:30',
  };

  // 3. 서버 응답 모킹 (총 2번의 fetch 호출을 모킹해야 함)
  global.fetch = vi
    .fn()
    .mockResolvedValueOnce({
      // 1 초기 렌더링 시 fetchEvents 호출 (GET)
      ok: true,
      json: vi.fn().mockResolvedValue({ events: initialEvents }),
    })
    .mockResolvedValueOnce({
      // 2 saveEvent 호출 (PUT)
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    })
    .mockResolvedValueOnce({
      // 3 saveEvent 성공 후 fetchEvents 호출 (GET)
      ok: true,
      json: vi.fn().mockResolvedValue({ events: [updatedEvent, initialEvents[1]] }),
    });

  const { result } = renderHook(() => useEventOperations(true));

  // 5. 비동기 작업 대기 및 함수 호출
  await act(async () => {
    // saveEvent를 호출하여 업데이트된 이벤트를 전달합니다.
    await result.current.saveEvent(updatedEvent);
  });

  // 6. 결과 검증
  // Hook의 events 상태가 업데이트되었는지 확인하기 위해 waitFor를 사용합니다.
  await waitFor(() => {
    // 업데이트된 이벤트 배열을 예상 결과와 비교합니다.
    expect(result.current.events).toEqual([updatedEvent, initialEvents[1]]);
  });
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  global.fetch = vi
    .fn()
    .mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue({ events: mockNotificationEvents }),
    });

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.deleteEvent(mockNotificationEvents[0].id);
  });

  expect(global.fetch).toHaveBeenCalledWith('/api/events/1', { method: 'DELETE' });
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  global.fetch = vi.fn().mockRejectedValue(new Error('Failed to fetch events'));

  renderHook(() => useEventOperations(false));

  // 2. waitFor를 사용하여 enqueueSnackbar가 호출될 때까지 기다립니다.
  await waitFor(() => {
    // 이제 `enqueueSnackbarFn` 변수가 모의 함수를 참조하므로 에러가 발생하지 않습니다.
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('이벤트 로딩 실패', { variant: 'error' });
  });

  expect(global.fetch).toHaveBeenCalledTimes(1);
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  global.fetch = vi.fn().mockRejectedValue(new Error('Failed to save event'));

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.saveEvent(mockNotificationEvents[0]);
  });

  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', { variant: 'error' });
  });

  expect(global.fetch).toHaveBeenCalledTimes(2);
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  global.fetch = vi.fn().mockRejectedValue(new Error('Failed to delete event'));

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.deleteEvent(mockNotificationEvents[0].id);
  });

  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 삭제 실패', { variant: 'error' });
  });

  expect(global.fetch).toHaveBeenCalledTimes(2);
});
