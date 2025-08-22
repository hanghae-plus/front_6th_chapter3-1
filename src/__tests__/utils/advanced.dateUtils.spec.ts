import { describe, expect } from 'vitest';

import { Event } from '../../types';
import {
  formatDate,
  formatMonth,
  formatWeek,
  getEventsForDay,
  getWeekDates,
  getWeeksAtMonth,
  isDateInRange,
} from '../../utils/dateUtils';

describe('dateUtils', () => {
  describe('formatDate 함수', () => {
    it('주어진 날짜를 YYYY-MM-DD 형식으로 포맷한다', () => {
      const date = new Date('2024-07-15');
      const result = formatDate(date, 15);

      expect(result).toBe('2024-07-15');
    });

    it('월의 첫날을 올바르게 포맷한다', () => {
      const date = new Date('2024-07-01');
      const result = formatDate(date, 1);

      expect(result).toBe('2024-07-01');
    });

    it('월의 마지막날을 올바르게 포맷한다', () => {
      const date = new Date('2024-07-31');
      const result = formatDate(date, 31);

      expect(result).toBe('2024-07-31');
    });

    it('12월의 날짜를 올바르게 포맷한다', () => {
      const date = new Date('2024-12-25');
      const result = formatDate(date, 25);

      expect(result).toBe('2024-12-25');
    });

    it('윤년의 2월 29일을 올바르게 처리한다', () => {
      const date = new Date('2024-02-29');
      const result = formatDate(date, 29);

      expect(result).toBe('2024-02-29');
    });
  });

  describe('formatMonth 함수', () => {
    it('월을 한국어 형식으로 포맷한다', () => {
      const date = new Date('2024-07-15');
      const result = formatMonth(date);

      expect(result).toBe('2024년 7월');
    });

    it('연도 경계의 월을 올바르게 포맷한다', () => {
      const january = new Date('2024-01-01');
      const december = new Date('2024-12-31');

      expect(formatMonth(january)).toBe('2024년 1월');
      expect(formatMonth(december)).toBe('2024년 12월');
    });

    it('다른 연도의 월을 올바르게 포맷한다', () => {
      const date = new Date('2025-03-15');
      const result = formatMonth(date);

      expect(result).toBe('2025년 3월');
    });
  });

  describe('formatWeek 함수', () => {
    it('주차를 한국어 형식으로 포맷한다', () => {
      const date = new Date('2024-07-15'); // 월요일
      const result = formatWeek(date);

      expect(result).toBe('2024년 7월 3주');
    });

    it('월의 첫 주를 올바르게 포맷한다', () => {
      const date = new Date('2024-07-01');
      const result = formatWeek(date);

      expect(result).toBe('2024년 7월 1주');
    });

    it('월의 마지막 주를 올바르게 포맷한다', () => {
      const date = new Date('2024-07-29');
      const result = formatWeek(date);

      expect(result).toBe('2024년 8월 1주');
    });
  });

  describe('getWeekDates 함수', () => {
    it('주어진 날짜가 속한 주의 모든 날짜를 반환한다', () => {
      const date = new Date('2024-07-15'); // 월요일
      const result = getWeekDates(date);

      expect(result).toHaveLength(7);
      expect(result[0].getDay()).toBe(0); // 일요일
      expect(result[6].getDay()).toBe(6); // 토요일
    });

    it('일요일이 주의 시작이다', () => {
      const monday = new Date('2024-07-15');
      const result = getWeekDates(monday);

      expect(result[0].getDay()).toBe(0); // 일요일
      expect(result[0].getDate()).toBe(14); // 7월 14일 (일요일)
    });

    it('연도를 넘나드는 주를 올바르게 처리한다', () => {
      const endOfYear = new Date('2023-12-31'); // 일요일
      const result = getWeekDates(endOfYear);

      expect(result).toHaveLength(7);
      expect(result[0].getFullYear()).toBe(2023);
      expect(result[6].getFullYear()).toBe(2024);
    });

    it('월을 넘나드는 주를 올바르게 처리한다', () => {
      const endOfMonth = new Date('2024-07-31');
      const result = getWeekDates(endOfMonth);

      expect(result).toHaveLength(7);
      // 일부는 7월, 일부는 8월에 속해야 함
    });
  });

  describe('getWeeksAtMonth 함수', () => {
    it('월의 모든 주를 반환한다', () => {
      const date = new Date('2024-07-15');
      const result = getWeeksAtMonth(date);

      expect(result.length).toBeGreaterThanOrEqual(4);
      expect(result.length).toBeLessThanOrEqual(6);
    });

    it('각 주는 7일을 가진다', () => {
      const date = new Date('2024-07-15');
      const result = getWeeksAtMonth(date);

      result.forEach((week) => {
        expect(week).toHaveLength(7);
      });
    });

    it('월의 첫날과 마지막날이 포함된다', () => {
      const date = new Date('2024-07-15');
      const result = getWeeksAtMonth(date);

      const allDays = result.flat();
      const monthDays = allDays.filter((day) => day !== null);

      expect(monthDays).toContain(1); // 첫날
      expect(monthDays).toContain(31); // 마지막날
    });

    it('2월의 주를 올바르게 처리한다', () => {
      const february = new Date('2024-02-15');
      const result = getWeeksAtMonth(february);

      const allDays = result.flat();
      const monthDays = allDays.filter((day) => day !== null);

      expect(monthDays).toContain(1);
      expect(monthDays).toContain(29); // 윤년
    });

    it('평년 2월을 올바르게 처리한다', () => {
      const february = new Date('2023-02-15');
      const result = getWeeksAtMonth(february);

      const allDays = result.flat();
      const monthDays = allDays.filter((day) => day !== null);

      expect(monthDays).toContain(1);
      expect(monthDays).toContain(28); // 평년
      expect(monthDays).not.toContain(29);
    });
  });

  describe('getEventsForDay 함수', () => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
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
        title: '이벤트 2',
        date: '2024-07-16',
        startTime: '14:00',
        endTime: '15:00',
        description: '',
        location: '',
        category: '개인',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '이벤트 3',
        date: '2024-07-15',
        startTime: '11:00',
        endTime: '12:00',
        description: '',
        location: '',
        category: '가족',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ];

    it('특정 날짜의 이벤트들만 반환한다', () => {
      const result = getEventsForDay(mockEvents, 15);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('3');
    });

    it('해당 날짜에 이벤트가 없으면 빈 배열을 반환한다', () => {
      const result = getEventsForDay(mockEvents, 20);

      expect(result).toHaveLength(0);
    });

    it('이벤트가 시간 순으로 정렬되어 반환된다', () => {
      const result = getEventsForDay(mockEvents, 15);

      expect(result[0].startTime).toBe('09:00');
      expect(result[1].startTime).toBe('11:00');
    });
  });

  describe('isDateInRange 함수', () => {
    it('범위 내의 날짜에 대해 true를 반환한다', () => {
      const date = new Date('2024-07-15');
      const start = new Date('2024-07-01');
      const end = new Date('2024-07-31');

      expect(isDateInRange(date, start, end)).toBe(true);
    });

    it('범위 경계의 날짜에 대해 true를 반환한다', () => {
      const start = new Date('2024-07-01');
      const end = new Date('2024-07-31');

      expect(isDateInRange(start, start, end)).toBe(true);
      expect(isDateInRange(end, start, end)).toBe(true);
    });

    it('범위를 벗어난 날짜에 대해 false를 반환한다', () => {
      const date = new Date('2024-08-01');
      const start = new Date('2024-07-01');
      const end = new Date('2024-07-31');

      expect(isDateInRange(date, start, end)).toBe(false);
    });

    it('시작일보다 이전 날짜에 대해 false를 반환한다', () => {
      const date = new Date('2024-06-30');
      const start = new Date('2024-07-01');
      const end = new Date('2024-07-31');

      expect(isDateInRange(date, start, end)).toBe(false);
    });
  });

  describe('경계값 테스트', () => {
    it('윤년을 올바르게 처리한다', () => {
      const leapYear = new Date('2024-02-29');
      const result = formatDate(leapYear, 29);

      expect(result).toBe('2024-02-29');
    });

    it('연도 경계를 올바르게 처리한다', () => {
      const newYear = new Date('2024-01-01');
      const result = formatDate(newYear, 1);

      expect(result).toBe('2024-01-01');
    });

    it('월 경계를 올바르게 처리한다', () => {
      const monthEnd = new Date('2024-01-31');
      const result = formatDate(monthEnd, 31);

      expect(result).toBe('2024-01-31');
    });
  });
});
