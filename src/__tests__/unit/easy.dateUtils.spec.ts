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
import { createEvents } from '../eventFactory';

describe('getDaysInMonth', () => {
  it('1월은 31일 수를 반환한다', () => {
    const year = 2025;
    const month = 1;
    const expected = 31;

    const result = getDaysInMonth(year, month);

    expect(result).toBe(expected);
  });

  it('4월은 30일 일수를 반환한다', () => {
    const year = 2025;
    const month = 4;
    const expected = 30;

    const result = getDaysInMonth(year, month);

    expect(result).toBe(expected);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    const year = 2024;  // 윤년
    const month = 2;
    const expected = 29;

    const result = getDaysInMonth(year, month);

    expect(result).toBe(expected);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    const year = 2025;  // 평년
    const month = 2;
    const expected = 28;

    const result = getDaysInMonth(year, month);

    expect(result).toBe(expected);
  });

  it('유효하지 않은 월에 대해 적절히 처리한다', () => {
    const testCases = [
      { year: 2025, month: 13, expected: 31 },  // 13 = 1월
      { year: 2025, month: 0, expected: 31 },  // 0 = 12월
      { year: 2025, month: -1, expected: 30 },  // -1 = 11월
    ];

    testCases.forEach(({ year, month, expected }) => {
      const result = getDaysInMonth(year, month);
      expect(result).toBe(expected);
    });
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date('2025-08-20'); // 2025.08.20 수
    const result = getWeekDates(date).map((date) => date.getDate());

    const expected = [17, 18, 19, 20, 21, 22, 23];

    expect(result).toEqual(expected);
  });

  it('월요일에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date('2025-08-18'); // 2025.08.18 월
    const result = getWeekDates(date).map((date) => date.getDate());
    
    const expected = [17, 18, 19, 20, 21, 22, 23];

    expect(result).toEqual(expected);
  });

  it('일요일에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date('2025-08-17'); // 2025.08.17 일
    const result = getWeekDates(date).map((date) => date.getDate());
    
    const expected = [17, 18, 19, 20, 21, 22, 23];

    expect(result).toEqual(expected);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const date = new Date('2025-12-31'); // 2025.12.31 수
    const expected = [
      new Date('2025-12-28'), // 2025.12.28 일
      new Date('2025-12-29'), // 2025.12.29 월
      new Date('2025-12-30'), // 2025.12.30 화
      new Date('2025-12-31'), // 2025.12.31 수
      new Date('2026-01-01'), // 2026.01.01 목
      new Date('2026-01-02'), // 2026.01.02 금
      new Date('2026-01-03'), // 2026.01.03 토
    ];

    const result = getWeekDates(date);

    expect(result).toEqual(expected);
    expect(result).toHaveLength(7);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const date = new Date('2026-01-01'); // 2026.01.01 목
    const expected = [
      new Date('2025-12-28'), // 2025.12.28 일
      new Date('2025-12-29'), // 2025.12.29 월
      new Date('2025-12-30'), // 2025.12.30 화
      new Date('2025-12-31'), // 2025.12.31 수
      new Date('2026-01-01'), // 2026.01.01 목
      new Date('2026-01-02'), // 2026.01.02 금
      new Date('2026-01-03'), // 2026.01.03 토
    ];

    const result = getWeekDates(date);

    expect(result).toEqual(expected);
    expect(result).toHaveLength(7);
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const date = new Date('2024-02-29'); // 2024.02.29 목
    const expected = [
      new Date('2024-02-25'), // 2024.02.25 일
      new Date('2024-02-26'), // 2024.02.26 월
      new Date('2024-02-27'), // 2024.02.27 화
      new Date('2024-02-28'), // 2024.02.28 수
      new Date('2024-02-29'), // 2024.02.29 목
      new Date('2024-03-01'), // 2024.03.01 금
      new Date('2024-03-02'), // 2024.03.02 토
    ];

    const result = getWeekDates(date);

    expect(result).toEqual(expected);
    expect(result).toHaveLength(7);
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const date = new Date('2025-08-31'); // 2025.08.31 일
    const expected = [
      new Date('2025-08-31'), // 2025.08.31 일
      new Date('2025-09-01'), // 2025.09.01 월
      new Date('2025-09-02'), // 2025.09.02 화
      new Date('2025-09-03'), // 2025.09.03 수
      new Date('2025-09-04'), // 2025.09.04 목
      new Date('2025-09-05'), // 2025.09.05 금
      new Date('2025-09-06'), // 2025.09.06 토
    ];

    const result = getWeekDates(date);

    expect(result).toEqual(expected);
    expect(result).toHaveLength(7);
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const date = new Date('2025-07-01');
    const expected = [
      [null, null, 1, 2, 3, 4, 5],
      [6, 7, 8, 9, 10, 11, 12],
      [13, 14, 15, 16, 17, 18, 19],
      [20, 21, 22, 23, 24, 25, 26],
      [27, 28, 29, 30, 31, null, null],
    ];

    const result = getWeeksAtMonth(date);

    expect(result).toEqual(expected);
    expect(result).toHaveLength(5);
    expect(result[0]).toHaveLength(7);
  });
});

