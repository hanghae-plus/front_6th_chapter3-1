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

  describe('단일 공휴일이 있는 월', () => {
    test('3월에는 삼일절만 반환한다', () => {
      const marchDate = new Date('2025-03-15');
      const result = fetchHolidays(marchDate);

      expect(result).toEqual({
        '2025-03-01': '삼일절',
      });
      expect(Object.keys(result)).toHaveLength(1);
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

  describe('여러 공휴일이 있는 월', () => {
    test('1월에는 신정과 설날 3일을 모두 반환한다', () => {
      const januaryDate = new Date('2025-01-15');
      const result = fetchHolidays(januaryDate);

      expect(result).toEqual({
        '2025-01-01': '신정',
        '2025-01-29': '설날',
        '2025-01-30': '설날',
        '2025-01-31': '설날',
      });
      expect(Object.keys(result)).toHaveLength(4);
    });

    test('10월에는 개천절, 추석 3일, 한글날을 모두 반환한다', () => {
      const octoberDate = new Date('2025-10-15');
      const result = fetchHolidays(octoberDate);

      expect(result).toEqual({
        '2025-10-03': '개천절',
        '2025-10-05': '추석',
        '2025-10-06': '추석',
        '2025-10-07': '추석',
        '2025-10-09': '한글날',
      });
      expect(Object.keys(result)).toHaveLength(5);
    });
  });
});
