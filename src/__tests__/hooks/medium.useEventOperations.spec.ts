import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event, type EventForm } from '../../types.ts';

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

const renderHookWaitForInit = async (...params: Parameters<typeof useEventOperations>) => {
  const result = renderHook(() => useEventOperations(...params));

  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 로딩 완료!', {
      variant: 'info',
    });
  });

  return result;
};

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  const initEvents: Event[] = [];
  setupMockHandlerCreation(initEvents);

  const { result } = await renderHookWaitForInit(false);
  expect(result.current.events).toEqual(initEvents);
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  const initEvents: Event[] = [];
  setupMockHandlerCreation(initEvents);

  const { result } = await renderHookWaitForInit(false);
  expect(result.current.events).toEqual(initEvents);

  const newEvent1: EventForm = {
    date: '2025-10-01',
    startTime: '09:00',
    endTime: '10:00',
    title: '회의',
    description: '회의 내용',
    location: '회의실',
    category: '회의',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  await act(async () => {
    await result.current.saveEvent(newEvent1);
  });
  expect(result.current.events).toEqual([{ ...newEvent1, id: '1' }]);
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  setupMockHandlerUpdating();

  const { result } = await renderHookWaitForInit(true);
  const [prev1, prev2] = result.current.events;

  await act(async () => {
    await result.current.saveEvent({
      ...prev1,
      title: 'new 회의',
      endTime: '11:00',
    });
  });
  expect(result.current.events).toEqual([{ ...prev1, title: 'new 회의', endTime: '11:00' }, prev2]);
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  setupMockHandlerDeletion();

  const { result } = await renderHookWaitForInit(false);
  expect(result.current.events).toEqual([
    {
      id: '1',
      title: '삭제할 이벤트',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '삭제할 이벤트입니다',
      location: '어딘가',
      category: '기타',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ]);

  await act(async () => {
    await result.current.deleteEvent('1');
  });
  expect(result.current.events).toEqual([]);
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  server.use(
    http.get('/api/events', () => {
      return HttpResponse.error();
    })
  );

  renderHook(() => useEventOperations(false));
  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('이벤트 로딩 실패', {
      variant: 'error',
    });
  });
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  server.use(
    http.put('/api/events/:id', async () => {
      return new HttpResponse(null, { status: 404 });
    })
  );

  const { result } = await renderHookWaitForInit(true);

  await act(async () => {
    await result.current.saveEvent({
      id: '1',
      date: '2025-10-01',
      startTime: '09:00',
      endTime: '10:00',
      title: '회의',
      description: '회의 내용',
      location: '회의실',
      category: '회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    });
  });
  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', {
      variant: 'error',
    });
  });
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  server.use(
    http.delete('/api/events/:id', () => {
      return HttpResponse.error();
    })
  );

  const { result } = await renderHookWaitForInit(false);
  await act(async () => {
    await result.current.deleteEvent('2');
  });
  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 삭제 실패', {
      variant: 'error',
    });
  });
});
