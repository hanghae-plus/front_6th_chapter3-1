import { fetchHolidays } from '../../apis/fetchHolidays';
// export function fetchHolidays(date: Date) {
//   const y = date.getFullYear();
//   const m = String(date.getMonth() + 1).padStart(2, '0');
//   const holidays = Object.keys(HOLIDAY_RECORD) as HolidayKeys[];
//   return holidays
//     .filter((date) => date.includes(`${y}-${m}`))
//     .reduce(
//       (acc: Partial<HolidayRecord>, date) => ({
//         ...acc,
//         [date]: HOLIDAY_RECORD[date],
//       }),
//       {}
//     );
// }

describe('fetchHolidays', () => {
  it('주어진 월의 공휴일만 반환한다', () => {
    const currentDate = new Date('2025-08-01');
    const holidays = fetchHolidays(currentDate);
    console.log(holidays);
    expect(holidays).toEqual({ '2025-08-15': '광복절' });
  });

  it('공휴일이 없는 월에 대해 빈 객체를 반환한다', () => {
    const currentDate = new Date('2025-07-01');
    const holidays = fetchHolidays(currentDate);
    console.log(holidays);
    expect(holidays).toEqual({});
  });

  it('여러 공휴일이 있는 월에 대해 모든 공휴일을 반환한다', () => {
    const currentDate = new Date('2025-10-01');
    const holidays = fetchHolidays(currentDate);
    console.log(holidays);
    expect(holidays).toEqual({
      '2025-10-05': '추석',
      '2025-10-06': '추석',
      '2025-10-07': '추석',
      '2025-10-03': '개천절',
      '2025-10-09': '한글날',
    });
  });
});
