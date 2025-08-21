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
import { createMockEvent } from '../utils.ts';

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

// medium 에서는 api를 사용하니까 데이터를 response 파일에서 가져와서 써야 하는 줄 알았는데 그렇게 하면 안된다.
// events.json, realEvent.json 파일은 실제 handlers에서 쓰는 데이터(DB)이기 때문에 테스트 환경에서 쓰면 문제가 생긴다.
// 어떤 문제가 생기냐면 테스트 환경에서 데이터를 생성, 수정하면 실제 DB에도 추가되기 때문에 테스트 결과가 예상과 다르게 나온다.
it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  setupMockHandlerCreation([createMockEvent(1), createMockEvent(2), createMockEvent(3)]);

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  expect(result.current.events).toHaveLength(3);
  expect(result.current.events[0].title).toBe('테스트 이벤트 1');
  expect(result.current.events[1].title).toBe('테스트 이벤트 2');
  expect(result.current.events[2].title).toBe('테스트 이벤트 3');
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  setupMockHandlerCreation([createMockEvent(1), createMockEvent(2)]);

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  // 새 이벤트 추가
  const newEvent = createMockEvent(3);

  await act(async () => {
    await result.current.saveEvent(newEvent);
  });

  expect(result.current.events).toHaveLength(3);
  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 추가되었습니다.', { variant: 'success' });
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  setupMockHandlerUpdating();

  const { result } = renderHook(() => useEventOperations(true));

  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  // 수정할 이벤트 데이터 (기존 이벤트의 일부 필드만 변경하는게 더 리소스가 적을 듯)
  const updatedEvent = {
    id: '1',
    title: '수정된 회의',
    endTime: '16:00',
  };

  await act(async () => {
    await result.current.saveEvent(updatedEvent as Event);
  });

  // 수정된 타이틀과 종료시간 이벤트들 확인
  expect(result.current.events[0].title).toBe('수정된 회의');
  expect(result.current.events[0].endTime).toBe('16:00');

  // 기존 값 이벤트들은 유지되는지 확인
  expect(result.current.events[0].date).toBe('2025-10-15');
  expect(result.current.events[0].startTime).toBe('09:00');
  expect(result.current.events[0].description).toBe('기존 팀 미팅');

  // 다른 이벤트는 변경되지 않았는지 확인
  expect(result.current.events[1].title).toBe('기존 회의2');

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 수정되었습니다.', { variant: 'success' });
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  setupMockHandlerDeletion();

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  expect(result.current.events).toHaveLength(0);
  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 삭제되었습니다.', { variant: 'info' });
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  // 로딩 실패를 시뮬레이션하기 위해 500 에러를 반환하는 핸들러 설정
  server.use(
    http.get('/api/events', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  renderHook(() => useEventOperations(false));

  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('이벤트 로딩 실패', { variant: 'error' });
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  // 수정 실패를 시뮬레이션하기 위해 404 에러를 반환하는 핸들러 설정
  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: [] });
    }),
    http.put('/api/events/:id', () => {
      return new HttpResponse(null, { status: 404 });
    })
  );

  const { result } = renderHook(() => useEventOperations(true));

  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  const nonExistentEvent = createMockEvent(999);

  await act(async () => {
    await result.current.saveEvent(nonExistentEvent);
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', { variant: 'error' });
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  // 삭제 실패를 시뮬레이션하기 위해 500 에러를 반환하는 핸들러 설정
  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: [createMockEvent(1)] });
    }),
    http.delete('/api/events/:id', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 삭제 실패', { variant: 'error' });
});
