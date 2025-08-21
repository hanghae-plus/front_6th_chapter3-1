import { act, renderHook } from '@testing-library/react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerDeletionFailure,
  setupMockHandlerLoadingFailure,
  setupMockHandlerUpdating,
  setupMockHandlerUpdatingFailure,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
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
  // 초기 이벤트 데이터 정의
  const initialEvents: Event[] = [
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

  // MSW 핸들러에 초기값 전달
  setupMockHandlerCreation(initialEvents);

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.fetchEvents();
  });

  expect(result.current.events).toEqual(initialEvents);
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  const newEvent: Event = {
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
  };

  // 초기 빈 배열의 목 데이터 생성
  setupMockHandlerCreation();

  const { result } = renderHook(() => useEventOperations(false));

  // 이벤트 저장
  await act(async () => {
    await result.current.saveEvent(newEvent);
  });
  expect(result.current.events).toEqual([newEvent]);
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  // 미리 만들어놓은 2개의 목 데이터 생성
  setupMockHandlerUpdating();

  // editing 상태이므로 true 전달
  const { result } = renderHook(() => useEventOperations(true));

  // 이벤트 수정
  await act(async () => {
    await result.current.saveEvent({
      id: '1',
      title: '수정된 회의 제목', // 제목 수정
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:30', // 종료시간 수정
      description: '수정됨',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    });
  });

  const updated = result.current.events.find((e) => e.id === '1');

  expect(updated?.title).toEqual('수정된 회의 제목');
  expect(updated?.endTime).toEqual('10:30');
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  // 삭제에 사용할 목 데이터 생성
  setupMockHandlerDeletion();

  const { result } = renderHook(() => useEventOperations(false));

  // 이벤트 삭제
  await act(async () => {
    await result.current.deleteEvent('1');
  });

  expect(result.current.events).toEqual([]);
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  // 조회 실패에 사용할 모킹함수 생성
  setupMockHandlerLoadingFailure();

  const { result } = renderHook(() => useEventOperations(false));

  // 이벤트 조회
  await act(async () => {
    await result.current.fetchEvents();
  });

  // 스낵바 함수 호출 확인
  expect(enqueueSnackbarFn).toHaveBeenCalledWith('이벤트 로딩 실패', { variant: 'error' });
});

// AS IS : 존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다.
// 위 설명은 존재하지 않는 이벤트 수정이라고 단정 짓기 어려움..
// TO BE : 이벤트 수정 중 네트워크 오류 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다.
it("이벤트 수정 중 네트워크 오류 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  // 수정 실패에 사용할 모킹함수 생성
  setupMockHandlerUpdatingFailure();

  // editing 상태이므로 true 전달
  const { result } = renderHook(() => useEventOperations(true));

  // 수정 시도 -> 어차피 실패하므로 아무 이벤트나 던짐
  await act(async () => {
    await result.current.saveEvent({
      id: '3',
      title: '기존 회의3',
      date: '2025-10-15',
      startTime: '11:00',
      endTime: '12:00',
      description: '기존 팀 미팅 2',
      location: '회의실 C',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    });
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', { variant: 'error' });
});

// AS IS : 네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다.
// 위 설명은 다른 함수의 네트워크 오류라고 오해할 여지가 큼
// TO BE : 이벤트 삭제 중 네트워크 오류 시 '일정 삭제 실패'라는 토스트가 노출되며 이벤트 삭제가 실패해야 한다.
it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  // 삭제 실패에 사용할 모킹함수 생성
  setupMockHandlerDeletionFailure();

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 삭제 실패', { variant: 'error' });
});
