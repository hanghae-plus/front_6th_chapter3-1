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
import { expect } from 'vitest';

describe('getDaysInMonth', () => {
  it('1월은 31일 수를 반환한다', () => {
    const daysInMonth = getDaysInMonth(2025, 1);

    expect(daysInMonth).toBe(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    const daysInMonth = getDaysInMonth(2025, 4);

    expect(daysInMonth).toBe(30);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    const daysInMonth = getDaysInMonth(2024, 2);

    expect(daysInMonth).toBe(29);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    const daysInMonth = getDaysInMonth(2025, 2);

    expect(daysInMonth).toBe(28);
  });

  it('유효하지 않은 월에 대해 0을 반환한다.', () => {
    const daysInMonth = getDaysInMonth(2025, 0);

    expect(daysInMonth).toBe(0);
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const weekDates = getWeekDates(new Date('2025-08-20'));

    const expected = [
      new Date('2025-08-17').toDateString(),
      new Date('2025-08-18').toDateString(),
      new Date('2025-08-19').toDateString(),
      new Date('2025-08-20').toDateString(),
      new Date('2025-08-21').toDateString(),
      new Date('2025-08-22').toDateString(),
      new Date('2025-08-23').toDateString(),
    ];

    expect(weekDates.map((date) => date.toDateString())).toEqual(expected);
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const weekDates = getWeekDates(new Date('2025-08-18'));

    const expected = [
      new Date('2025-08-17').toDateString(),
      new Date('2025-08-18').toDateString(),
      new Date('2025-08-19').toDateString(),
      new Date('2025-08-20').toDateString(),
      new Date('2025-08-21').toDateString(),
      new Date('2025-08-22').toDateString(),
      new Date('2025-08-23').toDateString(),
    ];

    expect(weekDates.map((date) => date.toDateString())).toEqual(expected);
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const weekDates = getWeekDates(new Date('2025-08-17'));

    const expected = [
      new Date('2025-08-17').toDateString(),
      new Date('2025-08-18').toDateString(),
      new Date('2025-08-19').toDateString(),
      new Date('2025-08-20').toDateString(),
      new Date('2025-08-21').toDateString(),
      new Date('2025-08-22').toDateString(),
      new Date('2025-08-23').toDateString(),
    ];

    expect(weekDates.map((date) => date.toDateString())).toEqual(expected);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const weekDates = getWeekDates(new Date('2025-12-31'));

    const expected = [
      new Date('2025-12-28').toDateString(),
      new Date('2025-12-29').toDateString(),
      new Date('2025-12-30').toDateString(),
      new Date('2025-12-31').toDateString(),
      new Date('2026-01-01').toDateString(),
      new Date('2026-01-02').toDateString(),
      new Date('2026-01-03').toDateString(),
    ];

    expect(weekDates.map((date) => date.toDateString())).toEqual(expected);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const weekDates = getWeekDates(new Date('2025-01-01'));

    const expected = [
      new Date('2024-12-29').toDateString(),
      new Date('2024-12-30').toDateString(),
      new Date('2024-12-31').toDateString(),
      new Date('2025-01-01').toDateString(),
      new Date('2025-01-02').toDateString(),
      new Date('2025-01-03').toDateString(),
      new Date('2025-01-04').toDateString(),
    ];

    expect(weekDates.map((date) => date.toDateString())).toEqual(expected);
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const weekDates = getWeekDates(new Date('2024-02-29'));

    const expected = [
      new Date('2024-02-25').toDateString(),
      new Date('2024-02-26').toDateString(),
      new Date('2024-02-27').toDateString(),
      new Date('2024-02-28').toDateString(),
      new Date('2024-02-29').toDateString(),
      new Date('2024-03-01').toDateString(),
      new Date('2024-03-02').toDateString(),
    ];

    expect(weekDates.map((date) => date.toDateString())).toEqual(expected);
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const weekDates = getWeekDates(new Date('2025-08-31'));

    const expected = [
      new Date('2025-08-31').toDateString(),
      new Date('2025-09-01').toDateString(),
      new Date('2025-09-02').toDateString(),
      new Date('2025-09-03').toDateString(),
      new Date('2025-09-04').toDateString(),
      new Date('2025-09-05').toDateString(),
      new Date('2025-09-06').toDateString(),
    ];

    expect(weekDates.map((date) => date.toDateString())).toEqual(expected);
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const weeksAtMonth = getWeeksAtMonth(new Date('2025-07-01'));

    const expected = [
      [null, null, 1, 2, 3, 4, 5],
      [6, 7, 8, 9, 10, 11, 12],
      [13, 14, 15, 16, 17, 18, 19],
      [20, 21, 22, 23, 24, 25, 26],
      [27, 28, 29, 30, 31, null, null],
    ];

    expect(weeksAtMonth).toEqual(expected);
  });
});

describe('getEventsForDay', () => {
  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        date: '2025-08-01',
      },
      {
        id: '2',
        date: '2025-08-21',
      },
    ] as Event[];

    const result = getEventsForDay(events, 1);
    expect(result).toHaveLength(1);
    expect(result[0].date).toBe('2025-08-01');
    expect(result[0].id).toBe('1');
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        date: '2025-08-01',
      },
      {
        id: '2',
        date: '2025-08-21',
      },
    ] as Event[];

    const result = getEventsForDay(events, 2);
    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        date: '2025-08-01',
      },
      {
        id: '2',
        date: '2025-08-21',
      },
    ] as Event[];

    const result = getEventsForDay(events, 0);
    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        date: '2025-08-01',
      },
      {
        id: '2',
        date: '2025-08-31',
      },
    ] as Event[];

    const result = getEventsForDay(events, 32);

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const week = formatWeek(new Date('2025-08-15'));

    expect(week).toBe('2025년 8월 2주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const week = formatWeek(new Date('2025-08-01'));

    expect(week).toBe('2025년 7월 5주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const week = formatWeek(new Date('2025-08-31'));

    expect(week).toBe('2025년 9월 1주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const week = formatWeek(new Date('2025-01-01'));

    expect(week).toBe('2025년 1월 1주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const week = formatWeek(new Date('2024-02-29'));

    expect(week).toBe('2024년 2월 5주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const week = formatWeek(new Date('2025-02-29'));

    expect(week).toBe('2025년 2월 4주');
  });
});

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    const month = formatMonth(new Date('2025-07-10'));

    expect(month).toBe('2025년 7월');
  });
});

