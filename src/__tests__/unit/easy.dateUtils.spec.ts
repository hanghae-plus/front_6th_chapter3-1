import { expect } from 'vitest';

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
    const days = getDaysInMonth(2025, 1);
    expect(days).toBe(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    const days = getDaysInMonth(2025, 4);
    expect(days).toBe(30);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    const leapYearDays = getDaysInMonth(2024, 2);
    expect(leapYearDays).toBe(29);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    const commonYearDays = getDaysInMonth(2025, 2);
    expect(commonYearDays).toBe(28);
  });

  it('유효하지 않은 월에 대해 적절히 처리한다', () => {
    const invalidDays = getDaysInMonth(2025, 0);
    expect(invalidDays).toBe(31);
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const wednesday = new Date('2025-08-20');
    const weekDates = getWeekDates(wednesday);

    expect(weekDates).length(7);
    expect(weekDates).toEqual([
      new Date('2025-08-17'),
      new Date('2025-08-18'),
      new Date('2025-08-19'),
      new Date('2025-08-20'),
      new Date('2025-08-21'),
      new Date('2025-08-22'),
      new Date('2025-08-23'),
    ]);
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const monday = new Date('2025-8-17');
    const weekDates = getWeekDates(monday);

    expect(weekDates).length(7);
    expect(weekDates).toEqual([
      new Date('2025-08-17'),
      new Date('2025-08-18'),
      new Date('2025-08-19'),
      new Date('2025-08-20'),
      new Date('2025-08-21'),
      new Date('2025-08-22'),
      new Date('2025-08-23'),
    ]);
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const sunday = new Date('2025-08-23');
    const weekDates = getWeekDates(sunday);

    expect(weekDates).length(7);
    expect(weekDates).toEqual([
      new Date('2025-08-17'),
      new Date('2025-08-18'),
      new Date('2025-08-19'),
      new Date('2025-08-20'),
      new Date('2025-08-21'),
      new Date('2025-08-22'),
      new Date('2025-08-23'),
    ]);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const lastDayOfYear = new Date('2025-12-31');
    const weekDates = getWeekDates(lastDayOfYear);

    expect(weekDates).length(7);
    expect(weekDates).toEqual([
      new Date('2025-12-28'),
      new Date('2025-12-29'),
      new Date('2025-12-30'),
      new Date('2025-12-31'),
      new Date('2026-01-01'),
      new Date('2026-01-02'),
      new Date('2026-01-03'),
    ]);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const firstDayOfYear = new Date('2026-01-01');
    const weekDates = getWeekDates(firstDayOfYear);

    expect(weekDates).length(7);
    expect(weekDates).toEqual([
      new Date('2025-12-28'),
      new Date('2025-12-29'),
      new Date('2025-12-30'),
      new Date('2025-12-31'),
      new Date('2026-01-01'),
      new Date('2026-01-02'),
      new Date('2026-01-03'),
    ]);
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const leapYear = new Date('2024-02-29');
    const weekDates = getWeekDates(leapYear);

    expect(weekDates).length(7);
    expect(weekDates).toEqual([
      new Date('2024-02-25'),
      new Date('2024-02-26'),
      new Date('2024-02-27'),
      new Date('2024-02-28'),
      new Date('2024-02-29'),
      new Date('2024-03-01'),
      new Date('2024-03-02'),
    ]);
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const lastDayOfMonth = new Date('2025-08-31');
    const weekDates = getWeekDates(lastDayOfMonth);

    expect(weekDates).length(7);
    expect(weekDates).toEqual([
      new Date('2025-08-31'),
      new Date('2025-09-01'),
      new Date('2025-09-02'),
      new Date('2025-09-03'),
      new Date('2025-09-04'),
      new Date('2025-09-05'),
      new Date('2025-09-06'),
    ]);
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const date = new Date('2025-07-01');
    const weeks = getWeeksAtMonth(date);

    expect(weeks).toEqual([
      [null, null, 1, 2, 3, 4, 5],
      [6, 7, 8, 9, 10, 11, 12],
      [13, 14, 15, 16, 17, 18, 19],
      [20, 21, 22, 23, 24, 25, 26],
      [27, 28, 29, 30, 31, null, null],
    ]);
  });
});

