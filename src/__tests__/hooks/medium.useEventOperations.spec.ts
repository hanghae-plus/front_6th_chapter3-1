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
import data from '../../__mocks__/response/realEvents.json';
import newData from '../../__mocks__/response/events.json';

const enqueueSnackbarFn = vi.fn();

beforeEach(() => {
  enqueueSnackbarFn.mockClear();
  server.resetHandlers();
});

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
  setupMockHandlerCreation(data.events as Array<Event>);

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(async () => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 로딩 완료!', { variant: 'info' });
  });

  expect(result.current.events).toHaveLength(5);
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  setupMockHandlerCreation(data.events as Array<Event>);

  const { result } = renderHook(() => useEventOperations(false));

  const newEvent = newData.events[0] as Event;

  await act(async () => {
    await result.current.saveEvent(newEvent);
  });

  expect(result.current.events).toHaveLength(6);
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  setupMockHandlerUpdating();

  const { result } = renderHook(() => useEventOperations(true));

  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 로딩 완료!', { variant: 'info' });
  });

  expect(result.current.events).toHaveLength(2);
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  setupMockHandlerDeletion();

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 로딩 완료!', { variant: 'info' });
  });

  expect(result.current.events).toHaveLength(1);

  await act(async () => {
    result.current.deleteEvent('1');
  });

  expect(result.current.events).toHaveLength(0);
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  server.use(
    http.get('/api/events', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  // 2. hook 실행
  const { result } = renderHook(() => useEventOperations(false));

  // 3. 에러 토스트 확인
  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('이벤트 로딩 실패', { variant: 'error' });
  });

  expect(result.current.events).toHaveLength(0);
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  setupMockHandlerUpdating();

  const { result } = renderHook(() => useEventOperations(true));

  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 로딩 완료!', { variant: 'info' });
  });

  await act(async () => {
    await result.current.saveEvent({ id: '-1', title: '아침 약속' } as Event);
  });

  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', { variant: 'error' });
  });
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  setupMockHandlerDeletion();

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 로딩 완료!', { variant: 'info' });
  });

  expect(result.current.events).toHaveLength(1);

  await act(async () => {
    result.current.deleteEvent('3');
  });

  expect(result.current.events).toHaveLength(1);
});
