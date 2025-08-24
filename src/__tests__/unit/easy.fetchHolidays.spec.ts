import { fetchHolidays } from '../../apis/fetchHolidays';
describe('fetchHolidays', () => {
  describe('월별 필터링 기능', () => {
    test('주어진 3월의 공휴일만 반환하고 다른 월 공휴일은 제외한다', () => {
      const marchDate = new Date('2025-03-15');
      const result = fetchHolidays(marchDate);

      expect(result).toEqual({
        '2025-03-01': '삼일절',
      });

      expect(result).not.toHaveProperty('2025-01-01');
      expect(result).not.toHaveProperty('2025-05-05');
      expect(Object.keys(result)).toHaveLength(1);
    });
  });

  describe('공휴일이 있는 월', () => {
    test('여러 공휴일이 있는 10월에 대해 모든 공휴일을 반환한다', () => {
      const testDate = new Date('2025-10-01');
      const holidays = fetchHolidays(testDate);
      const sortedDates = Object.keys(holidays).sort();
      expect(sortedDates).toHaveLength(5);
      expect(sortedDates).toEqual([
        '2025-10-03',
        '2025-10-05',
        '2025-10-06',
        '2025-10-07',
        '2025-10-09',
      ]);
      expect(holidays['2025-10-03']).toBe('개천절');
      expect(holidays['2025-10-05']).toBe('추석');
      expect(holidays['2025-10-06']).toBe('추석');
      expect(holidays['2025-10-07']).toBe('추석');
      expect(holidays['2025-10-09']).toBe('한글날');
    });
  });

  describe('공휴일이 없는 월', () => {
    test('2월에는 공휴일이 없어 빈 객체를 반환한다', () => {
      const februaryDate = new Date('2025-02-15');
      const result = fetchHolidays(februaryDate);

      expect(result).toEqual({});
      expect(Object.keys(result)).toHaveLength(0);
    });
  });
});