describe('getEventsForDay', () => {
  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const events: Event[] = createEvents([
      { date: '2025-08-01' },
      { date: '2025-08-02' },
    ]);
  
    const date = new Date('2025-08-01');
    const expected: Event[] = events.filter((event) => event.date === '2025-08-01');

    const result = getEventsForDay(events, date.getDate());

    expect(result).toEqual(expected);
    expect(result).toHaveLength(expected.length);
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const events: Event[] = createEvents([
      { date: '2025-08-01' },
    ]);

    const date = new Date('2025-08-02');
    const expected: Event[] = [];

    const result = getEventsForDay(events, date.getDate());

    expect(result).toEqual(expected);
    expect(result).toHaveLength(expected.length);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const events: Event[] = createEvents([
      { date: '2025-08-01' },
    ]);

    const date = new Date('2025-08-00');
    const expected: Event[] = [];

    const result = getEventsForDay(events, date.getDate());

    expect(result).toEqual(expected);
    expect(result).toHaveLength(0);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const events: Event[] = createEvents([
      { date: '2025-08-01' },
    ]);

    const date = new Date('2025-08-32');
    const expected: Event[] = [];

    const result = getEventsForDay(events, date.getDate());

    expect(result).toEqual(expected);
    expect(result).toHaveLength(0);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-08-20');
    const expected = '2025년 8월 3주';

    const result = formatWeek(date);

    expect(result).toBe(expected);
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-08-03');
    const expected = '2025년 8월 1주';

    const result = formatWeek(date);

    expect(result).toBe(expected);
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-08-30');
    const expected = '2025년 8월 4주';

    const result = formatWeek(date);

    expect(result).toBe(expected);
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-12-31');
    const expected = '2026년 1월 1주';

    const result = formatWeek(date);

    expect(result).toBe(expected);
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2024-02-29');
    const expected = '2024년 2월 5주';

    const result = formatWeek(date);

    expect(result).toBe(expected);
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-02-28');
    const expected = '2025년 2월 4주';

    const result = formatWeek(date);

    expect(result).toBe(expected);
  });
});

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    const date = new Date('2025-07-10');
    const expected = '2025년 7월';

    const result = formatMonth(date);

    expect(result).toBe(expected);
  });
});

