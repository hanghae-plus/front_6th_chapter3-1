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
    const result = getDaysInMonth(2025, 1);

    expect(result).toBe(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    const result = getDaysInMonth(2025, 4);

    expect(result).toBe(30);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    const isLeayYear = (year: number) => {
      if (year % 400 === 0) return true; // 400년마다 윤년
      if (year % 100 === 0) return false; // 100년마다 평년
      if (year % 4 === 0) return true; // 4년마다 윤년
      return false;
    };

    const leapYears = Array.from({ length: 41 })
      .map((_, i) => i + 2000)
      .filter((year) => isLeayYear(year));

    leapYears.forEach((year) => {
      const result = getDaysInMonth(year, 2);
      expect(result).toBe(29);
    });
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    const result = getDaysInMonth(2025, 2);
    expect(result).toBe(28);
  });

  it('유효하지 않은 월에 대해 적절히 처리한다', () => {
    const testCase = [
      { input: { year: 2025, month: -1 }, expected: 30 },
      { input: { year: 2025, month: 0 }, expected: 31 },
      { input: { year: 2025, month: 14 }, expected: 28 },
    ];

    testCase.forEach((testCase) => {
      const { input, expected } = testCase;
      const result = getDaysInMonth(input.year, input.month);

      expect(result).toBe(expected);
    });
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const wednesDay = new Date(2025, 7, 20);

    const result = getWeekDates(wednesDay).map(
      (date) =>
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    );

    const expected = [
      '2025-08-17',
      '2025-08-18',
      '2025-08-19',
      '2025-08-20',
      '2025-08-21',
      '2025-08-22',
      '2025-08-23',
    ];

    expect(result).toEqual(expected);
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const monday = new Date(2025, 7, 18);

    const result = getWeekDates(monday).map(
      (date) =>
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    );

    const expected = [
      '2025-08-17',
      '2025-08-18',
      '2025-08-19',
      '2025-08-20',
      '2025-08-21',
      '2025-08-22',
      '2025-08-23',
    ];

    expect(result).toEqual(expected);
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const sunday = new Date(2025, 7, 23);

    const result = getWeekDates(sunday).map(
      (date) =>
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    );

    const expected = [
      '2025-08-17',
      '2025-08-18',
      '2025-08-19',
      '2025-08-20',
      '2025-08-21',
      '2025-08-22',
      '2025-08-23',
    ];

    expect(result).toEqual(expected);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const lastDay = new Date(2025, 11, 31);

    const result = getWeekDates(lastDay).map(
      (date) =>
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    );

    const expected = [
      '2025-12-28',
      '2025-12-29',
      '2025-12-30',
      '2025-12-31',
      '2026-01-01',
      '2026-01-02',
      '2026-01-03',
    ];

    expect(result).toEqual(expected);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const startDay = new Date(2026, 0, 1);

    const result = getWeekDates(startDay).map(
      (date) =>
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    );

    const expected = [
      '2025-12-28',
      '2025-12-29',
      '2025-12-30',
      '2025-12-31',
      '2026-01-01',
      '2026-01-02',
      '2026-01-03',
    ];

    expect(result).toEqual(expected);
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const isLeapYear = (year: number) => {
      if (year % 400 === 0) return true;
      if (year % 100 === 0) return false;
      if (year % 4 === 0) return true;
      return false;
    };

    const leapYears = Array.from({ length: 41 })
      .map((_, i) => i + 2020)
      .filter((year) => isLeapYear(year));

    leapYears.forEach((year) => {
      const leapDay = new Date(year, 1, 29);
      const result = getWeekDates(leapDay).map(
        (date) =>
          `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      );
      const leapDayString = `${year}-02-29`;
      expect(result).toContain(leapDayString);
    });
  });

  it.each([
    {
      name: '1월 31일',
      input: new Date(2025, 0, 31),
      expected: [
        '2025-01-26',
        '2025-01-27',
        '2025-01-28',
        '2025-01-29',
        '2025-01-30',
        '2025-01-31',
        '2025-02-01',
      ],
    },
    {
      name: '2월 28일 (평년)',
      input: new Date(2025, 1, 28),
      expected: [
        '2025-02-23',
        '2025-02-24',
        '2025-02-25',
        '2025-02-26',
        '2025-02-27',
        '2025-02-28',
        '2025-03-01',
      ],
    },
  ])('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', (v) => {
    const result = getWeekDates(v.input).map(
      (date) =>
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    );

    expect(result).toEqual(v.expected);
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const currentDay = new Date(2025, 6, 1);

    const result = getWeeksAtMonth(currentDay);

    const expected = [
      [null, null, 1, 2, 3, 4, 5],
      [6, 7, 8, 9, 10, 11, 12],
      [13, 14, 15, 16, 17, 18, 19],
      [20, 21, 22, 23, 24, 25, 26],
      [27, 28, 29, 30, 31, null, null],
    ];

    expect(result).toEqual(expected);
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
