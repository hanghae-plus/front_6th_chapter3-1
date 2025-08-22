import {
  formatMonth,
  formatWeek,
  getDaysInMonth,
  getWeekDates,
  isDateInRange,
} from '../../utils/dateUtils';

describe('단위 테스트: 날짜 및 시간 관리', () => {
  describe('getDaysInMonth 함수', () => {
    test('주어진 월의 일 수를 정확히 반환한다 - 1월', () => {
      expect(getDaysInMonth(2024, 1)).toBe(31);
    });

    test('주어진 월의 일 수를 정확히 반환한다 - 4월', () => {
      expect(getDaysInMonth(2024, 4)).toBe(30);
    });

    test('윤년(2024년) 2월은 29일을 반환해야 한다', () => {
      expect(getDaysInMonth(2024, 2)).toBe(29);
    });

    test('평년(2025년) 2월은 28일을 반환해야 한다', () => {
      expect(getDaysInMonth(2025, 2)).toBe(28);
    });
  });

  describe('getWeekDates 함수', () => {
    test('주어진 날짜(2025-07-16)가 속한 주의 모든 날짜를 반환한다', () => {
      const date = new Date('2025-07-16'); // Wednesday
      const weekDates = getWeekDates(date);
      const expectedDates = [
        new Date('2025-07-13'), // Sunday
        new Date('2025-07-14'),
        new Date('2025-07-15'),
        new Date('2025-07-16'),
        new Date('2025-07-17'),
        new Date('2025-07-18'),
        new Date('2025-07-19'), // Saturday
      ];
      expect(weekDates.map(d => d.toDateString())).toEqual(expectedDates.map(d => d.toDateString()));
    });

    test('연도를 넘어가는 주(2024년 연말)의 날짜를 정확히 처리한다', () => {
      const date = new Date('2024-12-31');
      const weekDates = getWeekDates(date);
      const expectedDates = [
        new Date('2024-12-29'),
        new Date('2024-12-30'),
        new Date('2024-12-31'),
        new Date('2025-01-01'),
        new Date('2025-01-02'),
        new Date('2025-01-03'),
        new Date('2025-01-04'),
      ];
      expect(weekDates.map(d => d.toDateString())).toEqual(expectedDates.map(d => d.toDateString()));
    });
  });

  describe('formatWeek 함수', () => {
    test('주어진 날짜(2025-07-16)의 주 정보를 "YYYY년 M월 N주" 형식으로 반환한다', () => {
      const date = new Date('2025-07-16');
      expect(formatWeek(date)).toBe('2025년 7월 3주');
    });
  });

  describe('formatMonth 함수', () => {
    test('주어진 날짜(2025-07-16)의 월 정보를 "YYYY년 M월" 형식으로 반환한다', () => {
      const date = new Date('2025-07-16');
      expect(formatMonth(date)).toBe('2025년 7월');
    });
  });

  describe('isDateInRange 함수', () => {
    const rangeStart = new Date('2025-07-01');
    const rangeEnd = new Date('2025-07-31');

    test('주어진 날짜(2025-07-15)가 특정 범위 내에 있으면 true를 반환한다', () => {
      const date = new Date('2025-07-15');
      expect(isDateInRange(date, rangeStart, rangeEnd)).toBe(true);
    });

    test('주어진 날짜(2025-06-30)가 특정 범위 밖에 있으면 false를 반환한다', () => {
      const date = new Date('2025-06-30');
      expect(isDateInRange(date, rangeStart, rangeEnd)).toBe(false);
    });

    test('주어진 날짜가 범위의 시작일과 같으면 true를 반환한다', () => {
        const date = new Date('2025-07-01');
        expect(isDateInRange(date, rangeStart, rangeEnd)).toBe(true);
    });

    test('주어진 날짜가 범위의 종료일과 같으면 true를 반환한다', () => {
        const date = new Date('2025-07-31');
        expect(isDateInRange(date, rangeStart, rangeEnd)).toBe(true);
    });
  });
});