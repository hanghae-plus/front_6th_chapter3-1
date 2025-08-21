import { fetchHolidays } from '../../apis/fetchHolidays';
describe('fetchHolidays', () => {
  it('주어진 월의 공휴일만 반환한다', () => {
    const date = new Date('2025-08-01');
    const holidays = fetchHolidays(date);

    expect(holidays).toHaveProperty('2025-08-15');
    expect(holidays['2025-08-15']).toBe('광복절');
  });

  it('공휴일이 없는 월에 대해 빈 객체를 반환한다', () => {
    const date = new Date('2025-11-01');
    const holidays = fetchHolidays(date);

    expect(holidays).toEqual({});
  });

  it('여러 공휴일이 있는 월에 대해 모든 공휴일을 반환한다', () => {
    const date = new Date('2025-10-01');
    const holidays = fetchHolidays(date);

    expect(holidays).toHaveProperty('2025-10-03');
    expect(holidays).toHaveProperty('2025-10-09');
  });
});
