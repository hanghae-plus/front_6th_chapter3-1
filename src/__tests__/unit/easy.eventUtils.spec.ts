import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

// 테스트용 이벤트 데이터 - 각 테스트에서 필요한 시나리오를 명확히 보여주기 위해 구체적으로 작성
const testEvents = [
  {
    id: '1',
    title: 'Event 1',
    date: '2025-07-01',
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
    title: 'Event 2',
    date: '2025-07-02',
    startTime: '09:00',
    endTime: '10:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '3',
    title: 'Stand up Meeting',
    date: '2025-07-10',
    startTime: '09:00',
    endTime: '10:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '4',
    title: 'Stand up Meeting',
    date: '2025-07-30',
    startTime: '09:00',
    endTime: '10:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '5',
    title: 'Monthly Meeting',
    date: '2025-07-31',
    startTime: '09:00',
    endTime: '10:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
] as Event[];

describe('getFilteredEvents', () => {
  describe('검색어 기반 필터링', () => {
    it('검색어 "Event"는 제목에 Event가 포함된 이벤트들만 반환한다', () => {
      // Given: Event라는 검색어와 주간 뷰 설정
      const searchTerm = 'Event';
      const currentDate = new Date('2025-07-01');
      const view = 'week';

      // When: 이벤트 필터링 실행
      const result = getFilteredEvents(testEvents, searchTerm, currentDate, view);

      // Then: Event 1, Event 2만 반환되어야 함
      expect(result).toEqual([
        {
          id: '1',
          title: 'Event 1',
          date: '2025-07-01',
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
          title: 'Event 2',
          date: '2025-07-02',
          startTime: '09:00',
          endTime: '10:00',
          description: '기존 팀 미팅',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
      ]);
    });

    it('검색어 "Meeting"은 제목에 Meeting이 포함된 이벤트들만 반환한다', () => {
      // Given: Meeting이라는 검색어와 월간 뷰 설정
      const searchTerm = 'Meeting';
      const currentDate = new Date('2025-07-01');
      const view = 'month';

      // When: 이벤트 필터링 실행
      const result = getFilteredEvents(testEvents, searchTerm, currentDate, view);

      // Then: Meeting이 포함된 모든 이벤트가 반환되어야 함
      expect(result).toEqual([
        {
          id: '3',
          title: 'Stand up Meeting',
          date: '2025-07-10',
          startTime: '09:00',
          endTime: '10:00',
          description: '기존 팀 미팅',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
        {
          id: '4',
          title: 'Stand up Meeting',
          date: '2025-07-30',
          startTime: '09:00',
          endTime: '10:00',
          description: '기존 팀 미팅',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
        {
          id: '5',
          title: 'Monthly Meeting',
          date: '2025-07-31',
          startTime: '09:00',
          endTime: '10:00',
          description: '기존 팀 미팅',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
      ]);
    });

    it('검색어가 대소문자를 구분하지 않고 동작한다', () => {
      // Given: 대문자 "EVENT" 검색어와 주간 뷰 설정
      const searchTerm = 'EVENT';
      const currentDate = new Date('2025-07-01');
      const view = 'week';

      // When: 이벤트 필터링 실행
      const result = getFilteredEvents(testEvents, searchTerm, currentDate, view);

      // Then: 대소문자 구분 없이 Event가 포함된 이벤트들이 반환되어야 함
      expect(result).toEqual([
        {
          id: '1',
          title: 'Event 1',
          date: '2025-07-01',
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
          title: 'Event 2',
          date: '2025-07-02',
          startTime: '09:00',
          endTime: '10:00',
          description: '기존 팀 미팅',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
      ]);
    });
  });

  describe('빈 검색어 처리', () => {
    it('검색어가 빈 문자열일 때는 날짜 범위에 관계없이 모든 이벤트를 반환한다', () => {
      // Given: 빈 검색어와 주간 뷰 설정
      const searchTerm = '';
      const currentDate = new Date('2025-07-01');
      const view = 'week';

      // When: 이벤트 필터링 실행
      const result = getFilteredEvents(testEvents, searchTerm, currentDate, view);

      // Then: 모든 이벤트가 반환되어야 함 (검색어가 없으면 날짜 필터링도 무시됨)
      expect(result).toEqual([
        {
          id: '1',
          title: 'Event 1',
          date: '2025-07-01',
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
          title: 'Event 2',
          date: '2025-07-02',
          startTime: '09:00',
          endTime: '10:00',
          description: '기존 팀 미팅',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
        {
          id: '3',
          title: 'Stand up Meeting',
          date: '2025-07-10',
          startTime: '09:00',
          endTime: '10:00',
          description: '기존 팀 미팅',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
        {
          id: '4',
          title: 'Stand up Meeting',
          date: '2025-07-30',
          startTime: '09:00',
          endTime: '10:00',
          description: '기존 팀 미팅',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
        {
          id: '5',
          title: 'Monthly Meeting',
          date: '2025-07-31',
          startTime: '09:00',
          endTime: '10:00',
          description: '기존 팀 미팅',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
      ]);
    });
  });

  describe('검색어와 날짜 범위 복합 필터링', () => {
    it('검색어 "Event"와 주간 뷰(2025-07-01~07-07)를 동시에 적용하여 해당 주의 Event만 반환한다', () => {
      // Given: Event 검색어와 2025-07-01 주간 뷰 설정
      const searchTerm = 'Event';
      const currentDate = new Date('2025-07-01'); // 2025-07-01 주간은 06/30~07/06
      const view = 'week';

      // When: 이벤트 필터링 실행
      const result = getFilteredEvents(testEvents, searchTerm, currentDate, view);

      // Then: 해당 주에 있으면서 Event가 포함된 이벤트만 반환
      expect(result).toEqual([
        {
          id: '1',
          title: 'Event 1',
          date: '2025-07-01',
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
          title: 'Event 2',
          date: '2025-07-02',
          startTime: '09:00',
          endTime: '10:00',
          description: '기존 팀 미팅',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
      ]);
    });

    it('검색어 "Meeting"과 월말 주간 뷰(2025-07-30 주)를 적용하여 해당 주의 Meeting만 반환한다', () => {
      // Given: Meeting 검색어와 2025-07-30 주간 뷰 설정
      const searchTerm = 'Meeting';
      const currentDate = new Date('2025-07-30'); // 2025-07-30 주간에는 07-30, 07-31이 포함
      const view = 'week';

      // When: 이벤트 필터링 실행
      const result = getFilteredEvents(testEvents, searchTerm, currentDate, view);

      // Then: 해당 주에 있으면서 Meeting이 포함된 이벤트만 반환
      expect(result).toEqual([
        {
          id: '4',
          title: 'Stand up Meeting',
          date: '2025-07-30',
          startTime: '09:00',
          endTime: '10:00',
          description: '기존 팀 미팅',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
        {
          id: '5',
          title: 'Monthly Meeting',
          date: '2025-07-31',
          startTime: '09:00',
          endTime: '10:00',
          description: '기존 팀 미팅',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
      ]);
    });
  });

  describe('엣지 케이스', () => {
    it('빈 이벤트 배열에 대해서는 항상 빈 배열을 반환한다', () => {
      // Given: 빈 이벤트 배열과 검색 조건
      const emptyEvents: Event[] = [];
      const searchTerm = 'Event';
      const currentDate = new Date('2025-07-01');
      const view = 'week';

      // When: 이벤트 필터링 실행
      const result = getFilteredEvents(emptyEvents, searchTerm, currentDate, view);

      // Then: 빈 배열이 반환되어야 함
      expect(result).toEqual([]);
    });

    it('존재하지 않는 검색어로 검색하면 빈 배열을 반환한다', () => {
      // Given: 존재하지 않는 검색어
      const searchTerm = 'NonExistentEvent';
      const currentDate = new Date('2025-07-01');
      const view = 'month';

      // When: 이벤트 필터링 실행
      const result = getFilteredEvents(testEvents, searchTerm, currentDate, view);

      // Then: 빈 배열이 반환되어야 함
      expect(result).toEqual([]);
    });
  });
});
