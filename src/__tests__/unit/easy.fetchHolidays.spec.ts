import { fetchHolidays } from '../../apis/fetchHolidays';

describe('fetchHolidays', () => {
  it('주어진 월(2025년 1월)의 공휴일만 정확히 반환한다', () => {
    const date = new Date('2025-01-15');
    const holidays = fetchHolidays(date);
    expect(holidays).toEqual({
      '2025-01-01': '신정',
      '2025-01-29': '설날',
      '2025-01-30': '설날',
      '2025-01-31': '설날',
    });
  });

  it('공휴일이 없는 월(2025년 2월)에 대해 빈 객체를 반환한다', () => {
    const date = new Date('2025-02-10');
    const holidays = fetchHolidays(date);
    expect(holidays).toEqual({});
  });

  it('여러 공휴일이 있는 월(2025년 10월)에 대해 모든 공휴일을 반환한다', () => {
    const date = new Date('2025-10-20');
    const holidays = fetchHolidays(date);
    expect(holidays).toEqual({
      '2025-10-03': '개천절',
      '2025-10-05': '추석',
      '2025-10-06': '추석',
      '2025-10-07': '추석',
      '2025-10-09': '한글날',
    });
  });

  it('공휴일이 하나만 있는 월(2025년 12월)에 대해 해당 공휴일만 반환한다', () => {
    const date = new Date('2025-12-01');
    const holidays = fetchHolidays(date);
    expect(holidays).toEqual({
      '2025-12-25': '크리스마스',
    });
  });
});
