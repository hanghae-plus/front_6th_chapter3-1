import { fetchHolidays } from '../../apis/fetchHolidays';
describe('fetchHolidays', () => {
  it('"2025-03-01"에 대하여 3월의 공휴일인 삼일절이 포함된 객체을 반환한다', () => {
    const marchDay = new Date(2025, 2, 1); // 2025-03-01

    expect(fetchHolidays(marchDay)).toEqual({ '2025-03-01': '삼일절' });
  });

  it('공휴일이 없는 7월의 "2025-07-01"에 대하여 빈 객체를 반환한다', () => {
    const julyDay = new Date(2025, 6, 1); // 2025-07-01

    expect(fetchHolidays(julyDay)).toEqual({});
  });

  it('여러 공휴일이 있는 10월의 "2025-10-01" 대해 모든 공휴일이 포함된 배열을 반환한다', () => {
    const octoberDay = new Date(2025, 9, 1); // 2025-10-01

    expect(fetchHolidays(octoberDay)).toEqual({
      '2025-10-03': '개천절',
      '2025-10-05': '추석',
      '2025-10-06': '추석',
      '2025-10-07': '추석',
      '2025-10-09': '한글날',
    });
  });
});
