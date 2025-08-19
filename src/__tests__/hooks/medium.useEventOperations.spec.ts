import { act, renderHook, waitFor } from '@testing-library/react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { events } from '../../__mocks__/response/events.json';
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

it('저장되어있는 초기 이벤트 데이터를 불러온다.', async () => {
  server.use(...setupMockHandlerCreation(events as Event[]));

  const fetchSpy = vi.spyOn(global, 'fetch');

  renderHook(() => useEventOperations(false));

  await waitFor(() => expect(fetchSpy).toHaveBeenCalledWith('/api/events'));
  await waitFor(() =>
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 로딩 완료!', { variant: 'info' })
  );

  fetchSpy.mockRestore();
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  server.use(...setupMockHandlerCreation(events as Event[]));

  const { result } = renderHook(() => useEventOperations(false));

  waitFor(() => {
    expect(result.current.events.length).toBeGreaterThan(0);
    expect(result.current.events[0].title).toEqual('기존 회의');
  });
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  server.use(...setupMockHandlerUpdating(events as Event[]));
  const { result } = renderHook(() => useEventOperations(true));

  await waitFor(() => {
    expect(result.current.events.length).toBeGreaterThan(0);
    expect(result.current.events[0].title).toEqual('기존 회의');
  });

  const updatedEvent = {
    id: '1',
    title: '기존이 아닌 회의',
    endTime: '16:00',
  };

  await act(async () => {
    await result.current.saveEvent(updatedEvent as Event);
  });

  await waitFor(() =>
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 수정되었습니다.', { variant: 'success' })
  );

  waitFor(() => {
    const updated = result.current.events.find((event) => event.id === updatedEvent.id)!;
    expect(updated.title).toBe('기존이 아닌 회의');
    expect(updated.endTime).toBe('16:00');
  });
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  server.use(...setupMockHandlerDeletion(events as Event[]));

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => expect(result.current.events.length).toBeGreaterThan(0));
  const deleteEventId = result.current.events[0].id;

  await act(async () => {
    await result.current.deleteEvent(deleteEventId);
  });

  await waitFor(() =>
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 삭제되었습니다.', { variant: 'info' })
  );
  waitFor(() => {
    const currentEventList = result.current.events;
    expect(currentEventList.length).toBe(0);
  });
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  server.use(...setupMockHandlerCreation(events as Event[], { getIsSuccess: false }));

  renderHook(() => useEventOperations(false));

  waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('이벤트 로딩 실패', { variant: 'error' });
  });
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  server.use(...setupMockHandlerUpdating(events as Event[]));

  const { result } = renderHook(() => useEventOperations(true));
  const updatedEvent = {
    id: '2',
    title: '기존이 아닌 회의',
  };

  await act(async () => {
    await result.current.saveEvent(updatedEvent as Event);
  });

  waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', { variant: 'error' });
  });
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  server.use(...setupMockHandlerDeletion(events as Event[], { deleteIsSuccess: false }));

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => expect(result.current.events.length).toBeGreaterThan(0));
  const deleteEventId = result.current.events[0].id;

  await act(async () => {
    await result.current.deleteEvent(deleteEventId);
  });

  waitFor(() =>
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 삭제 실패', { variant: 'error' })
  );
});
