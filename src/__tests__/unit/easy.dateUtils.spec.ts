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
import { factoriesEvents } from '../__fixture__/eventFactory.ts';

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
    const wednesday = new Date(2025, 7, 20);

    const expected = [
      '2025-08-17',
      '2025-08-18',
      '2025-08-19',
      '2025-08-20',
      '2025-08-21',
      '2025-08-22',
      '2025-08-23',
    ];

    expect(getWeekDates(wednesday).map((date) => date.toISOString().split('T')[0])).toEqual(
      expected
    );
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const monday = new Date(2025, 7, 18);
    const expected = [
      '2025-08-17',
      '2025-08-18',
      '2025-08-19',
      '2025-08-20',
      '2025-08-21',
      '2025-08-22',
      '2025-08-23',
    ];

    expect(getWeekDates(monday).map((date) => date.toISOString().split('T')[0])).toEqual(expected);
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const sunday = new Date(2025, 7, 23);
    const expected = [
      '2025-08-17',
      '2025-08-18',
      '2025-08-19',
      '2025-08-20',
      '2025-08-21',
      '2025-08-22',
      '2025-08-23',
    ];

    expect(getWeekDates(sunday).map((date) => date.toISOString().split('T')[0])).toEqual(expected);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const lastDay = new Date(2025, 11, 31);
    const expected = [
      '2025-12-28',
      '2025-12-29',
      '2025-12-30',
      '2025-12-31',
      '2026-01-01',
      '2026-01-02',
      '2026-01-03',
    ];
    expect(getWeekDates(lastDay).map((date) => date.toISOString().split('T')[0])).toEqual(expected);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const startDay = new Date(2026, 0, 1);

    const expected = [
      '2025-12-28',
      '2025-12-29',
      '2025-12-30',
      '2025-12-31',
      '2026-01-01',
      '2026-01-02',
      '2026-01-03',
    ];

    expect(getWeekDates(startDay).map((date) => date.toISOString().split('T')[0])).toEqual(
      expected
    );
  });

  // 이거 평일이든 윤년이든 그 해당하는 년도에 똑같이 처리된다고 느껴서 굳이 필요한가 싶어서 주석처리했습니다.
  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const expected = [
      '2024-02-25',
      '2024-02-26',
      '2024-02-27',
      '2024-02-28',
      '2024-02-29',
      '2024-03-01',
      '2024-03-02',
    ];

    expect(
      getWeekDates(new Date(2024, 1, 29)).map((date) => date.toISOString().split('T')[0])
    ).toEqual(expected);
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
    expect(getWeekDates(v.input).map((date) => date.toISOString().split('T')[0])).toEqual(
      v.expected
    );
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
  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const events = factoriesEvents;

    const result = getEventsForDay(events, 1);

    expect(result[0].title).toEqual('기존 회의');
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const emptyEvents = [] as Event[];

    const result = getEventsForDay(emptyEvents, 12);

    expect(result).toEqual([]);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const events = factoriesEvents;

    const result = getEventsForDay(events, 0);

    expect(result).toEqual([]);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const events = factoriesEvents;

    const result = getEventsForDay(events, 32);

    expect(result).toEqual([]);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    expect(formatWeek(new Date(2025, 0, 15))).toBe('2025년 1월 3주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    expect(formatWeek(new Date(2025, 0, 1))).toBe('2025년 1월 1주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    expect(formatWeek(new Date(2025, 6, 27))).toBe('2025년 7월 5주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    expect(formatWeek(new Date(2025, 11, 28))).toBe('2026년 1월 1주');
    expect(formatWeek(new Date(2026, 0, 2))).toBe('2026년 1월 1주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date(2025, 1, 29));
    expect(result).toBe('2025년 2월 4주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    expect(formatWeek(new Date(2025, 1, 28))).toBe('2025년 2월 4주');
  });
});

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    expect(formatMonth(new Date(2025, 6, 10))).toBe('2025년 7월');
  });
});