describe('isDateInRange', () => {
  it('범위 내의 날짜 2025-07-10에 대해 true를 반환한다', () => {
    const date = new Date('2025-07-10');
    const rangeStart = new Date('2025-07-01');
    const rangeEnd = new Date('2025-07-31');
    const expected = true;

    const result = isDateInRange(date, rangeStart, rangeEnd);

    expect(result).toBe(expected);
  });

  it('범위의 시작일 2025-07-01에 대해 true를 반환한다', () => {
    const date = new Date('2025-07-01');
    const rangeStart = new Date('2025-07-01');
    const rangeEnd = new Date('2025-07-31');
    const expected = true;

    const result = isDateInRange(date, rangeStart, rangeEnd);

    expect(result).toBe(expected);
  });

  it('범위의 종료일 2025-07-31에 대해 true를 반환한다', () => {
    const date = new Date('2025-07-31');
    const rangeStart = new Date('2025-07-01');
    const rangeEnd = new Date('2025-07-31');
    const expected = true;

    const result = isDateInRange(date, rangeStart, rangeEnd);

    expect(result).toBe(expected);
  });

  it('범위 이전의 날짜 2025-06-30에 대해 false를 반환한다', () => {
    const date = new Date('2025-06-30');
    const rangeStart = new Date('2025-07-01');
    const rangeEnd = new Date('2025-07-31');
    const expected = false;

    const result = isDateInRange(date, rangeStart, rangeEnd);

    expect(result).toBe(expected);
  });

  it('범위 이후의 날짜 2025-08-01에 대해 false를 반환한다', () => {
    const date = new Date('2025-08-01');
    const rangeStart = new Date('2025-07-01');
    const rangeEnd = new Date('2025-07-31');
    const expected = false;

    const result = isDateInRange(date, rangeStart, rangeEnd);

    expect(result).toBe(expected);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const date = new Date('2025-07-01');
    const rangeStart = new Date('2025-07-31');
    const rangeEnd = new Date('2025-07-01');
    const expected = false;

    const result = isDateInRange(date, rangeStart, rangeEnd);

    expect(result).toBe(expected);
  });
});

describe('fillZero', () => {
  it("5를 2자리로 변환하면 '05'를 반환한다", () => {
    const value = 5;
    const expected = '05';

    const result = fillZero(value, 2);

    expect(result).toBe(expected);
  });

  it("10을 2자리로 변환하면 '10'을 반환한다", () => {
    const value = 10;
    const expected = '10';

    const result = fillZero(value, 2);

    expect(result).toBe(expected);
  });

  it("3을 3자리로 변환하면 '003'을 반환한다", () => {
    const value = 3;
    const expected = '003';

    const result = fillZero(value, 3);

    expect(result).toBe(expected);
  });

  it("100을 2자리로 변환하면 '100'을 반환한다", () => {
    const value = 100;
    const expected = '100';

    const result = fillZero(value, 3);

    expect(result).toBe(expected);
  });

  it("0을 2자리로 변환하면 '00'을 반환한다", () => {
    const value = 0;
    const expected = '00';

    const result = fillZero(value, 2);

    expect(result).toBe(expected);
  });

  it("1을 5자리로 변환하면 '00001'을 반환한다", () => {
    const value = 1;
    const expected = '00001';

    const result = fillZero(value, 5);

    expect(result).toBe(expected);
  });

  it("소수점이 있는 3.14를 5자리로 변환하면 '03.14'를 반환한다", () => {
    const value = 3.14;
    const expected = '03.14';

    const result = fillZero(value, 5);

    expect(result).toBe(expected);
  });

  it('size 파라미터를 생략하면 기본값 2를 사용한다', () => {
    const value = 1;
    const expected = '01';

    const result = fillZero(value);

    expect(result).toBe(expected);
  });

  it('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    const value = 12345;
    const expected = '12345';

    const result = fillZero(value, 3);

    expect(result).toBe(expected);
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    const date = new Date('2025-08-20');
    const expected = '2025-08-20';

    const result = formatDate(date);

    expect(result).toBe(expected);
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    const date = new Date('2025-08-20');
    const expected = '2025-08-30';

    const result = formatDate(date, 30);

    expect(result).toBe(expected);
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const date = new Date('2025-08-20');
    const expected = '2025-08-20';

    const result = formatDate(date);

    expect(result).toBe(expected);
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const date = new Date('2025-08-02');
    const expected = '2025-08-02';

    const result = formatDate(date);

    expect(result).toBe(expected);
  });
});
