import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { expect } from 'vitest';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { events as realEvents } from '../../__mocks__/response/realEvents.json' assert { type: 'json' };
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';

// "호출되었는지, 어떤 인자로 호출되었는지"를 추적할 수 있는 mock 함수
const enqueueSnackbarFn = vi.fn();

// notistack을 통으로 mock하겠다
vi.mock('notistack', async () => {
  // 실제 모듈(notistack)의 구현을 불러오자
  const actual = await vi.importActual('notistack');

  return {
    ...actual,
    useSnackbar: () => ({
      // useSnackbar 훅만 mock해서 호출을 추적할 수 있게함
      enqueueSnackbar: enqueueSnackbarFn,
    }),
  };
});

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  setupMockHandlerCreation(realEvents as Event[]);

  const { result } = renderHook(() => useEventOperations(false));
  await act(async () => {
    await result.current.fetchEvents();
  });

  expect(result.current.events).toEqual(realEvents);

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 로딩 완료!', { variant: 'info' });
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  setupMockHandlerCreation([]);

  const { result } = renderHook(() => useEventOperations(false));
  await act(async () => {
    await result.current.saveEvent({
      title: '새 이벤트 1',
      date: '2025-08-22',
      startTime: '08:00',
      endTime: '10:00',
      description: '설명입니다',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 20,
    });
  });

  expect(result.current.events).toHaveLength(1);
  expect(result.current.events[0].title).toBe('새 이벤트 1');
  expect(result.current.events[0].date).toBe('2025-08-22');
  expect(result.current.events[0].startTime).toBe('08:00');
  expect(result.current.events[0].endTime).toBe('10:00');
  expect(result.current.events[0].notificationTime).toBe(20);

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 추가되었습니다.', { variant: 'success' });
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  setupMockHandlerUpdating();

  const { result } = renderHook(() => useEventOperations(true));

  await act(async () => {
    await result.current.fetchEvents();
  });

  // setupMockHandlerUpdating에 정의된 기존 이벤트를 잘 불러오는 지 확인
  const prevEvent = result.current.events[0];
  expect(prevEvent.title).toBe('기존 회의');
  expect(prevEvent.endTime).toBe('10:00');

  await act(async () => {
    await result.current.saveEvent({
      ...prevEvent,
      title: '수정된 회의',
      endTime: '11:30',
    });
  });

  // save 후 요청한 값으로 title, endTime이 수정되었는지 확인
  const updatedEvent = result.current.events[0];
  expect(updatedEvent.title).toBe('수정된 회의');
  expect(updatedEvent.endTime).toBe('11:30');
  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 수정되었습니다.', {
    variant: 'success',
  });
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  setupMockHandlerDeletion();

  const { result } = renderHook(() => useEventOperations(true));

  await act(async () => {
    await result.current.fetchEvents();
  });

  // 삭제 전에 삭제할 데이터가 있는지 확인
  expect(result.current.events).toHaveLength(1);
  expect(result.current.events[0].id).toBe('1');

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  // 삭제되어 이벤트가 존재하지 않아 길이가 0
  expect(result.current.events).toHaveLength(0);
  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 삭제되었습니다.', {
    variant: 'info',
  });
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  // 핸들러에서 강제로 에러로 응답받기로 설정하기
  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ error: '이벤트 로딩 실패' }, { status: 500 });
    })
  );

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.fetchEvents();
  });

  // 로딩에 실패하여 이벤트가 없기 때문에 길이가 0
  expect(result.current.events).toHaveLength(0);
  expect(enqueueSnackbarFn).toHaveBeenCalledWith('이벤트 로딩 실패', { variant: 'error' });
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  server.use(
    http.put('/api/events/:id', async () => {
      return HttpResponse.json({ error: '이벤트가 존재하지 않습니다.' }, { status: 500 });
    })
  );

  const { result } = renderHook(() => useEventOperations(true));

  const nonExistingEvent = {
    id: '1',
    title: '수정할 이벤트',
    date: '2025-10-15',
    startTime: '10:00',
    endTime: '11:00',
    description: '존재하지 않는 이벤트',
    location: 'zip',
    category: '업무',
    repeat: { type: 'none' as const, interval: 0 },
    notificationTime: 10,
  };

  await act(async () => {
    await result.current.saveEvent(nonExistingEvent);
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', { variant: 'error' });
});

// TODO 테스트 순서에 대해 헷갈려서 물어보기

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  setupMockHandlerCreation(realEvents as Event[]);

  const { result } = renderHook(() => useEventOperations(false));
  await act(async () => {
    await result.current.fetchEvents();
  });

  // 삭제가 실패하도록 강제로 에러 받기
  server.use(http.delete('/api/events/:id', () => HttpResponse.error()));

  const prevLength = result.current.events.length;
  const targetId = result.current.events[0].id;

  // 삭제 실행
  await act(async () => {
    await result.current.deleteEvent(targetId);
  });

  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 삭제 실패', { variant: 'error' });
  });

  // 이벤트는 그대로 유지되어야 함
  expect(result.current.events.length).toBe(prevLength);
});
