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
import { createEventData } from './factories/eventFactory';

describe('getDaysInMonth 주어진 월의 일수를 반환한다.', () => {
  // 변경전: 1월은 31일 수를 반환한다
  it('1월은 31일까지 존재한다.', () => {
    expect(getDaysInMonth(2025, 1)).toBe(31);
  });

  // 변경전: 4월은 30일 일수를 반환한다
  it('4월은 30일까지 존재한다.', () => {
    expect(getDaysInMonth(2025, 4)).toBe(30);
  });

  // 변경전: 윤년의 2월에 대해 29일 일수를 반환한다
  it('윤년의 2월은 29일까지 존재한다.', () => {
    expect(getDaysInMonth(2024, 2)).toBe(29);
  });

  // 변경전: 평년의 2월에 대해 28일 일수를 반환한다
  it('평년의 2월은 28일까지 존재한다.', () => {
    expect(getDaysInMonth(2025, 2)).toBe(28);
  });

  // 변경전: 유효하지 않은 월에 대해 적절히 처리한다
  // 여러 케이스를 테스트 해서 describe 으로 작성
  describe('유효하지 않은 월에 대해 처리한다.', () => {
    it('월이 0일 경우 이전 년도 12월의 일수를 반환한다.', () => {
      expect(getDaysInMonth(2025, 0)).toBe(31);
    });

    it('월이 13일 경우 다음 년도 1월의 일수를 반환한다.', () => {
      expect(getDaysInMonth(2025, 13)).toBe(31);
    });
  });
});

describe('getWeekDates 주어진 날짜가 속한 주의 모든 날짜를 반환한다.', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    expect(getWeekDates(new Date('2025-08-20'))).toEqual([
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
    // ISO 8601 기준 월요일 시작
    // 값은 일요일 부터 시작이라 어색해 보임

    expect(getWeekDates(new Date('2025-08-18'))).toEqual([
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
    expect(getWeekDates(new Date('2025-08-17'))).toEqual([
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
    expect(getWeekDates(new Date('2025-12-31'))).toEqual([
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
    expect(getWeekDates(new Date('2026-01-01'))).toEqual([
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
    expect(getWeekDates(new Date('2024-02-29'))).toEqual([
      new Date('2024-02-25'),
      new Date('2024-02-26'),
      new Date('2024-02-27'),
      new Date('2024-02-28'),
      new Date('2024-02-29'),
      new Date('2024-03-01'),
      new Date('2024-03-02'),
    ]);
  });

  describe('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    test.each([
      {
        date: '2025-01-31',
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
        date: '2025-02-28',
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
      {
        date: '2025-03-31',
        expected: [
          '2025-03-30',
          '2025-03-31',
          '2025-04-01',
          '2025-04-02',
          '2025-04-03',
          '2025-04-04',
          '2025-04-05',
        ],
      },
      {
        date: '2025-04-30',
        expected: [
          '2025-04-27',
          '2025-04-28',
          '2025-04-29',
          '2025-04-30',
          '2025-05-01',
          '2025-05-02',
          '2025-05-03',
        ],
      },
      {
        date: '2025-05-31',
        expected: [
          '2025-05-25',
          '2025-05-26',
          '2025-05-27',
          '2025-05-28',
          '2025-05-29',
          '2025-05-30',
          '2025-05-31',
        ],
      },
      {
        date: '2025-06-30',
        expected: [
          '2025-06-29',
          '2025-06-30',
          '2025-07-01',
          '2025-07-02',
          '2025-07-03',
          '2025-07-04',
          '2025-07-05',
        ],
      },
      {
        date: '2025-07-31',
        expected: [
          '2025-07-27',
          '2025-07-28',
          '2025-07-29',
          '2025-07-30',
          '2025-07-31',
          '2025-08-01',
          '2025-08-02',
        ],
      },
      {
        date: '2025-08-31',
        expected: [
          '2025-08-31',
          '2025-09-01',
          '2025-09-02',
          '2025-09-03',
          '2025-09-04',
          '2025-09-05',
          '2025-09-06',
        ],
      },
      {
        date: '2025-09-30',
        expected: [
          '2025-09-28',
          '2025-09-29',
          '2025-09-30',
          '2025-10-01',
          '2025-10-02',
          '2025-10-03',
          '2025-10-04',
        ],
      },
      {
        date: '2025-10-31',
        expected: [
          '2025-10-26',
          '2025-10-27',
          '2025-10-28',
          '2025-10-29',
          '2025-10-30',
          '2025-10-31',
          '2025-11-01',
        ],
      },
      {
        date: '2025-11-30',
        expected: [
          '2025-11-30',
          '2025-12-01',
          '2025-12-02',
          '2025-12-03',
          '2025-12-04',
          '2025-12-05',
          '2025-12-06',
        ],
      },
      {
        date: '2025-12-31',
        expected: [
          '2025-12-28',
          '2025-12-29',
          '2025-12-30',
          '2025-12-31',
          '2026-01-01',
          '2026-01-02',
          '2026-01-03',
        ],
      },
    ])('$date 가 포함된 주를 올바르게 처리한다.', ({ date, expected }) => {
      const expectedDates = expected.map((d) => new Date(d));
      expect(getWeekDates(new Date(date))).toEqual(expectedDates);
    });
  });
});

describe('getWeeksAtMonth', () => {
  it('해당 월의 주 정보를 반환한다 (2025-07-01)', () => {
    expect(getWeeksAtMonth(new Date('2025-07-01'))).toEqual([
      [null, null, 1, 2, 3, 4, 5],
      [6, 7, 8, 9, 10, 11, 12],
      [13, 14, 15, 16, 17, 18, 19],
      [20, 21, 22, 23, 24, 25, 26],
      [27, 28, 29, 30, 31, null, null],
    ]);
  });
});

describe('getEventsForDay', () => {
  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const specificEvents: Event[] = [
      createEventData({
        date: '2025-01-01',
      }),
      createEventData({
        date: '2025-02-01',
      }),
      createEventData({
        date: '2026-10-01',
      }),
    ];
    const events: Event[] = [
      ...specificEvents,
      createEventData({ date: '2025-06-15' }),
      createEventData({ date: '2025-12-31' }),
    ];

    expect(getEventsForDay(events, 1)).toEqual(specificEvents);
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const events: Event[] = [
      createEventData({ date: '2025-06-15' }),
      createEventData({ date: '2025-12-31' }),
    ];

    expect(getEventsForDay(events, 1)).toEqual([]);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const events: Event[] = [
      createEventData({ date: '2025-06-15' }),
      createEventData({ date: '2025-12-31' }),
    ];

    expect(getEventsForDay(events, 0)).toEqual([]);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const events: Event[] = [
      createEventData({ date: '2025-06-15' }),
      createEventData({ date: '2025-12-31' }),
    ];

    expect(getEventsForDay(events, 32)).toEqual([]);
  });
});

describe('formatWeek', () => {
  // ISO 8601 기준

  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    expect(formatWeek(new Date('2025-08-20'))).toBe('2025년 8월 3주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    expect(formatWeek(new Date('2025-07-01'))).toBe('2025년 7월 1주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    expect(formatWeek(new Date('2025-07-31'))).toBe('2025년 7월 5주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    expect(formatWeek(new Date('2025-12-31'))).toBe('2026년 1월 1주');
    expect(formatWeek(new Date('2026-01-01'))).toBe('2026년 1월 1주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    expect(formatWeek(new Date('2024-02-29'))).toBe('2024년 2월 5주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    expect(formatWeek(new Date('2025-02-28'))).toBe('2025년 2월 4주');
  });
});

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    expect(formatMonth(new Date('2025-07-10'))).toBe('2025년 7월');
  });
});

