import { fetchHolidays } from '../../apis/fetchHolidays';

// 이 함수는 네트워크 요청(fetch)을 하지 않고 로컬 상수에서 데이터를 필터링만 함
// 함수명 fetchHolidays와 apis 폴더에 위치시킨 것은 오해의 소지가 있음
// getHolidays로 이름 변경하고 utils 폴더로 이동하는 것이 어떨까 라는 생각이 듦
describe('fetchHolidays', () => {
  it('주어진 월의 공휴일만 반환한다', () => {
    const holidays = fetchHolidays(new Date('2025-01'));
    expect(holidays).toEqual({
      '2025-01-01': '신정',
      '2025-01-29': '설날',
      '2025-01-30': '설날',
      '2025-01-31': '설날',
    });
  });

  it('공휴일이 없는 월에 대해 빈 객체를 반환한다', () => {
    const holidays = fetchHolidays(new Date('2025-02'));
    expect(holidays).toEqual({});
  });

  it('여러 공휴일이 있는 월에 대해 모든 공휴일을 반환한다', () => {
    const holidays = fetchHolidays(new Date('2025-10'));
    expect(holidays).toEqual({
      '2025-10-03': '개천절',
      '2025-10-05': '추석',
      '2025-10-06': '추석',
      '2025-10-07': '추석',
      '2025-10-09': '한글날',
    });
  });
});
