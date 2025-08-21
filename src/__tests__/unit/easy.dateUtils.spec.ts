import { Event } from '../../types';
import {
  fillZero,
  formatDate,
  formatMonth,
  formatWeek,
  getDaysInMonth,
  getEventsForDay,
  getWeekDates,
  getWeeksAtMonth,
  isDateInRange,
} from '../../utils/dateUtils';

describe('getDaysInMonth', () => {
  it('1월은 31일 수를 반환한다', () => {
    const year = 1993;
    const month = 1;

    expect(getDaysInMonth(year, month)).toBe(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    const year = 1993;
    const month = 4;

    expect(getDaysInMonth(year, month)).toBe(30);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    const leapYear = 2000;
    const month = 2;

    expect(getDaysInMonth(leapYear, month)).toBe(29);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    const normalYear = 1993;
    const month = 2;

    expect(getDaysInMonth(normalYear, month)).toBe(28);
  });

  // 해당 테스트는 이 프로젝트에서 설정한 기능이 아닌 Date 생성시 적용되는 규칙에 대한 테스트라 의미가 없어보입니다
  it('월에 1부터 12까지가 아닌 숫자를 입력시 12로 나눈 나머지 숫자로 입력된다', () => {
    const year = 1993;
    const overMonth = 13;

    expect(getDaysInMonth(year, overMonth)).toBe(31);

    const belowMonth = 0;

    expect(getDaysInMonth(year, belowMonth)).toBe(31);
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들이 담긴 배열을 반환한다', () => {
    const wednesday = new Date(2025, 8, 20); // 2025-09-20

    expect(getWeekDates(wednesday)).toEqual([
      new Date(2025, 8, 14), // 2025-09-14
      new Date(2025, 8, 15), // 2025-09-15
      new Date(2025, 8, 16), // 2025-09-16
      new Date(2025, 8, 17), // 2025-09-17
      new Date(2025, 8, 18), // 2025-09-18
      new Date(2025, 8, 19), // 2025-09-19
      new Date(2025, 8, 20), // 2025-09-20
    ]);
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들이 담긴 배열을 반환한다', () => {
    const monday = new Date(2025, 8, 17); // 2025-09-17

    expect(getWeekDates(monday)).toEqual([
      new Date(2025, 8, 14), // 2025-09-14
      new Date(2025, 8, 15), // 2025-09-15
      new Date(2025, 8, 16), // 2025-09-16
      new Date(2025, 8, 17), // 2025-09-17
      new Date(2025, 8, 18), // 2025-09-18
      new Date(2025, 8, 19), // 2025-09-19
      new Date(2025, 8, 20), // 2025-09-20
    ]);
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들이 담긴 배열을 반환한다', () => {
    const sunDay = new Date(2025, 8, 20); // 2025-09-20

    expect(getWeekDates(sunDay)).toEqual([
      new Date(2025, 8, 14), // 2025-09-14
      new Date(2025, 8, 15), // 2025-09-15
      new Date(2025, 8, 16), // 2025-09-16
      new Date(2025, 8, 17), // 2025-09-17
      new Date(2025, 8, 18), // 2025-09-18
      new Date(2025, 8, 19), // 2025-09-19
      new Date(2025, 8, 20), // 2025-09-20
    ]);
  });

  it('연도의 마지막 날짜에 대하여 연도를 넘어가는 주의 날짜 배열을 반환한다', () => {
    const yearLastday = new Date(2025, 11, 31); // 2025-12-31

    expect(getWeekDates(yearLastday)).toEqual([
      new Date(2025, 11, 28), // 2025-12-28
      new Date(2025, 11, 29), // 2025-12-29
      new Date(2025, 11, 30), // 2025-12-30
      new Date(2025, 11, 31), // 2025-12-31
      new Date(2026, 0, 1), // 2026-01-01
      new Date(2026, 0, 2), // 2026-01-02
      new Date(2026, 0, 3), // 2026-01-03
    ]);
  });

  it('연도의 첫날짜에 대하여 연도를 넘어가는 주의 날짜 배열을 반환한다', () => {
    const yearFirstday = new Date(2026, 0, 1); // 2026-01-01

    expect(getWeekDates(yearFirstday)).toEqual([
      new Date(2025, 11, 28), // 2025-12-28
      new Date(2025, 11, 29), // 2025-12-29
      new Date(2025, 11, 30), // 2025-12-30
      new Date(2025, 11, 31), // 2025-12-31
      new Date(2026, 0, 1), // 2026-01-01
      new Date(2026, 0, 2), // 2026-01-02
      new Date(2026, 0, 3), // 2026-01-03
    ]);
  });

  it('윤년의 2월 29일에 대하여 포함한 주의 날짜 배열을 반환한다.', () => {
    const leapYearFebLastDay = new Date(2000, 1, 29); // 2000-02-29

    expect(getWeekDates(leapYearFebLastDay)).toEqual([
      new Date(2000, 1, 27), // 2000-02-27
      new Date(2000, 1, 28), // 2000-02-28
      new Date(2000, 1, 29), // 2000-02-29
      new Date(2000, 2, 1), // 2000-03-01
      new Date(2000, 2, 2), // 2000-03-02
      new Date(2000, 2, 3), // 2000-03-03
      new Date(2000, 2, 4), // 2000-03-04
    ]);
  });

  it('월의 마지막 날짜에 대하여 포함한 주의 날짜 배열을 반환한다.', () => {
    const monthLastDay = new Date(2025, 5, 30); // 2025-06-30

    expect(getWeekDates(monthLastDay)).toEqual([
      new Date(2025, 5, 29), // 2025-06-29
      new Date(2025, 5, 30), // 2025-06-30
      new Date(2025, 6, 1), // 2025-07-01
      new Date(2025, 6, 2), // 2025-07-02
      new Date(2025, 6, 3), // 2025-07-03
      new Date(2025, 6, 4), // 2025-07-04
      new Date(2025, 6, 5), // 2025-08-05
    ]);
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일을 입력했을 떄 2025년 7월의 주별 날짜 정보를 2차원 배열로 반환해야 한다', () => {
    const date = new Date(2025, 6, 1); // 2025-07-01

    expect(getWeeksAtMonth(date)).toEqual([
      [null, null, 1, 2, 3, 4, 5],
      [6, 7, 8, 9, 10, 11, 12],
      [13, 14, 15, 16, 17, 18, 19],
      [20, 21, 22, 23, 24, 25, 26],
      [27, 28, 29, 30, 31, null, null],
    ]);
  });
});

describe('getEventsForDay', () => {
  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {});

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {});

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {});

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {});
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {});

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {});

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {});

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {});

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {});

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {});
});

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {});
});

describe('isDateInRange', () => {
  it('범위 내의 날짜 2025-07-10에 대해 true를 반환한다', () => {});

  it('범위의 시작일 2025-07-01에 대해 true를 반환한다', () => {});

  it('범위의 종료일 2025-07-31에 대해 true를 반환한다', () => {});

  it('범위 이전의 날짜 2025-06-30에 대해 false를 반환한다', () => {});

  it('범위 이후의 날짜 2025-08-01에 대해 false를 반환한다', () => {});

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {});
});

describe('fillZero', () => {
  it("5를 2자리로 변환하면 '05'를 반환한다", () => {});

  it("10을 2자리로 변환하면 '10'을 반환한다", () => {});

  it("3을 3자리로 변환하면 '003'을 반환한다", () => {});

  it("100을 2자리로 변환하면 '100'을 반환한다", () => {});

  it("0을 2자리로 변환하면 '00'을 반환한다", () => {});

  it("1을 5자리로 변환하면 '00001'을 반환한다", () => {});

  it("소수점이 있는 3.14를 5자리로 변환하면 '03.14'를 반환한다", () => {});

  it('size 파라미터를 생략하면 기본값 2를 사용한다', () => {});

  it('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {});
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {});

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {});

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {});

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {});
});
