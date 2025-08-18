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
  const eventCases: Partial<Event>[] = [ 
    { id: '1', title: 'A', date: '2025-10-01'},
    { id: '2', title: 'B', date: '2025-10-01'},
    { id: '3', title: 'C', date: '2025-11-16'},
    { id: '4', title: 'D', date: '2025-11-17'},
  ]


  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const result = getEventsForDay(eventCases as Event[], 1);
    expect(result).toStrictEqual([eventCases[0], eventCases[1]]);
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const dates = events.map((events) => new Date(events.date).getDate());
    const array: number[] = [...Array(31)].map((_, i) => i + 1);

    const removeSet = new Set(dates);
    const removedArray = array.filter(item => !removeSet.has(item));

    const param = Math.floor(Math.random() * removedArray.length)

    const result = getEventsForDay(events as Event[], param);

    expect(result).toEqual([]);
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

  const startDate = new Date('2025-07-01');
  const endDate = new Date('2025-07-31');

  it('범위 내의 날짜 2025-07-10에 대해 true를 반환한다', () => {
    const testDate = new Date('2025-07-10');
    const result = isDateInRange(testDate, startDate, endDate);
    expect(result).toBe(true);
  });

  it('범위의 시작일 2025-07-01에 대해 true를 반환한다', () => {
    const testDate = new Date('2025-07-01');
    const result = isDateInRange(testDate, startDate, endDate);
    expect(result).toBe(true);
  });

  it('범위의 종료일 2025-07-31에 대해 true를 반환한다', () => {
    const testDate = new Date('2025-07-31');
    const result = isDateInRange(testDate, startDate, endDate);
    expect(result).toBe(true);
  });

  it('범위 이전의 날짜 2025-06-30에 대해 false를 반환한다', () => {
    const testDate = new Date('2025-06-30');
    const result = isDateInRange(testDate, startDate, endDate);
    expect(result).toBe(false);
  });

  it('범위 이후의 날짜 2025-08-01에 대해 false를 반환한다', () => {
    const testDate = new Date('2025-08-01');
    const result = isDateInRange(testDate, startDate, endDate);
    expect(result).toBe(false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const testDate = new Date('2025-07-01');
    const result = isDateInRange(testDate, endDate, startDate);
    expect(result).toBe(false);
  });
});

describe('fillZero', () => {
  
  const cases = [
    {input: 5, formatted: '05', size: 2},
    {input: 10, formatted: '10', size: 2},
    {input: 3, formatted: '003', size: 3},
    {input: 100, formatted: '100', size: 2},
    {input: 0, formatted: '00', size: 2},
    {input: 1, formatted: '00001', size: 5},
    {input: 3.14, formatted: '03.14', size: 5},
    {input: 7, formatted: '07'},
    {input: 10000, formatted: '10000', size: 3},

  ]

  it("5를 2자리로 변환하면 '05'를 반환한다", () => {
    const { input, formatted, size } = cases[0];
    const result = fillZero(input, size);
    expect(result).toEqual(formatted);
  });

  it("10을 2자리로 변환하면 '10'을 반환한다", () => {
    const { input, formatted, size } = cases[1];
    const result = fillZero(input, size);
    expect(result).toEqual(formatted);
  });

  it("3을 3자리로 변환하면 '003'을 반환한다", () => {
    const { input, formatted, size } = cases[2];
    const result = fillZero(input, size);
    expect(result).toEqual(formatted);
  });

  it("100을 2자리로 변환하면 '100'을 반환한다", () => {
    const { input, formatted, size } = cases[3];
    const result = fillZero(input, size);
    expect(result).toEqual(formatted);
  });

  it("0을 2자리로 변환하면 '00'을 반환한다", () => {
    const { input, formatted, size } = cases[4];
    const result = fillZero(input, size);
    expect(result).toEqual(formatted);
  });

  it("1을 5자리로 변환하면 '00001'을 반환한다", () => {
    const { input, formatted, size } = cases[5];
    const result = fillZero(input, size);
    expect(result).toEqual(formatted);
  });

  it("소수점이 있는 3.14를 5자리로 변환하면 '03.14'를 반환한다", () => {
    const { input, formatted, size } = cases[6]
    const result = fillZero(input, size);
    expect(result).toEqual(formatted);
  });

  it('size 파라미터를 생략하면 기본값 2를 사용한다', () => {
    const { input, formatted, size } = cases[7]
    const result = fillZero(input, size);
    expect(result).toEqual(formatted);
  });

  it('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    const { input, formatted, size } = cases[8]
    const result = fillZero(input, size);
    expect(result).toEqual(formatted);
  });
});

describe('formatDate', () => {
  const cases = [
      { input: new Date('2024-01-1'), formatted: '2024-01-01' },
      { input: new Date('2024/12/31'), formatted: '2024-12-31' },
      { input: new Date('2024/2/29'), formatted: '2024-02-29' },
      { input: new Date('2023.06.15'), formatted: '2023-06-15' }
    ];
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    cases.forEach(({ input, formatted }) => {
      expect(formatDate(input)).toBe(formatted);
    });
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    const day = 15;
    const date = new Date('2024/2/29');
    const result = formatDate(date, day);

    expect(result).toBe('2024-02-15');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const {input ,formatted} = cases[2];
    expect(formatDate(input)).toBe(formatted);
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
     const {input ,formatted} = cases[0];
     expect(formatDate(input)).toBe(formatted);
  });
});
