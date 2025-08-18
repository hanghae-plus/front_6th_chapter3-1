import { fetchHolidays } from '../../apis/fetchHolidays';
describe('fetchHolidays', () => {
  it('3월의 공휴일만 반환한다', () => {
    const result = fetchHolidays(new Date('2025-03-01'));
    expect(result).toEqual({
      '2025-03-01': '삼일절',
    });
  });

  it('공휴일이 없는 2월에 대해 빈 객체를 반환한다', () => {
    const result = fetchHolidays(new Date('2025-02-01'));
    expect(result).toEqual({});
  });

  it('여러 공휴일이 있는 1월에 대해 모든 공휴일을 반환한다', () => {
    const result = fetchHolidays(new Date('2025-01-01'));
    expect(result).toEqual({
      '2025-01-01': '신정',
      '2025-01-29': '설날',
      '2025-01-30': '설날',
      '2025-01-31': '설날',
    });
  });
});
