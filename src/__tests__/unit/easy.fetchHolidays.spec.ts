import { fetchHolidays } from '../../apis/fetchHolidays';

describe('fetchHolidays', () => {
  it('주어진 월의 공휴일만 반환한다', () => {
    const date = new Date('2025-01-01');
    const holidays = fetchHolidays(date);

    expect(holidays).toEqual({
      '2025-01-01': '신정',
      '2025-01-29': '설날',
      '2025-01-30': '설날',
      '2025-01-31': '설날',
    });
  });

  it('공휴일이 없는 월에 대해 빈 객체를 반환한다', () => {
    const date = new Date('2025-02-15');
    const holidays = fetchHolidays(date);

    expect(holidays).toEqual({});
    expect(Object.keys(holidays)).toHaveLength(0);
  });

  it('여러 공휴일이 있는 월에 대해 모든 공휴일을 반환한다', () => {
    const date = new Date('2025-10-01');
    const holidays = fetchHolidays(date);

    expect(holidays).toEqual({
      '2025-10-03': '개천절',
      '2025-10-05': '추석',
      '2025-10-06': '추석',
      '2025-10-07': '추석',
      '2025-10-09': '한글날',
    });
  });

  // 추가는 했는데 필요할지 의문이다.
  it('단일 공휴일이 있는 월에 대해 정확한 공휴일을 반환한다', () => {
    const date = new Date('2025-03-01');
    const holidays = fetchHolidays(date);

    expect(holidays).toEqual({
      '2025-03-01': '삼일절',
    });

    const date2 = new Date('2025-12-01');
    const holidays2 = fetchHolidays(date2);

    expect(holidays2).toEqual({
      '2025-12-25': '크리스마스',
    });
  });
});
