import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils';
import { useEventOperations } from '../../hooks/useEventOperations';
import { server } from '../../setupTests';
import { createMockEvent } from '../utils';

/**
 * toHaveBeenCalledWith: 특정 인자와 함께 호출되었는지 확인용
 */

// 가짜 함수 생성
const enqueueSnackbarFn = vi.fn();

//토스트(외부 UI 라이브러리)를 테스트 환경에서 사용할 수 있도록 모킹
vi.mock('notistack', async () => {
  const actual = await vi.importActual('notistack'); //모듈 가져오기
  return {
    ...actual, // 모듈 내용 유지
    useSnackbar: () => ({
      //해당 훅만 새로운 동작으로 대체
      enqueueSnackbar: enqueueSnackbarFn,
    }),
  };
});

describe('useEventOperations: 이벤트 관리 훅', () => {
  it('저장되어있는 초기 이벤트 데이터를 불러오고 "일정 로딩 완료!"라는 info 토스트와 함께 로딩 완료 메세지를 표시한다', async () => {
    // 초기 이벤트 데이터 생성
    const events = [createMockEvent(1), createMockEvent(2), createMockEvent(3)];
    setupMockHandlerCreation(events);

    const { result } = renderHook(() => useEventOperations(false));

    // 초기 상태 확인
    expect(result.current.events).toEqual([]);

    await act(async () => {
      // 데이터 패칭
      await result.current.fetchEvents();
    });

    // 이벤트 데이터 확인
    expect(result.current.events).toEqual(events);
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 로딩 완료!', { variant: 'info' });
  });

  it('이벤트 추가 시 "일정이 추가되었습니다."라는 success 토스트와 함께 이벤트가 추가된다', async () => {
    //이벤트 생성
    setupMockHandlerCreation();

    const { result } = renderHook(() => useEventOperations(false));

    // 새 이벤트 생성
    const newEvent = createMockEvent(1, { title: '새로운 일정' });

    await act(async () => {
      // 이벤트 추가
      await result.current.saveEvent(newEvent);
    });

    // 성공 메시지 확인
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 추가되었습니다.', {
      variant: 'success',
    });

    // 이벤트 추가 확인
    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0]).toEqual(newEvent);
  });

  it('기존 일정의 title과 endTime을 수정하면 "일정이 수정되었습니다."라는 success 토스트와 함께 데이터가 업데이트된다', async () => {
    //이벤트 수정
    setupMockHandlerUpdating();

    const { result } = renderHook(() => useEventOperations(true));

    // 먼저 기존 이벤트 데이터를 가져옴
    await act(async () => {
      await result.current.fetchEvents();
    });

    // 기존 이벤트 중 첫 번째를 수정
    const existingEvent = result.current.events[0];
    const updatedEvent = {
      ...existingEvent,
      title: '수정된 일정',
      endTime: '11:00',
    };

    await act(async () => {
      await result.current.saveEvent(updatedEvent);
    });

    // 성공 메시지 확인
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 수정되었습니다.', {
      variant: 'success',
    });

    // 수정된 이벤트 확인
    expect(result.current.events[0].title).toBe('수정된 일정');
    expect(result.current.events[0].endTime).toBe('11:00');
  });

  it('존재하는 이벤트 삭제 시 "일정이 삭제되었습니다."라는 info 토스트와 함께 이벤트가 삭제된다', async () => {
    //이벤트 삭제
    setupMockHandlerDeletion();

    const { result } = renderHook(() => useEventOperations(false));

    // 먼저 기존 이벤트 데이터를 가져옴
    await act(async () => {
      await result.current.fetchEvents();
    });

    // 삭제 전 이벤트 개수 확인
    expect(result.current.events).toHaveLength(1);

    // 이벤트 삭제
    await act(async () => {
      await result.current.deleteEvent('1');
    });

    // 성공 메시지 확인
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 삭제되었습니다.', { variant: 'info' });

    // 삭제 후 이벤트가 제거되었는지 확인
    expect(result.current.events).toHaveLength(0);
  });

  it('이벤트 로딩 실패 시 "이벤트 로딩 실패"라는 error 토스트가 표시되어야 한다', async () => {
    // 에러 상황 생성
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await act(async () => {
      await result.current.fetchEvents();
    });

    expect(enqueueSnackbarFn).toHaveBeenCalledWith('이벤트 로딩 실패', { variant: 'error' });
  });

  it('존재하지 않는 이벤트 수정 시 "일정 저장 실패"라는 error 토스트가 노출되며 기존 이벤트는 유지된다', async () => {
    const initialEvents = [
      createMockEvent(1, { title: '일정 1' }),
      createMockEvent(2, { title: '일정 2' }),
    ];
    setupMockHandlerCreation(initialEvents);

    const { result } = renderHook(() => useEventOperations(true));

    // 먼저 기존 이벤트 가져오기
    await act(async () => {
      await result.current.fetchEvents();
    });

    // 기존 이벤트 제목 확인
    expect(result.current.events).toHaveLength(2);
    expect(result.current.events.map((e) => e.title)).toEqual(['일정 1', '일정 2']);

    // 존재하지 않는 아이디로 수정 시도
    const nonExistentEvent = createMockEvent(3, { title: '존재하지 않는 일정' });

    await act(async () => {
      await result.current.saveEvent(nonExistentEvent);
    });

    // 에러 메시지 확인
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', { variant: 'error' });

    //기존 이벤트 유지 확인
    expect(result.current.events).toHaveLength(2);
    expect(result.current.events.map((e) => e.title)).toEqual(['일정 1', '일정 2']);
  });

  it('네트워크 오류 시 "일정 삭제 실패"라는 error 토스트가 노출되며 이벤트 삭제가 실패해야 한다', async () => {
    setupMockHandlerDeletion();

    // 에러 상황 생성
    server.use(
      http.delete('/api/events/:id', () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await act(async () => {
      await result.current.deleteEvent('1');
    });

    // 에러 메시지 확인
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 삭제 실패', { variant: 'error' });

    // 기존 이벤트는 그대로 유지
    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0].title).toBe('개발 공부');
  });
});
