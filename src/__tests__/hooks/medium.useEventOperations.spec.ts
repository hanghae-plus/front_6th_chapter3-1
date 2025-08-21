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

const events: Event[] = [
  {
    id: 'a6b7c8d9-1111-2222-3333-444455556666',
    title: '디자인 QA',
    date: '2025-08-01',
    startTime: '16:00',
    endTime: '17:00',
    description: '신규 장바구니 페이지 픽셀 퍼펙트 검수',
    location: 'Figma/Jira',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
  {
    id: '11112222-3333-4444-5555-666677778888',
    title: '코드리뷰 타임',
    date: '2025-08-22',
    startTime: '11:00',
    endTime: '11:30',
    description: 'PR #124 ~ #129 리뷰',
    location: 'GitHub PR',
    category: '업무',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 5,
  },
  {
    id: '9999aaaa-bbbb-cccc-dddd-eeeeffff0001',
    title: 'PT 상담',
    date: '2025-08-23',
    startTime: '19:30',
    endTime: '20:00',
    description: '체형 분석 및 루틴 점검',
    location: '동네 헬스장',
    category: '건강',
    repeat: { type: 'weekly', interval: 2 },
    notificationTime: 30,
  },
];

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  const handlers = setupMockHandlerCreation(events);
  server.resetHandlers(...handlers);

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(result.current.events).toEqual(events);
  });
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  const handlers = setupMockHandlerCreation([]);
  server.resetHandlers(...handlers);

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.saveEvent(events[0]);
  });

  await waitFor(() => {
    expect(result.current.events).toEqual([events[0]]);
  });
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  const handlers = setupMockHandlerUpdating();
  server.resetHandlers(...handlers);

  const { result } = renderHook(() => useEventOperations(true));

  const event: Event = {
    id: '1',
    title: '바꾸기 전 이벤트',
    date: '2025-08-30',
    description: '변경 테스트 입니다.',
    startTime: '18:30',
    endTime: '21:30',
    category: '가족',
    location: '서울 강남구',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1440,
  };

  await act(async () => {
    await result.current.saveEvent({
      ...event,
      title: '디자인 QA 수정',
      endTime: '18:00',
    });
  });

  await waitFor(() => {
    expect(result.current.events).toEqual([
      {
        ...event,
        title: '디자인 QA 수정',
        endTime: '18:00',
      },
    ]);
  });
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  const handlers = setupMockHandlerDeletion();
  server.resetHandlers(...handlers);

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  await waitFor(() => {
    expect(result.current.events).toEqual([]);
  });
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  server.resetHandlers(
    http.get('/api/events', () => {
      return HttpResponse.json({ message: 'error' }, { status: 500 });
    })
  );

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('이벤트 로딩 실패', { variant: 'error' });
    expect(result.current.events).toEqual([]);
  });
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  const handlers = setupMockHandlerUpdating();
  server.resetHandlers(...handlers);

  const { result } = renderHook(() => useEventOperations(true));

  await act(async () => {
    await result.current.saveEvent({ id: 'asdf' } as Event);
  });

  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', { variant: 'error' });
  });
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  server.resetHandlers(
    http.get('/api/events', () => {
      return HttpResponse.json({ events });
    }),
    http.delete('/api/events/1', () => {
      return HttpResponse.json({ message: 'error' }, { status: 500 });
    })
  );

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 삭제 실패', { variant: 'error' });
  });

  await waitFor(() => {
    expect(result.current.events).toEqual(events);
  });
});
