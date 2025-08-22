import { fetchHolidays } from '../../apis/fetchHolidays';

describe('fetchHolidays', () => {
  const date = new Date();
  const year = date.getFullYear();
  const nonHolidayMonths = [1, 3, 6, 8, 10];
  function randomIndex(months: number[]) {
    return Math.floor(Math.random() * months.length);
  }

  const nonHolidayIndex = randomIndex(nonHolidayMonths);

  it('주어진 월의 공휴일만 반환한다', () => {
    const paramDate = new Date(year, 0, 1);
    const holidays = fetchHolidays(paramDate);
    expect(holidays).toStrictEqual({
      '2025-01-01': '신정',
      '2025-01-29': '설날',
      '2025-01-30': '설날',
      '2025-01-31': '설날',
    });
  });

  it('공휴일이 없는 월에 대해 빈 객체를 반환한다', () => {
    const paramDate = new Date(year, nonHolidayMonths[nonHolidayIndex], 1);
    const nonHolidays = fetchHolidays(paramDate);

    expect(nonHolidays).toStrictEqual({});
  });

  it('여러 공휴일이 있는 월에 대해 모든 공휴일을 반환한다', () => {
    const paramDate = new Date(year, 9, 1);
    const holidays = fetchHolidays(paramDate);
    expect(holidays).toStrictEqual({
      '2025-10-05': '추석',
      '2025-10-06': '추석',
      '2025-10-07': '추석',
      '2025-10-03': '개천절',
      '2025-10-09': '한글날',
    });
  });
});
