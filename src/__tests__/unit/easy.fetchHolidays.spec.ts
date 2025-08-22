import { fetchHolidays } from '../../apis/fetchHolidays';

describe('fetchHolidays', () => {
  it('주어진 월의 공휴일만 반환한다', () => {
    const testMonth = 0;
    const expected = {
      '2025-01-01': '신정',
      '2025-01-29': '설날',
      '2025-01-30': '설날',
      '2025-01-31': '설날',
    };

    const result = fetchHolidays(new Date(2025, testMonth, 1));

    expect(result).toEqual(expected);
  });

  it('공휴일이 없는 월에 대해 빈 객체를 반환한다', () => {
    const testMonth = 1;

    const result = fetchHolidays(new Date(2025, testMonth, 15));

    expect(result).toEqual({});
  });

  it('여러 공휴일이 있는 월에 대해 모든 공휴일을 반환한다', () => {
    const testMonth = 9;
    const expected = {
      '2025-10-03': '개천절',
      '2025-10-05': '추석',
      '2025-10-06': '추석',
      '2025-10-07': '추석',
      '2025-10-09': '한글날',
    };

    const result = fetchHolidays(new Date(2025, testMonth, 1));

    expect(result).toEqual(expected);
  });

  it('단일 공휴일이 있는 월에 대해 해당 공휴일만 반환한다', () => {
    const testMonth = 4;
    const expected = {
      '2025-05-05': '어린이날',
    };

    const result = fetchHolidays(new Date(2025, testMonth, 10));

    expect(result).toEqual(expected);
  });

  it('월의 어느 날짜를 입력해도 같은 결과를 반환한다', () => {
    const testMonth = 0;
    const expected = {
      '2025-01-01': '신정',
      '2025-01-29': '설날',
      '2025-01-30': '설날',
      '2025-01-31': '설날',
    };

    const result1 = fetchHolidays(new Date(2025, testMonth, 1));
    const result2 = fetchHolidays(new Date(2025, testMonth, 15));
    const result3 = fetchHolidays(new Date(2025, testMonth, 31));

    expect(result1).toEqual(expected);
    expect(result2).toEqual(expected);
    expect(result3).toEqual(expected);
  });

  it('다른 연도의 같은 월에 대해 해당 연도의 공휴일을 반환한다', () => {
    const testMonth = 0;
    const expected = {
      '2025-01-01': '신정',
      '2025-01-29': '설날',
      '2025-01-30': '설날',
      '2025-01-31': '설날',
    };

    const result2025 = fetchHolidays(new Date(2025, testMonth, 1));
    const result2026 = fetchHolidays(new Date(2026, testMonth, 5));

    expect(result2025).toEqual(expected);
    expect(result2026).toEqual({});
  });
});
