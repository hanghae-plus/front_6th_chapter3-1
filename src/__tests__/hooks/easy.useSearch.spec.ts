import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { createEventData } from '../unit/factories/eventFactory.ts';

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const events = [
    createEventData({
      id: '1',
      date: '2025-10-01',
    }),
    createEventData({
      id: '2',
      date: '2025-10-01',
    }),
  ];
  const { result } = renderHook(() => useSearch(events, new Date('2025-10-01'), 'week'));
  act(() => {
    result.current.setSearchTerm('');
  });
  expect(result.current.filteredEvents).toEqual(events);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const specificEvents = [
    createEventData({
      id: '1',
      date: '2025-10-01',
      title: '이벤트 1',
    }),
    createEventData({
      id: '2',
      date: '2025-10-01',
      title: '이벤트 2',
    }),
  ];
  const events = [
    createEventData({
      id: '3',
      date: '2025-10-01',
    }),
    createEventData({
      id: '4',
      date: '2025-10-01',
    }),
  ];
  const { result } = renderHook(() =>
    useSearch([...specificEvents, ...events], new Date('2025-10-01'), 'week')
  );
  act(() => {
    result.current.setSearchTerm('이벤트');
  });
  expect(result.current.filteredEvents).toEqual(specificEvents);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const specificEvents = [
    createEventData({
      id: '1',
      date: '2025-10-01',
      title: '이벤트 1',
    }),
    createEventData({
      id: '2',
      date: '2025-10-01',
      description: '이벤트 2',
    }),
    createEventData({
      id: '3',
      date: '2025-10-01',
      location: '이벤트 3',
    }),
  ];
  const events = [
    createEventData({
      id: '4',
      date: '2025-10-01',
    }),
    createEventData({
      id: '5',
      date: '2025-10-01',
    }),
  ];
  const { result } = renderHook(() =>
    useSearch([...specificEvents, ...events], new Date('2025-10-01'), 'week')
  );
  act(() => {
    result.current.setSearchTerm('이벤트');
  });
  expect(result.current.filteredEvents).toEqual(specificEvents);
});

describe('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  it('주간 뷰에서 해당 주의 이벤트만 반환한다', () => {
    const specificEvents = [
      createEventData({
        date: '2025-09-28',
      }),
      createEventData({
        date: '2025-10-04',
      }),
    ];
    const events = [
      createEventData({
        date: '2025-09-27',
      }),
      ...specificEvents,
      createEventData({
        date: '2025-10-05',
      }),
    ];
    const { result } = renderHook(() => useSearch(events, new Date('2025-10-01'), 'week'));

    expect(result.current.filteredEvents).toEqual(specificEvents);
  });

  it('월간 뷰에서 해당 월의 이벤트만 반환한다', () => {
    const specificEvents = [
      createEventData({
        date: '2025-10-01',
      }),
      createEventData({
        date: '2025-10-31',
      }),
    ];
    const events = [
      createEventData({
        date: '2025-09-30',
      }),
      ...specificEvents,
      createEventData({
        date: '2025-11-01',
      }),
    ];
    const { result } = renderHook(() => useSearch(events, new Date('2025-10-01'), 'month'));

    expect(result.current.filteredEvents).toEqual(specificEvents);
  });
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const keywordEvent1 = createEventData({
    date: '2025-10-01',
    title: '회의',
  });
  const keywordEvent2 = createEventData({
    date: '2025-10-01',
    title: '점심',
  });
  const events = [
    createEventData({
      date: '2025-10-01',
    }),
    keywordEvent1,
    keywordEvent2,
    createEventData({
      date: '2025-10-01',
    }),
  ];
  const { result } = renderHook(() => useSearch(events, new Date('2025-10-01'), 'month'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toEqual([keywordEvent1]);

  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.filteredEvents).toEqual([keywordEvent2]);
});