describe('isDateInRange', () => {
  it('범위 내의 날짜 2025-07-10에 대해 true를 반환한다', () => {
    const targetDate = new Date('2025-07-10');
    const startDate = new Date('2025-07-09');
    const endDate = new Date('2025-07-13');

    expect(isDateInRange(targetDate, startDate, endDate)).toBe(true);
  });

  it('범위의 시작일 2025-07-01에 대해 true를 반환한다', () => {
    const targetDate = new Date('2025-07-10');
    const startDate = new Date('2025-07-01');
    const endDate = new Date('2025-07-13');

    expect(isDateInRange(targetDate, startDate, endDate)).toBe(true);
  });

  it('범위의 종료일 2025-07-31에 대해 true를 반환한다', () => {
    const targetDate = new Date('2025-07-10');
    const startDate = new Date('2025-07-09');
    const endDate = new Date('2025-07-31');

    expect(isDateInRange(targetDate, startDate, endDate)).toBe(true);
  });

  it('범위 이전의 날짜 2025-06-30에 대해 false를 반환한다', () => {
    const targetDate = new Date('2025-06-30');
    const startDate = new Date('2025-06-09');
    const endDate = new Date('2025-06-29');

    expect(isDateInRange(targetDate, startDate, endDate)).toBe(false);
  });

  it('범위 이후의 날짜 2025-08-01에 대해 false를 반환한다', () => {
    const targetDate = new Date('2025-08-01');
    const startDate = new Date('2025-08-02');
    const endDate = new Date('2025-08-20');

    expect(isDateInRange(targetDate, startDate, endDate)).toBe(false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const targetDate = new Date('2025-08-04');
    const startDate = new Date('2025-08-20');
    const endDate = new Date('2025-08-15');
    expect(isDateInRange(targetDate, startDate, endDate)).toBe(false);
  });
});

describe('fillZero', () => {
  it("5를 2자리로 변환하면 '05'를 반환한다", () => {
    expect(fillZero(5, 2)).toBe('05');
  });

  it("10을 2자리로 변환하면 '10'을 반환한다", () => {
    expect(fillZero(10, 2)).toBe('10');
  });

  // 보통은 시간,날짜 두자리정도만 나올거라고 생각이 드는데 3자리 검증테스트는 필요없다고 느낍니다.
  it("3을 3자리로 변환하면 '003'을 반환한다", () => {
    expect(fillZero(3, 3)).toBe('003');
  });

  // 보통은 시간,날짜 두자리정도만 나올거라고 생각이 드는데 3자리 검증테스트는 필요없다고 느낍니다.
  it("100을 2자리로 변환하면 '100'을 반환한다", () => {
    expect(fillZero(100, 3)).toBe('100');
  });

  it("0을 2자리로 변환하면 '00'을 반환한다", () => {
    expect(fillZero(0, 2)).toBe('00');
  });

  // 보통은 시간,날짜 두자리정도만 나올거라고 생각이 드는데 5자리 검증테스트는 필요없다고 느낍니다.
  it("1을 5자리로 변환하면 '00001'을 반환한다", () => {
    expect(fillZero(1, 5)).toBe('00001');
  });

  // 굳이 날짜유틸인데 소수점이 들어가나 싶어서 필요 없다고 생각합니다.
  it("소수점이 있는 3.14를 5자리로 변환하면 '03.14'를 반환한다", () => {
    expect(fillZero(3.14, 5)).toBe('03.14');
  });

  // 저는 최대한 2자리만 나온다고 생각해서 굳이 함수도 사이즈를 변수로 안받는게 맞다고 생각해서 이거도 없어도 될거 같습니다.
  it('size 파라미터를 생략하면 기본값 2를 사용한다', () => {
    expect(fillZero(3)).toBe('03');
  });

  it('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    expect(fillZero(100, 1)).toBe('100');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    const currentDate = new Date(2025, 6, 1);
    expect(formatDate(currentDate)).toEqual('2025-07-01');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    expect(formatDate(new Date(2025, 6, 1), 20)).toEqual('2025-07-20');
  });

  // 어차피 fillZero에서 하는데 굳이? 0을붙여 포메팅하는게 필요없다고 생각함.
  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    expect(formatDate(new Date(2025, 6, 1))).toEqual('2025-07-01');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    expect(formatDate(new Date(2025, 6, 1))).toEqual('2025-07-01');
  });
});