describe('isDateInRange', () => {
  it('범위 내의 날짜 2025-07-10에 대해 true를 반환한다', () => {
    const date = new Date('2025-07-10');
    const startDate = new Date('2025-07-01');
    const endDate = new Date('2025-07-31');

    const isInRange = isDateInRange(date, startDate, endDate);

    expect(isInRange).toBe(true);
  });

  it('범위의 시작일 2025-07-01에 대해 true를 반환한다', () => {
    const date = new Date('2025-07-01');
    const startDate = new Date('2025-07-01');
    const endDate = new Date('2025-07-31');

    const isInRange = isDateInRange(date, startDate, endDate);

    expect(isInRange).toBe(true);
  });

  it('범위의 종료일 2025-07-31에 대해 true를 반환한다', () => {
    const date = new Date('2025-07-31');
    const startDate = new Date('2025-07-01');
    const endDate = new Date('2025-07-31');

    const isInRange = isDateInRange(date, startDate, endDate);

    expect(isInRange).toBe(true);
  });

  it('범위 이전의 날짜 2025-06-30에 대해 false를 반환한다', () => {
    const date = new Date('2025-06-30');
    const startDate = new Date('2025-07-01');
    const endDate = new Date('2025-07-31');

    const isInRange = isDateInRange(date, startDate, endDate);

    expect(isInRange).toBe(false);
  });

  it('범위 이후의 날짜 2025-08-01에 대해 false를 반환한다', () => {
    const date = new Date('2025-08-01');
    const startDate = new Date('2025-07-01');
    const endDate = new Date('2025-07-31');

    const isInRange = isDateInRange(date, startDate, endDate);

    expect(isInRange).toBe(false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const date = new Date('2025-07-01');
    const startDate = new Date('2025-07-31');
    const endDate = new Date('2025-07-01');

    const isInRange = isDateInRange(date, startDate, endDate);

    expect(isInRange).toBe(false);
  });
});

describe('fillZero', () => {
  it("5를 2자리로 변환하면 '05'를 반환한다", () => {
    const filled = fillZero(5);

    expect(filled).toBe('05');
  });

  it("10을 2자리로 변환하면 '10'을 반환한다", () => {
    const filled = fillZero(10);

    expect(filled).toBe('10');
  });

  it("3을 3자리로 변환하면 '003'을 반환한다", () => {
    const filled = fillZero(3, 3);

    expect(filled).toBe('003');
  });

  it("100을 2자리로 변환하면 '100'을 반환한다", () => {
    const filled = fillZero(100);

    expect(filled).toBe('100');
  });

  it("0을 2자리로 변환하면 '00'을 반환한다", () => {
    const filled = fillZero(0);

    expect(filled).toBe('00');
  });

  it("1을 5자리로 변환하면 '00001'을 반환한다", () => {
    const filled = fillZero(1, 5);

    expect(filled).toBe('00001');
  });

  it("소수점이 있는 3.14를 5자리로 변환하면 '03.14'를 반환한다", () => {
    const filled = fillZero(3.14, 5);

    expect(filled).toBe('03.14');
  });

  it('size 파라미터를 생략하면 기본값 2를 사용한다', () => {
    const filled = fillZero(3);

    expect(filled).toBe('03');
  });

  it('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    const filled = fillZero(123456789, 5);

    expect(filled).toBe('123456789');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {});

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {});

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {});

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {});
});
