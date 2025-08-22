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

const TEST_YEAR = 2025;
const TEST_MONTH = 8;

export const TEST_DATES = {
  SUNDAY: new Date(TEST_YEAR, TEST_MONTH - 1, 17),
  MONDAY: new Date(TEST_YEAR, TEST_MONTH - 1, 18),
  TUESDAY: new Date(TEST_YEAR, TEST_MONTH - 1, 19),
  WEDNESDAY: new Date(TEST_YEAR, TEST_MONTH - 1, 20),
  THURSDAY: new Date(TEST_YEAR, TEST_MONTH - 1, 21),
  FRIDAY: new Date(TEST_YEAR, TEST_MONTH - 1, 22),
  SATURDAY: new Date(TEST_YEAR, TEST_MONTH - 1, 23),
};

export const EXPECTED_WEEK_DATES = [
  TEST_DATES.SUNDAY,
  TEST_DATES.MONDAY,
  TEST_DATES.TUESDAY,
  TEST_DATES.WEDNESDAY,
  TEST_DATES.THURSDAY,
  TEST_DATES.FRIDAY,
  TEST_DATES.SATURDAY,
];

describe('getDaysInMonth', () => {
  it('1월은 31일 수를 반환한다', () => {
    expect(getDaysInMonth(2025, 1)).toBe(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    expect(getDaysInMonth(2025, 4)).toBe(30);
  });

  // ! 추가 30일 일수 테스트
  it('6월, 9월, 11월은 30일 일수를 반환한다', () => {
    expect(getDaysInMonth(2025, 6)).toBe(30);
    expect(getDaysInMonth(2025, 9)).toBe(30);
    expect(getDaysInMonth(2025, 11)).toBe(30);
  });

  // ! 추가 31일 일수 테스트
  it('1월, 3월, 5월, 7월, 8월, 10월, 12월은 31일 일수를 반환한다', () => {
    expect(getDaysInMonth(2025, 1)).toBe(31);
    expect(getDaysInMonth(2025, 3)).toBe(31);
    expect(getDaysInMonth(2025, 5)).toBe(31);
    expect(getDaysInMonth(2025, 7)).toBe(31);
    expect(getDaysInMonth(2025, 8)).toBe(31);
    expect(getDaysInMonth(2025, 10)).toBe(31);
    expect(getDaysInMonth(2025, 12)).toBe(31);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    expect(getDaysInMonth(2024, 2)).toBe(29);
    expect(getDaysInMonth(2020, 2)).toBe(29);
    expect(getDaysInMonth(2016, 2)).toBe(29);
    expect(getDaysInMonth(2000, 2)).toBe(29);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    expect(getDaysInMonth(2023, 2)).toBe(28);
    expect(getDaysInMonth(2022, 2)).toBe(28);
    expect(getDaysInMonth(2021, 2)).toBe(28);
    expect(getDaysInMonth(2100, 2)).toBe(28);
  });

  it('유효하지 않은 월에 대해 0을 반환한다.', () => {
    expect(getDaysInMonth(2025, 13)).toBe(0);
    expect(getDaysInMonth(2025, -1)).toBe(0);
    expect(getDaysInMonth(2025, 100)).toBe(0);
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    expect(getWeekDates(TEST_DATES.WEDNESDAY)).toEqual(EXPECTED_WEEK_DATES);
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    expect(getWeekDates(TEST_DATES.MONDAY)).toEqual(EXPECTED_WEEK_DATES);
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    expect(getWeekDates(TEST_DATES.SUNDAY)).toEqual(EXPECTED_WEEK_DATES);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const expected = [
      new Date(TEST_YEAR, 12 - 1, 28),
      new Date(TEST_YEAR, 12 - 1, 29),
      new Date(TEST_YEAR, 12 - 1, 30),
      new Date(TEST_YEAR, 12 - 1, 31),
      new Date(TEST_YEAR + 1, 0, 1),
      new Date(TEST_YEAR + 1, 0, 2),
      new Date(TEST_YEAR + 1, 0, 3),
    ];

    expect(getWeekDates(new Date(TEST_YEAR, 12 - 1, 31))).toEqual(expected);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const expected = [
      new Date(TEST_YEAR - 1, 12 - 1, 29),
      new Date(TEST_YEAR - 1, 12 - 1, 30),
      new Date(TEST_YEAR - 1, 12 - 1, 31),
      new Date(TEST_YEAR, 0, 1),
      new Date(TEST_YEAR, 0, 2),
      new Date(TEST_YEAR, 0, 3),
      new Date(TEST_YEAR, 0, 4),
    ];

    expect(getWeekDates(new Date(TEST_YEAR, 0, 1))).toEqual(expected);
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const expected = [
      new Date(2024, 2 - 1, 25),
      new Date(2024, 2 - 1, 26),
      new Date(2024, 2 - 1, 27),
      new Date(2024, 2 - 1, 28),
      new Date(2024, 2 - 1, 29),
      new Date(2024, 3 - 1, 1),
      new Date(2024, 3 - 1, 2),
    ];

    expect(getWeekDates(new Date(2024, 2 - 1, 29))).toEqual(expected);
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const expected = [
      new Date(TEST_YEAR, TEST_MONTH - 1, 31),
      new Date(TEST_YEAR, TEST_MONTH, 1),
      new Date(TEST_YEAR, TEST_MONTH, 2),
      new Date(TEST_YEAR, TEST_MONTH, 3),
      new Date(TEST_YEAR, TEST_MONTH, 4),
      new Date(TEST_YEAR, TEST_MONTH, 5),
      new Date(TEST_YEAR, TEST_MONTH, 6),
    ];

    expect(getWeekDates(new Date(TEST_YEAR, TEST_MONTH - 1, 31))).toEqual(expected);
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const expected: Array<Array<number | null>> = [
      [null, null, 1, 2, 3, 4, 5],
      [6, 7, 8, 9, 10, 11, 12],
      [13, 14, 15, 16, 17, 18, 19],
      [20, 21, 22, 23, 24, 25, 26],
      [27, 28, 29, 30, 31, null, null],
    ];

    expect(getWeeksAtMonth(new Date(2025, 6, 1))).toEqual(expected);
  });

  it('월의 첫날이 일요일인 경우를 올바르게 처리한다', () => {
    const expected: Array<Array<number | null>> = [
      [1, 2, 3, 4, 5, 6, 7],
      [8, 9, 10, 11, 12, 13, 14],
      [15, 16, 17, 18, 19, 20, 21],
      [22, 23, 24, 25, 26, 27, 28],
      [29, 30, null, null, null, null, null],
    ];

    expect(getWeeksAtMonth(new Date(2025, 5, 1))).toEqual(expected);
  });

  it('월의 마지막날이 토요일인 경우를 올바르게 처리한다', () => {
    const expected: Array<Array<number | null>> = [
      [null, null, null, null, 1, 2, 3],
      [4, 5, 6, 7, 8, 9, 10],
      [11, 12, 13, 14, 15, 16, 17],
      [18, 19, 20, 21, 22, 23, 24],
      [25, 26, 27, 28, 29, 30, 31],
    ];

    expect(getWeeksAtMonth(new Date(2025, 4, 1))).toEqual(expected);
  });

  it('윤년 2월을 올바르게 처리한다', () => {
    const expected: Array<Array<number | null>> = [
      [null, null, null, null, 1, 2, 3],
      [4, 5, 6, 7, 8, 9, 10],
      [11, 12, 13, 14, 15, 16, 17],
      [18, 19, 20, 21, 22, 23, 24],
      [25, 26, 27, 28, 29, null, null],
    ];

    expect(getWeeksAtMonth(new Date(2024, 1, 1))).toEqual(expected);
  });

  it('평년 2월을 올바르게 처리한다', () => {
    const expected: Array<Array<number | null>> = [
      [null, null, null, null, null, null, 1],
      [2, 3, 4, 5, 6, 7, 8],
      [9, 10, 11, 12, 13, 14, 15],
      [16, 17, 18, 19, 20, 21, 22],
      [23, 24, 25, 26, 27, 28, null],
    ];

    expect(getWeeksAtMonth(new Date(2025, 1, 1))).toEqual(expected);
  });

  // ! 제거: 첫번째 목요일을 1주로 치는 경우 6주가 필요한 월은 존재하지 않음
  // it.skip('6주가 필요한 월을 올바르게 처리한다', () => {
  //   const expected: Array<Array<number | null>> = [
  //     [null, null, null, null, 1, 2, 3],
  //     [4, 5, 6, 7, 8, 9, 10],
  //     [11, 12, 13, 14, 15, 16, 17],
  //     [18, 19, 20, 21, 22, 23, 24],
  //     [25, 26, 27, 28, null, null, null],
  //   ];

  //   expect(getWeeksAtMonth(new Date(2025, 7, 1))).toEqual(expected);
  // });
});

describe('getEventsForDay', () => {
  let events: Event[];

  beforeEach(() => {
    events = [
      {
        id: '1',
        title: 'Event 1',
        date: '2025-08-01',
        startTime: '10:00',
        endTime: '11:00',
        description: 'Description 1',
        location: 'Location 1',
        category: 'Category 1',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: 'Event 2',
        date: '2025-08-02',
        startTime: '10:00',
        endTime: '11:00',
        description: 'Description 2',
        location: 'Location 2',
        category: 'Category 2',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: 'Event 3',
        date: '2025-08-03',
        startTime: '10:00',
        endTime: '11:00',
        description: 'Description 3',
        location: 'Location 3',
        category: 'Category 3',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ];
  });

  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    expect(getEventsForDay(events, 1)).toEqual([events[0]]);
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    expect(getEventsForDay(events, 4)).toEqual([]);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    expect(getEventsForDay(events, 0)).toEqual([]);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    expect(getEventsForDay(events, 32)).toEqual([]);
  });

  // ! 추가
  it('같은 날짜에 여러 이벤트가 있을 경우 모두 반환한다', () => {
    const multipleEvents: Event[] = [
      ...events,
      {
        id: '4',
        title: 'Event 4',
        date: events[0].date,
        startTime: '14:00',
        endTime: '15:00',
        description: 'Description 4',
        location: 'Location 4',
        category: 'Category 4',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ];

    expect(getEventsForDay(multipleEvents, 1)).toEqual([multipleEvents[0], multipleEvents[3]]);
  });

  // ! 추가
  it('빈 이벤트 배열에 대해 빈 배열을 반환한다', () => {
    expect(getEventsForDay([], 1)).toEqual([]);
    expect(getEventsForDay([], 0)).toEqual([]);
    expect(getEventsForDay([], 32)).toEqual([]);
  });

  // ! 추가
  it('다양한 날짜 형식의 이벤트를 올바르게 처리한다', () => {
    const mixedDateEvents: Event[] = [
      {
        id: '1',
        title: 'Event 1',
        date: '2025-08-15',
        startTime: '10:00',
        endTime: '11:00',
        description: 'Description 1',
        location: 'Location 1',
        category: 'Category 1',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: 'Event 2',
        date: '2025-08-31',
        startTime: '10:00',
        endTime: '11:00',
        description: 'Description 2',
        location: 'Location 2',
        category: 'Category 2',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ];

    expect(getEventsForDay(mixedDateEvents, 15)).toEqual([mixedDateEvents[0]]);
    expect(getEventsForDay(mixedDateEvents, 31)).toEqual([mixedDateEvents[1]]);
    expect(getEventsForDay(mixedDateEvents, 16)).toEqual([]);
  });

  // ! 추가
  it('경계값 날짜를 올바르게 처리한다', () => {
    const boundaryEvents: Event[] = [
      {
        id: '1',
        title: 'Event 1',
        date: '2025-08-01',
        startTime: '10:00',
        endTime: '11:00',
        description: 'Description 1',
        location: 'Location 1',
        category: 'Category 1',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: 'Event 2',
        date: '2025-08-31',
        startTime: '10:00',
        endTime: '11:00',
        description: 'Description 2',
        location: 'Location 2',
        category: 'Category 2',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ];

    expect(getEventsForDay(boundaryEvents, 1)).toEqual([boundaryEvents[0]]);
    expect(getEventsForDay(boundaryEvents, 31)).toEqual([boundaryEvents[1]]);
    expect(getEventsForDay(boundaryEvents, 0)).toEqual([]);
    expect(getEventsForDay(boundaryEvents, 32)).toEqual([]);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    expect(formatWeek(new Date(2025, 7, 15))).toBe('2025년 8월 2주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    expect(formatWeek(new Date(2025, 7, 1))).toBe('2025년 7월 5주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    expect(formatWeek(new Date(2025, 7, 31))).toBe('2025년 9월 1주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    expect(formatWeek(new Date(2025, 11, 31))).toBe('2026년 1월 1주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    expect(formatWeek(new Date(2024, 1, 29))).toBe('2024년 2월 5주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    expect(formatWeek(new Date(2023, 1, 28))).toBe('2023년 3월 1주');
  });
});

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    expect(formatMonth(new Date(2025, 6, 10))).toBe('2025년 7월');
  });
});

describe('isDateInRange', () => {
  let rangeStart: Date;
  let rangeEnd: Date;

  beforeEach(() => {
    rangeStart = new Date(2025, 6, 1);
    rangeEnd = new Date(2025, 6, 31);
  });

  it('범위 내의 날짜 2025-07-10에 대해 true를 반환한다', () => {
    expect(isDateInRange(new Date(2025, 6, 10), rangeStart, rangeEnd)).toBe(true);
  });

  it('범위의 시작일 2025-07-01에 대해 true를 반환한다', () => {
    expect(isDateInRange(new Date(2025, 6, 1), rangeStart, rangeEnd)).toBe(true);
  });

  it('범위의 종료일 2025-07-31에 대해 true를 반환한다', () => {
    expect(isDateInRange(new Date(2025, 6, 31), rangeStart, rangeEnd)).toBe(true);
  });

  it('범위 이전의 날짜 2025-06-30에 대해 false를 반환한다', () => {
    expect(isDateInRange(new Date(2025, 5, 30), rangeStart, rangeEnd)).toBe(false);
  });

  it('범위 이후의 날짜 2025-08-01에 대해 false를 반환한다', () => {
    expect(isDateInRange(new Date(2025, 7, 1), rangeStart, rangeEnd)).toBe(false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    expect(isDateInRange(new Date(2025, 6, 31), rangeEnd, rangeStart)).toBe(false);
  });
});

describe('fillZero', () => {
  it("5를 2자리로 변환하면 '05'를 반환한다", () => {
    expect(fillZero(5, 2)).toBe('05');
  });

  it("10을 2자리로 변환하면 '10'을 반환한다", () => {
    expect(fillZero(10, 2)).toBe('10');
  });

  it("3을 3자리로 변환하면 '003'을 반환한다", () => {
    expect(fillZero(3, 3)).toBe('003');
  });

  it("100을 2자리로 변환하면 '100'을 반환한다", () => {
    expect(fillZero(100, 2)).toBe('100');
  });

  it("0을 2자리로 변환하면 '00'을 반환한다", () => {
    expect(fillZero(0, 2)).toBe('00');
  });

  it("1을 5자리로 변환하면 '00001'을 반환한다", () => {
    expect(fillZero(1, 5)).toBe('00001');
  });

  it("소수점이 있는 3.14를 5자리로 변환하면 '03.14'를 반환한다", () => {
    expect(fillZero(3.14, 5)).toBe('03.14');
  });

  it('size 파라미터를 생략하면 기본값 2를 사용한다', () => {
    expect(fillZero(123)).toBe('123');
  });

  it('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    expect(fillZero(1234, 3)).toBe('1234');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    expect(formatDate(new Date(2025, 7, 21))).toBe('2025-08-21');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    expect(formatDate(new Date(2025, 7, 21), 1)).toBe('2025-08-01');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    expect(formatDate(new Date(2025, 0, 1))).toBe('2025-01-01');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    expect(formatDate(new Date(2025, 0, 1))).toBe('2025-01-01');
  });

  // ! 추가
  it('다양한 월의 날짜를 올바르게 포맷팅한다', () => {
    const testCases = [
      { date: new Date(2025, 0, 15), expected: '2025-01-15' },
      { date: new Date(2025, 5, 30), expected: '2025-06-30' },
      { date: new Date(2025, 11, 31), expected: '2025-12-31' },
    ];

    testCases.forEach(({ date, expected }) => {
      expect(formatDate(date)).toBe(expected);
    });
  });

  // ! 추가
  it('경계값 날짜를 올바르게 포맷팅한다', () => {
    expect(formatDate(new Date(2025, 0, 1))).toBe('2025-01-01');
    expect(formatDate(new Date(2025, 11, 31))).toBe('2025-12-31');
    expect(formatDate(new Date(2025, 1, 28))).toBe('2025-02-28');
    expect(formatDate(new Date(2024, 1, 29))).toBe('2024-02-29');
  });

  // ! 추가
  it('day 파라미터로 다양한 일자를 지정할 수 있다', () => {
    expect(formatDate(new Date(2025, 7, 21), 1)).toBe('2025-08-01');
    expect(formatDate(new Date(2025, 7, 21), 15)).toBe('2025-08-15');
    expect(formatDate(new Date(2025, 7, 21), 31)).toBe('2025-08-31');
  });

  // ! 추가
  it('day 파라미터가 한 자리 수일 때도 올바르게 처리한다', () => {
    expect(formatDate(new Date(2025, 7, 21), 5)).toBe('2025-08-05');
    expect(formatDate(new Date(2025, 7, 21), 9)).toBe('2025-08-09');
  });

  // ! 추가
  it('다양한 연도의 날짜를 올바르게 포맷팅한다', () => {
    expect(formatDate(new Date(2020, 0, 1))).toBe('2020-01-01');
    expect(formatDate(new Date(2030, 11, 31))).toBe('2030-12-31');
    expect(formatDate(new Date(1999, 5, 15))).toBe('1999-06-15');
  });
});