describe('isDateInRange', () => {
  it('범위 내의 날짜 2025-07-10에 대해 true를 반환한다', () => {
    const range: [Date, Date] = [new Date('2025-07-01'), new Date('2025-07-31')];
    expect(isDateInRange(new Date('2025-07-10'), ...range)).toBe(true);
  });

  it('범위의 시작일 2025-07-01에 대해 true를 반환한다', () => {
    const range: [Date, Date] = [new Date('2025-07-01'), new Date('2025-07-31')];
    expect(isDateInRange(new Date('2025-07-01'), ...range)).toBe(true);
  });

  it('범위의 종료일 2025-07-31에 대해 true를 반환한다', () => {
    const range: [Date, Date] = [new Date('2025-07-01'), new Date('2025-07-31')];
    expect(isDateInRange(new Date('2025-07-31'), ...range)).toBe(true);
  });

  it('범위 이전의 날짜 2025-06-30에 대해 false를 반환한다', () => {
    const range: [Date, Date] = [new Date('2025-07-01'), new Date('2025-07-31')];
    expect(isDateInRange(new Date('2025-06-30'), ...range)).toBe(false);
  });

  it('범위 이후의 날짜 2025-08-01에 대해 false를 반환한다', () => {
    const range: [Date, Date] = [new Date('2025-07-01'), new Date('2025-07-31')];
    expect(isDateInRange(new Date('2025-08-01'), ...range)).toBe(false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const range: [Date, Date] = [new Date('2025-07-31'), new Date('2025-07-01')];
    expect(isDateInRange(new Date('2025-07-10'), ...range)).toBe(false);
  });
});

describe('fillZero', () => {
  it("5를 2자리로 변환하면 '05'를 반환한다", () => {
    expect(fillZero(5)).toBe('05');
  });

  it("10을 2자리로 변환하면 '10'을 반환한다", () => {
    expect(fillZero(10)).toBe('10');
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
    expect(fillZero(1)).toBe('01');
  });

  it('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    expect(fillZero(12345, 2)).toBe('12345');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {});

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {});

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {});

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {});
});
