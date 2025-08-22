import { describe, expect } from 'vitest';

import { Event, EventForm } from '../../types';
import { findOverlappingEvents } from '../../utils/eventOverlap';

describe('eventOverlap', () => {
  const existingEvents: Event[] = [
    {
      id: '1',
      title: '기존 회의',
      date: '2024-07-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '점심 약속',
      date: '2024-07-15',
      startTime: '12:00',
      endTime: '13:00',
      description: '',
      location: '',
      category: '개인',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '3',
      title: '다른 날 일정',
      date: '2024-07-16',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
  ];

  describe('findOverlappingEvents 함수', () => {
    it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
      const newEvent: EventForm = {
        title: '새 일정',
        date: '2024-07-15',
        startTime: '11:00',
        endTime: '12:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      };

      const result = findOverlappingEvents(newEvent, existingEvents);
      expect(result).toHaveLength(0);
    });

    it('시간이 완전히 겹치는 이벤트를 찾는다', () => {
      const newEvent: EventForm = {
        title: '새 일정',
        date: '2024-07-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      };

      const result = findOverlappingEvents(newEvent, existingEvents);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('부분적으로 겹치는 이벤트를 찾는다 - 시작시간 겹침', () => {
      const newEvent: EventForm = {
        title: '새 일정',
        date: '2024-07-15',
        startTime: '08:30',
        endTime: '09:30',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      };

      const result = findOverlappingEvents(newEvent, existingEvents);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('부분적으로 겹치는 이벤트를 찾는다 - 종료시간 겹침', () => {
      const newEvent: EventForm = {
        title: '새 일정',
        date: '2024-07-15',
        startTime: '09:30',
        endTime: '10:30',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      };

      const result = findOverlappingEvents(newEvent, existingEvents);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('기존 이벤트를 완전히 포함하는 새 이벤트를 찾는다', () => {
      const newEvent: EventForm = {
        title: '새 일정',
        date: '2024-07-15',
        startTime: '08:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      };

      const result = findOverlappingEvents(newEvent, existingEvents);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('새 이벤트가 기존 이벤트에 완전히 포함되는 경우를 찾는다', () => {
      const newEvent: EventForm = {
        title: '새 일정',
        date: '2024-07-15',
        startTime: '09:15',
        endTime: '09:45',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      };

      const result = findOverlappingEvents(newEvent, existingEvents);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('여러 이벤트와 겹치는 경우 모두 반환한다', () => {
      const newEvent: EventForm = {
        title: '긴 일정',
        date: '2024-07-15',
        startTime: '08:00',
        endTime: '14:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      };

      const result = findOverlappingEvents(newEvent, existingEvents);
      expect(result).toHaveLength(2);
      expect(result.map((e) => e.id)).toContain('1');
      expect(result.map((e) => e.id)).toContain('2');
    });

    it('다른 날짜의 이벤트는 겹치지 않는다', () => {
      const newEvent: EventForm = {
        title: '새 일정',
        date: '2024-07-17',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      };

      const result = findOverlappingEvents(newEvent, existingEvents);
      expect(result).toHaveLength(0);
    });

    it('시간이 정확히 연결되는 경우는 겹치지 않는다', () => {
      const newEvent: EventForm = {
        title: '새 일정',
        date: '2024-07-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      };

      const result = findOverlappingEvents(newEvent, existingEvents);
      expect(result).toHaveLength(0);
    });

    it('편집 중인 이벤트는 제외한다', () => {
      const editingEvent: Event = {
        id: '1',
        title: '수정된 회의',
        date: '2024-07-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      };

      const result = findOverlappingEvents(editingEvent, existingEvents);
      expect(result).toHaveLength(0);
    });
  });

  describe('경계값 테스트', () => {
    it('자정을 넘나드는 시간을 올바르게 처리한다', () => {
      const lateEvent: Event = {
        id: '4',
        title: '늦은 이벤트',
        date: '2024-07-15',
        startTime: '23:00',
        endTime: '23:59',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      };

      const newEvent: EventForm = {
        title: '새 일정',
        date: '2024-07-15',
        startTime: '23:30',
        endTime: '23:45',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      };

      const result = findOverlappingEvents(newEvent, [lateEvent]);
      expect(result).toHaveLength(1);
    });

    it('같은 시작 시간을 가진 이벤트들을 올바르게 처리한다', () => {
      const sameStartEvent: Event = {
        id: '4',
        title: '같은 시작',
        date: '2024-07-15',
        startTime: '09:00',
        endTime: '09:30',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      };

      const newEvent: EventForm = {
        title: '새 일정',
        date: '2024-07-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      };

      const result = findOverlappingEvents(newEvent, [sameStartEvent]);
      expect(result).toHaveLength(1);
    });

    it('같은 종료 시간을 가진 이벤트들을 올바르게 처리한다', () => {
      const sameEndEvent: Event = {
        id: '4',
        title: '같은 종료',
        date: '2024-07-15',
        startTime: '09:30',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      };

      const newEvent: EventForm = {
        title: '새 일정',
        date: '2024-07-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      };

      const result = findOverlappingEvents(newEvent, [sameEndEvent]);
      expect(result).toHaveLength(1);
    });

    it('1분 이벤트도 올바르게 처리한다', () => {
      const shortEvent: Event = {
        id: '4',
        title: '짧은 이벤트',
        date: '2024-07-15',
        startTime: '09:30',
        endTime: '09:31',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      };

      const newEvent: EventForm = {
        title: '새 일정',
        date: '2024-07-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      };

      const result = findOverlappingEvents(newEvent, [shortEvent]);
      expect(result).toHaveLength(1);
    });
  });

  describe('예외 상황 처리', () => {
    it('빈 이벤트 배열에 대해 빈 배열을 반환한다', () => {
      const newEvent: EventForm = {
        title: '새 일정',
        date: '2024-07-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      };

      const result = findOverlappingEvents(newEvent, []);
      expect(result).toHaveLength(0);
    });

    it('잘못된 시간 순서도 처리한다', () => {
      const invalidEvent: EventForm = {
        title: '잘못된 일정',
        date: '2024-07-15',
        startTime: '10:00',
        endTime: '09:00', // 종료 시간이 시작 시간보다 빠름
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      };

      const result = findOverlappingEvents(invalidEvent, existingEvents);
      // 잘못된 시간이라도 함수가 에러 없이 실행되어야 함
      expect(result).toBeDefined();
    });
  });
});
