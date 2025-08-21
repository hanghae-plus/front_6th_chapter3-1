import { fetchHolidays } from '../../apis/fetchHolidays';
describe('fetchHolidays', () => {
  it('주어진 월의 공휴일만 반환한다', () => {
    const targetDate = new Date('2025-01-15');

    const result = fetchHolidays(targetDate);

    expect(Object.keys(result)).toHaveLength(4);
    expect(result).toEqual({
      '2025-01-01': '신정',
      '2025-01-29': '설날',
      '2025-01-30': '설날',
      '2025-01-31': '설날',
    });

    expect(result['2025-01-01']).toBe('신정');
    expect(result['2025-01-29']).toBe('설날');
    expect(result['2025-01-30']).toBe('설날');
    expect(result['2025-01-31']).toBe('설날');

    expect(result).not.toHaveProperty('2025-03-01');
    expect(result).not.toHaveProperty('2025-12-25');
  });

  it('공휴일이 없는 월에 대해 빈 객체를 반환한다', () => {
    const testMonths = [
      new Date('2025-02-01'),
      new Date('2025-04-01'),
      new Date('2025-07-01'),
      new Date('2025-09-01'),
      new Date('2025-11-01'),
    ];

    testMonths.forEach((date) => {
      const targetDate = new Date(date);
      const monthResult = fetchHolidays(targetDate);
      expect(monthResult).toEqual({});
      expect(Object.keys(monthResult)).toHaveLength(0);
    });
  });

  // 첫 테스트로 대체 가능하여 삭제
  it.skip('여러 공휴일이 있는 월에 대해 모든 공휴일을 반환한다', () => {
    const targetDate = new Date('2025-10-15');

    const result = fetchHolidays(targetDate);

    expect(Object.keys(result)).toHaveLength(5);

    expect(result).toEqual({
      '2025-10-03': '개천절',
      '2025-10-05': '추석',
      '2025-10-06': '추석',
      '2025-10-07': '추석',
      '2025-10-09': '한글날',
    });

    expect(result['2025-10-03']).toBe('개천절');
    expect(result['2025-10-05']).toBe('추석');
    expect(result['2025-10-06']).toBe('추석');
    expect(result['2025-10-07']).toBe('추석');
    expect(result['2025-10-09']).toBe('한글날');

    expect(result).not.toHaveProperty('2025-08-15');
    expect(result).not.toHaveProperty('2025-12-25');
  });
});
