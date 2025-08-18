import { fetchHolidays } from '../../apis/fetchHolidays';

describe('fetchHolidays', () => {
  const date = new Date();
  const year = date.getFullYear();
  const nonHolidayMonths = [1, 3, 6, 8, 10];
  const holidayMonths = [0, 2, 4, 5, 7, 9, 11];
  function randomIndex(months: number[]) {
    return Math.floor(Math.random() * months.length);
  }

  const nonHolidayIndex = randomIndex(nonHolidayMonths);
  const holidayIndex = randomIndex(holidayMonths);

  it('주어진 월의 공휴일만 반환한다', () => {
    const paramDate = new Date(year, holidayMonths[holidayIndex], 1);
    const holidays = fetchHolidays(paramDate);
  });

  it('공휴일이 없는 월에 대해 빈 객체를 반환한다', () => {
    console.log('nonHolidayMonths[nonHolidayIndex] + 1', nonHolidayMonths[nonHolidayIndex] + 1);
    const paramDate = new Date(year, nonHolidayMonths[nonHolidayIndex], 1);
    const nonHolidays = fetchHolidays(paramDate);

    expect(nonHolidays).toStrictEqual({});
  });

  it('여러 공휴일이 있는 월에 대해 모든 공휴일을 반환한다', () => {});
});
