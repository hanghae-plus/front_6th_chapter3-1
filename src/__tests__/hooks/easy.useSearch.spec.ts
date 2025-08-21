import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const EVENTS: Event[] = [
  {
    id: '1',
    title: '테스트 회의',
    date: '2025-10-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '배포 회의',
    date: '2025-10-01',
    startTime: '11:00',
    endTime: '12:00',
    description: '기존 팀 미팅 2 점심',
    location: '회의실 C',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

describe('useSearch', () => {
  let today: Date;
  beforeEach(() => {
    today = new Date('2025-10-01');
  });

  it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(EVENTS, today, 'week'));
    expect(result.current.filteredEvents).toEqual(EVENTS);
  });

  it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
    const { result } = renderHook(() => useSearch(EVENTS, today, 'week'));
    act(() => {
      result.current.setSearchTerm('테스트 회의');
    });
    expect(result.current.filteredEvents).toEqual([EVENTS[0]]);
  });

  // AS IS : it에 세 가지 항목(제목, 설명, 위치)에 대한 테스트를 하나로 진행하려고 함
  // TO BE : 세 가지 테스트 케이스로 나누어 진행
  describe('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
    const title = '배포 회의';
    const description = '기존 팀 미팅 2';
    const location = '회의실 C';
    it('제목 검색', () => {
      const { result } = renderHook(() => useSearch(EVENTS, today, 'week'));
      act(() => {
        result.current.setSearchTerm(title);
      });
      expect(result.current.filteredEvents).toEqual([EVENTS[1]]);
    });
    it('설명 검색', () => {
      const { result } = renderHook(() => useSearch(EVENTS, today, 'week'));
      act(() => {
        result.current.setSearchTerm(description);
      });
      expect(result.current.filteredEvents).toEqual([EVENTS[1]]);
    });
    it('위치 검색', () => {
      const { result } = renderHook(() => useSearch(EVENTS, today, 'week'));
      act(() => {
        result.current.setSearchTerm(location);
      });
      expect(result.current.filteredEvents).toEqual([EVENTS[1]]);
    });
  });

  // AS IS : 하나의 it에서 두 상태를 테스트하려고함 (주간/월간)
  // TO BE : 두 개의 it으로 나누어 진행
  describe('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
    const october2ndWeekEvents: Event[] = [
      {
        id: '1',
        title: '테스트 회의',
        date: '2025-10-06',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '배포 회의',
        date: '2025-10-07',
        startTime: '11:00',
        endTime: '12:00',
        description: '기존 팀 미팅 2',
        location: '회의실 C',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    const novemberEvents: Event[] = [
      {
        id: '1',
        title: '테스트 회의',
        date: '2025-11-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '배포 회의',
        date: '2025-11-01',
        startTime: '11:00',
        endTime: '12:00',
        description: '기존 팀 미팅 2',
        location: '회의실 C',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];
    it('주간 뷰', () => {
      // 현재 날짜는 2025-10-01이므로 10월 1일 ~ 10월 4일 사이의 이벤트만 반환되어야 한다.
      const addedEvents = [...EVENTS, ...october2ndWeekEvents];
      const { result } = renderHook(() => useSearch(addedEvents, today, 'week'));
      act(() => {
        result.current.setSearchTerm('');
      });
      expect(result.current.filteredEvents).toEqual(EVENTS);
    });
    it('월간 뷰', () => {
      // 현재 날짜는 2025-10-01이므로 10월 1일 ~ 10월 31일 사이의 이벤트만 반환되어야 한다.
      const addedEvents = [...EVENTS, ...novemberEvents];
      const { result } = renderHook(() => useSearch(addedEvents, today, 'month'));
      act(() => {
        result.current.setSearchTerm('');
      });
      expect(result.current.filteredEvents).toEqual(EVENTS);
    });
  });

  it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
    const { result } = renderHook(() => useSearch(EVENTS, today, 'week'));
    act(() => {
      result.current.setSearchTerm('회의');
    });
    expect(result.current.filteredEvents).toEqual(EVENTS);
    act(() => {
      result.current.setSearchTerm('점심');
    });
    expect(result.current.filteredEvents).toEqual([EVENTS[1]]);
  });
});
