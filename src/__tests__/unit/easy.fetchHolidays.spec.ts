import { fetchHolidays } from '../../apis/fetchHolidays';

describe('fetchHolidays', () => {
  // 주어진 월의 공휴일만 반환한다
  it('2025-12-01을 입력하면 12월의 공휴일만 반환한다', () => {
    const input = new Date('2025-12-01');

    const result = fetchHolidays(input);

    expect(result).toEqual({
      '2025-12-25': '크리스마스',
    });
  });

  // 공휴일이 없는 월에 대해 빈 객체를 반환한다
  it('2025-02-01을 입력하면 빈 객체를 반환한다', () => {
    const input = new Date('2025-02-01');

    const result = fetchHolidays(input);

    expect(result).toEqual({});
  });

  // 여러 공휴일이 있는 월에 대해 모든 공휴일을 반환한다
  it('2025-01-01을 입력하면 1월의 모든 공휴일을 반환한다', () => {
    const input = new Date('2025-01-01');

    const result = fetchHolidays(input);

    expect(result).toEqual({
      '2025-01-01': '신정',
      '2025-01-29': '설날',
      '2025-01-30': '설날',
      '2025-01-31': '설날',
    });
  });
});
