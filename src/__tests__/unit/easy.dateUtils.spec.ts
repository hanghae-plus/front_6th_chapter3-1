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
    const month = 1;
    const year = 2025;

    const result = getDaysInMonth(year, month);
    expect(result).toBe(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    const month = 4;
    const year = 2025;

    const result = getDaysInMonth(year, month);
    expect(result).toBe(30);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    const month = 2;
    const year = 2024;

    const result = getDaysInMonth(year, month);
    expect(result).toBe(29);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    const month = 2;
    const year = 2100;

    const result = getDaysInMonth(year, month);
    expect(result).toBe(28);
  });

  it('유효하지 않은 월(13월)을 입력하면 12월의 일수(31일)을 반환한다', () => {
    const month = 13;
    const year = 2025;

    const result = getDaysInMonth(year, month);
    expect(result).toBe(31);
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date('2025-08-20');
    const wed = getWeekDates(date);

    // 1. 7일인지 배열 길이 체크
    expect(wed).toHaveLength(7);

    // 2. 0~6번째 배열 반환 (일주일은 일요일부터)
    expect(wed[0]).toEqual(new Date('2025-08-17')); // 일요일
    expect(wed[1]).toEqual(new Date('2025-08-18')); // 월요일
    expect(wed[2]).toEqual(new Date('2025-08-19')); // 화요일
    expect(wed[3]).toEqual(new Date('2025-08-20')); // 수요일
    expect(wed[4]).toEqual(new Date('2025-08-21')); // 목요일
    expect(wed[5]).toEqual(new Date('2025-08-22')); // 금요일
    expect(wed[6]).toEqual(new Date('2025-08-23')); // 토요일
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date('2025-08-18');
    const mon = getWeekDates(date);

    // 1. 7일인지 배열 길이 체크
    expect(mon).toHaveLength(7);

    // 2. 0~6번째 배열 반환 (일주일은 일요일부터)
    expect(mon[0]).toEqual(new Date('2025-08-17')); // 일요일
    expect(mon[1]).toEqual(new Date('2025-08-18')); // 월요일
    expect(mon[2]).toEqual(new Date('2025-08-19')); // 화요일
    expect(mon[3]).toEqual(new Date('2025-08-20')); // 수요일
    expect(mon[4]).toEqual(new Date('2025-08-21')); // 목요일
    expect(mon[5]).toEqual(new Date('2025-08-22')); // 금요일
    expect(mon[6]).toEqual(new Date('2025-08-23')); // 토요일
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date('2025-08-17');
    const sun = getWeekDates(date);

    // 1. 7일인지 배열 길이 체크
    expect(sun).toHaveLength(7);

    // 2. 0~6번째 배열 반환 (일주일은 일요일부터)
    expect(sun[0]).toEqual(new Date('2025-08-17')); // 일요일
    expect(sun[1]).toEqual(new Date('2025-08-18')); // 월요일
    expect(sun[2]).toEqual(new Date('2025-08-19')); // 화요일
    expect(sun[3]).toEqual(new Date('2025-08-20')); // 수요일
    expect(sun[4]).toEqual(new Date('2025-08-21')); // 목요일
    expect(sun[5]).toEqual(new Date('2025-08-22')); // 금요일
    expect(sun[6]).toEqual(new Date('2025-08-23')); // 토요일
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const date = new Date('2025-12-31');
    const last = getWeekDates(date);

    // 1. 7일인지 배열 길이 체크
    expect(last).toHaveLength(7);

    // 2. 0~6번째 배열 반환 (일주일은 일요일부터)
    expect(last[0]).toEqual(new Date('2025-12-28')); // 일요일
    expect(last[1]).toEqual(new Date('2025-12-29')); // 월요일
    expect(last[2]).toEqual(new Date('2025-12-30')); // 화요일
    expect(last[3]).toEqual(new Date('2025-12-31')); // 수요일
    expect(last[4]).toEqual(new Date('2026-01-01')); // 목요일
    expect(last[5]).toEqual(new Date('2026-01-02')); // 금요일
    expect(last[6]).toEqual(new Date('2026-01-03')); // 토요일
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const date = new Date('2025-01-01');
    const first = getWeekDates(date);

    // 1. 7일인지 배열 길이 체크
    expect(first).toHaveLength(7);

    // 2. 0~6번째 배열 반환 (일주일은 일요일부터)
    expect(first[0]).toEqual(new Date('2024-12-29')); // 일요일
    expect(first[1]).toEqual(new Date('2024-12-30')); // 월요일
    expect(first[2]).toEqual(new Date('2024-12-31')); // 화요일
    expect(first[3]).toEqual(new Date('2025-01-01')); // 수요일
    expect(first[4]).toEqual(new Date('2025-01-02')); // 목요일
    expect(first[5]).toEqual(new Date('2025-01-03')); // 금요일
    expect(first[6]).toEqual(new Date('2025-01-04')); // 토요일
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const date = new Date('2024-02-29');
    const week = getWeekDates(date);

    // 1. 7일인지 배열 길이 체크
    expect(week).toHaveLength(7);

    // 2. 0~6번째 배열 반환 (일주일은 일요일부터)
    expect(week[0]).toEqual(new Date('2024-02-25')); // 일요일
    expect(week[1]).toEqual(new Date('2024-02-26')); // 월요일
    expect(week[2]).toEqual(new Date('2024-02-27')); // 화요일
    expect(week[3]).toEqual(new Date('2024-02-28')); // 수요일
    expect(week[4]).toEqual(new Date('2024-02-29')); // 목요일
    expect(week[5]).toEqual(new Date('2024-03-01')); // 금요일
    expect(week[6]).toEqual(new Date('2024-03-02')); // 토요일
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const date = new Date('2025-01-31');
    const week = getWeekDates(date);

    // 1. 7일인지 배열 길이 체크
    expect(week).toHaveLength(7);

    // 2. 0~6번째 배열 반환 (일주일은 일요일부터)
    expect(week[0]).toEqual(new Date('2025-01-26')); // 일요일
    expect(week[1]).toEqual(new Date('2025-01-27')); // 월요일
    expect(week[2]).toEqual(new Date('2025-01-28')); // 화요일
    expect(week[3]).toEqual(new Date('2025-01-29')); // 수요일
    expect(week[4]).toEqual(new Date('2025-01-30')); // 목요일
    expect(week[5]).toEqual(new Date('2025-01-31')); // 토요일
    expect(week[6]).toEqual(new Date('2025-02-01')); // 금요일
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const result = getWeeksAtMonth(new Date('2025-07-01'));
    expect(result).toEqual([
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