const sampleEvents: Event[] = [
  {
    id: '1',
    title: '기존 회의',
    date: '2025-10-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '기존 회의',
    date: '2025-10-1',
    startTime: '09:00',
    endTime: '11:00',
    description: '기존 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

describe('getEventsForDay', () => {
  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const filteredEvents = getEventsForDay(sampleEvents, 1);

    expect(filteredEvents).toEqual([
      {
        id: '2',
        title: '기존 회의',
        date: '2025-10-1',
        startTime: '09:00',
        endTime: '11:00',
        description: '기존 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const filteredEvents = getEventsForDay(sampleEvents, 10);

    expect(filteredEvents).toEqual([]);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const filteredEvents = getEventsForDay(sampleEvents, 0);

    expect(filteredEvents).toEqual([]);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const filteredEvents = getEventsForDay(sampleEvents, 32);

    expect(filteredEvents).toEqual([]);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-08-15');
    const weekNumber = formatWeek(date);

    expect(weekNumber).toBe('2025년 8월 2주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-08-01');
    const weekNumber = formatWeek(date);

    expect(weekNumber).toBe('2025년 7월 5주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-08-31');
    const weekNumber = formatWeek(date);

    expect(weekNumber).toBe('2025년 9월 1주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-01-01');
    const weekNumber = formatWeek(date);

    expect(weekNumber).toBe('2025년 1월 1주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const leapYearOfDate = new Date('2024-02-29');
    const weekNumber = formatWeek(leapYearOfDate);

    expect(weekNumber).toBe('2024년 2월 5주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const commonYearOfDate = new Date('2025-02-29');
    const weekNumber = formatWeek(commonYearOfDate);

    expect(weekNumber).toBe('2025년 2월 4주');
  });
});

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    const yearMonth = new Date('2025-07-10');
    const formattedMonth = formatMonth(yearMonth);

    expect(formattedMonth).toBe('2025년 7월');
  });
});

describe('isDateInRange', () => {
  it('범위 내의 날짜 2025-07-10에 대해 true를 반환한다', () => {
    const date = new Date('2025-07-10');
    const rangeStart = new Date('2025-07-01');
    const rangeEnd = new Date('2025-07-31');

    const isInRangeResult = isDateInRange(date, rangeStart, rangeEnd);

    expect(isInRangeResult).toBe(true);
  });

  it('범위의 시작일 2025-07-01에 대해 true를 반환한다', () => {
    const date = new Date('2025-07-10');
    const rangeStart = new Date('2025-07-01');
    const rangeEnd = new Date('2025-07-31');

    const isInRangeResult = isDateInRange(date, rangeStart, rangeEnd);

    expect(isInRangeResult).toBe(true);
  });

  it('범위의 종료일 2025-07-31에 대해 true를 반환한다', () => {
    const date = new Date('2025-07-10');
    const rangeStart = new Date('2025-07-01');
    const rangeEnd = new Date('2025-07-31');

    const isInRangeResult = isDateInRange(date, rangeStart, rangeEnd);

    expect(isInRangeResult).toBe(true);
  });

  it('범위 이전의 날짜 2025-06-30에 대해 false를 반환한다', () => {
    const date = new Date('2025-06-30');
    const rangeStart = new Date('2025-07-01');
    const rangeEnd = new Date('2025-07-31');

    const isInRangeResult = isDateInRange(date, rangeStart, rangeEnd);

    expect(isInRangeResult).toBe(false);
  });

  it('범위 이후의 날짜 2025-08-01에 대해 false를 반환한다', () => {
    const date = new Date('2025-08-01');
    const rangeStart = new Date('2025-07-01');
    const rangeEnd = new Date('2025-07-31');

    const isInRangeResult = isDateInRange(date, rangeStart, rangeEnd);

    expect(isInRangeResult).toBe(false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const date = new Date('2025-07-10');
    const rangeStart = new Date('2025-07-31');
    const rangeEnd = new Date('2025-07-01');

    const isInRangeResult = isDateInRange(date, rangeStart, rangeEnd);

    expect(isInRangeResult).toBe(false);
  });
});

describe('fillZero', () => {
  it("5를 2자리로 변환하면 '05'를 반환한다", () => {
    const five = 5;
    const twoDigit = fillZero(five);

    expect(twoDigit).toBe('05');
  });

  it("10을 2자리로 변환하면 '10'을 반환한다", () => {
    const ten = 10;
    const twoDigit = fillZero(ten);

    expect(twoDigit).toBe('10');
  });

  it("3을 3자리로 변환하면 '003'을 반환한다", () => {
    const three = 3;
    const threeDigit = fillZero(three, 3);

    expect(threeDigit).toBe('003');
  });

  it("100을 2자리로 변환하면 '100'을 반환한다", () => {
    const hundred = 100;
    const threeDigit = fillZero(hundred);

    expect(threeDigit).toBe('100');
  });

  it("0을 2자리로 변환하면 '00'을 반환한다", () => {
    const zero = 0;
    const twoDigit = fillZero(zero);

    expect(twoDigit).toBe('00');
  });

  it("1을 5자리로 변환하면 '00001'을 반환한다", () => {
    const one = 1;
    const fiveDigit = fillZero(one, 5);

    expect(fiveDigit).toBe('00001');
  });

  it("소수점이 있는 3.14를 5자리로 변환하면 '03.14'를 반환한다", () => {
    const pie = 3.14;
    const fiveDigit = fillZero(pie, 5);

    expect(fiveDigit).toBe('03.14');
  });

  it('size 파라미터를 생략하면 기본값 2를 사용한다', () => {
    const one = 1;
    const twoDigit = fillZero(one);

    expect(twoDigit).toBe('01');
  });

  it('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    const oneHundred = 100;
    const threeDigit = fillZero(oneHundred, 2);

    expect(threeDigit).toBe('100');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    const date = new Date('2025-08-19');
    const formattedDate = formatDate(date);

    expect(formattedDate).toBe('2025-08-19');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    const date = new Date('2025-08-19');
    const formattedDate = formatDate(date, 30);

    expect(formattedDate).toBe('2025-08-30');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const date = new Date('2025-01-19');
    const formattedDate = formatDate(date);

    expect(formattedDate).toBe('2025-01-19');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const date = new Date('2025-01-01');
    const formattedDate = formatDate(date);

    expect(formattedDate).toBe('2025-01-01');
  });
});
