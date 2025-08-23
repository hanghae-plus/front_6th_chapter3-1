import { fetchHolidays } from '../../apis/fetchHolidays';

describe('fetchHolidays', () => {
  it('주어진 월의 공휴일만 반환한다', () => {
    // 1월
    const january = new Date('2025-01-15');
    const januaryHolidays = fetchHolidays(january);

    expect(januaryHolidays).toEqual({
      '2025-01-01': '신정',
      '2025-01-29': '설날',
      '2025-01-30': '설날',
      '2025-01-31': '설날',
    });

    // 3월
    const march = new Date('2025-03-15');
    const marchHolidays = fetchHolidays(march);

    expect(marchHolidays).toEqual({
      '2025-03-01': '삼일절',
    });

    // 5월
    const mayDate = new Date('2025-05-15');
    const mayHolidays = fetchHolidays(mayDate);

    expect(mayHolidays).toEqual({
      '2025-05-05': '어린이날',
    });
  });

  it('공휴일이 없는 월에 대해 빈 객체를 반환한다', () => {
    // 4월
    const april = new Date('2025-04-15');
    const aprilHolidays = fetchHolidays(april);

    expect(aprilHolidays).toEqual({});

    // 7월
    const july = new Date('2025-07-15');
    const julyHolidays = fetchHolidays(july);

    expect(julyHolidays).toEqual({});

    // 9월
    const september = new Date('2025-09-15');
    const septemberHolidays = fetchHolidays(september);

    expect(septemberHolidays).toEqual({});

    // 11월
    const november = new Date('2025-11-15');
    const novemberHolidays = fetchHolidays(november);

    expect(novemberHolidays).toEqual({});
  });

  it('여러 공휴일이 있는 월에 대해 모든 공휴일을 반환한다', () => {
    // 10월
    const october = new Date('2025-10-15');
    const octoberHolidays = fetchHolidays(october);

    expect(octoberHolidays).toEqual({
      '2025-10-03': '개천절',
      '2025-10-05': '추석',
      '2025-10-06': '추석',
      '2025-10-07': '추석',
      '2025-10-09': '한글날',
    });

    expect(octoberHolidays).toHaveProperty('2025-10-03', '개천절');
    expect(octoberHolidays).toHaveProperty('2025-10-05', '추석');
    expect(octoberHolidays).toHaveProperty('2025-10-06', '추석');
    expect(octoberHolidays).toHaveProperty('2025-10-07', '추석');
    expect(octoberHolidays).toHaveProperty('2025-10-09', '한글날');
  });

  it('월의 경계값에서도 정확히 작동한다', () => {
    // 월의 첫 날 (1월 1일)
    const firstDay = new Date('2025-01-01');
    const firstDayHolidays = fetchHolidays(firstDay);
    expect(firstDayHolidays).toHaveProperty('2025-01-01', '신정');

    // 월의 마지막 날 (1월 31일)
    const lastDay = new Date('2025-01-31');
    const lastDayHolidays = fetchHolidays(lastDay);
    expect(lastDayHolidays).toHaveProperty('2025-01-31', '설날');

    // 12월 테스트 (크리스마스)
    const decDate = new Date('2025-12-25');
    const decHolidays = fetchHolidays(decDate);
    expect(decHolidays).toEqual({
      '2025-12-25': '크리스마스',
    });
  });

  it('다른 연도에 대해서는 빈 객체를 반환한다', () => {
    // 2024년 1월 (2025년 데이터만 있음)
    const date2024 = new Date('2024-01-01');
    const holidays2024 = fetchHolidays(date2024);
    expect(holidays2024).toEqual({});
    expect(Object.keys(holidays2024)).toHaveLength(0);

    // 2026년 1월
    const date2026 = new Date('2026-01-01');
    const holidays2026 = fetchHolidays(date2026);
    expect(holidays2026).toEqual({});
    expect(Object.keys(holidays2026)).toHaveLength(0);
  });

  it('한 자리 월과 두 자리 월을 모두 올바르게 처리한다', () => {
    // 1월
    const jan = new Date('2025-01-15');
    const janHolidays = fetchHolidays(jan);
    expect(Object.keys(janHolidays)).toHaveLength(4);

    // 10월
    const oct = new Date('2025-10-15');
    const octHolidays = fetchHolidays(oct);
    expect(Object.keys(octHolidays)).toHaveLength(5);

    // 6월
    const jun = new Date('2025-06-15');
    const junHolidays = fetchHolidays(jun);
    expect(junHolidays).toEqual({
      '2025-06-06': '현충일',
    });

    // 8월
    const aug = new Date('2025-08-15');
    const augHolidays = fetchHolidays(aug);
    expect(augHolidays).toEqual({
      '2025-08-15': '광복절',
    });
  });
});
