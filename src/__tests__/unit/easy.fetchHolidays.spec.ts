import { fetchHolidays } from '../../apis/fetchHolidays';
describe('fetchHolidays', () => {
  it('주어진 월의 공휴일만 반환한다', () => {
    const inputDate = new Date('2025-06-15');
    const result = fetchHolidays(inputDate);
    const [date, holidayName] = Object.entries(result)[0];

    expect(date).toBe('2025-06-06');
    expect(holidayName).toBe('현충일');
  });

  it('공휴일이 없는 월에 대해 빈 객체를 반환한다', () => {
    const inputDate = new Date('2025-07-18');
    const result = fetchHolidays(inputDate);

    expect(result).toEqual({});
  });

  it('여러 공휴일이 있는 월에 대해 모든 공휴일을 반환한다', () => {
    const inputDate = new Date('2025-01-01');
    const result = fetchHolidays(inputDate);
    const resultLength = Object.keys(result).length;

    expect(resultLength).toBe(4);
  });
});
