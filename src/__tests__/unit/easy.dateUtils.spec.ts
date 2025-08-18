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
  findNextLeapYear,
} from '../../utils/dateUtils';
import { events } from '../../__mocks__/response/events.json' assert { type: 'json' };

describe('getDaysInMonth', () => {
  const date = new Date();
  const year = date.getFullYear();
  const leapYear = findNextLeapYear(year);
  const feb = 2;

  it('1월은 31일 일수를 반환한다', () => {
    expect(getDaysInMonth(year, 1)).toBe(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    expect(getDaysInMonth(year, 4)).toBe(30);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    const days = getDaysInMonth(leapYear, feb);

    expect(days).toBe(29);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    const days = getDaysInMonth(year, feb);

    expect(days).toBe(28);
  });

  it('유효한 월을 검증한다.', () => {
    const formatDate = formatMonth(new Date());
    const replacedFormat = formatDate.replace(/[가-힣]/g, '/');

    const [_, monthStr] = replacedFormat.split('/');
    const month = parseInt(monthStr, 10);

    expect(month).toBeGreaterThanOrEqual(1);
    expect(month).toBeLessThanOrEqual(12);
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {});

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {});

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {});

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {});

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {});

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {});

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {});
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const firstDay = new Date('2025-07-01');
    const lastDay = new Date('2025-07-31');

    const monthWeeks = getWeeksAtMonth(firstDay);

    const originFirstWeekDays = getWeekDates(firstDay)
      .filter((date) => date.getMonth() === 6)
      .map((date) => date.getDate());

    const originLastWeekDays = getWeekDates(lastDay)
      .filter((date) => date.getMonth() === 6)
      .map((date) => date.getDate());

    const compareFirstWeekDays = monthWeeks[0].filter((date) => date !== null);
    const compareLastWeekDays = monthWeeks[monthWeeks.length - 1].filter((date) => date !== null);

    expect(originFirstWeekDays).toStrictEqual(compareFirstWeekDays);
    expect(originLastWeekDays).toStrictEqual(compareLastWeekDays);
  });
});

describe('getEventsForDay', () => {
  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {});

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const dates = events.map((events) => new Date(events.date).getDate());
    // TODO: 수정
    const array: number[] = [...Array(31)].map((_, i) => i + 1);

    const result = getEventsForDay(events as Event[], 3);

    expect(result).toStrictEqual([]);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(events as Event[], 0);

    expect(result).toStrictEqual([]);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const invalidDate = Math.floor(Math.random() * (100 - 32 + 1)) + 32;

    const result = getEventsForDay(events as Event[], invalidDate);

    expect(result).toStrictEqual([]);
  });
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
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    const param = new Date('2025년 7월 10일'.replace(/[가-힣]/g, '/'));
    const result = formatMonth(param);
    expect(result).toEqual('2025년 7월');
  });
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
