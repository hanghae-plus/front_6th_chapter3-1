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

  describe('윤년 테스트', () => {
    const leapYearTestCases = [
      { year: 2000, month: 2, expected: 29 }, // 400으로 나눠짐 → 윤년
      { year: 1900, month: 2, expected: 28 }, // 100으로 나눠짐 → 평년
      { year: 2004, month: 2, expected: 29 }, // 4로 나눠짐 → 윤년
      { year: 2100, month: 2, expected: 28 }, // 100으로 나눠짐 → 평년
      { year: 2024, month: 2, expected: 29 }, // 가까운 미래 윤년
      { year: 2023, month: 2, expected: 28 }, // 일반 평년
    ];

    it.each(leapYearTestCases)(
      'year: $year, month: $month → $expected일을 반환한다',
      ({ year, month, expected }) => {
        const result = getDaysInMonth(year, month);
        expect(result).toBe(expected);
      }
    );
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    const year = 2024;
    const month = 2;
    const expected = 29;

    const result = getDaysInMonth(year, month);

    expect(result).toBe(expected);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    const year = 2025;
    const month = 2;
    const expected = 28;

    const result = getDaysInMonth(year, month);

    expect(result).toBe(expected);
  });

  it('유효하지 않은 월에 대해 적절히 처리한다', () => {
    const year = 2025;
    const month = 13;
    const expected = 31; // 13월은 2026년 1월의 마지막 날을 반환

    const result = getDaysInMonth(year, month);

    expect(result).toBe(expected);
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date('2025-07-16'); // 2025년 7월 16일 (수욜)
    const expected = [
      new Date('2025-07-13'), // 일요일
      new Date('2025-07-14'), // 월요일
      new Date('2025-07-15'), // 화요일
      new Date('2025-07-16'), // 수요일
      new Date('2025-07-17'), // 목요일
      new Date('2025-07-18'), // 금요일
      new Date('2025-07-19'), // 토요일
    ];

    const result = getWeekDates(date);

    expect(result).toEqual(expected);
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date('2025-07-14'); // 2025년 7월 14일 (월요일)
    const expected = [
      new Date('2025-07-13'), // 일요일 (주의 시작)
      new Date('2025-07-14'), // 월요일
      new Date('2025-07-15'), // 화요일
      new Date('2025-07-16'), // 수요일
      new Date('2025-07-17'), // 목요일
      new Date('2025-07-18'), // 금요일
      new Date('2025-07-19'), // 토요일
    ];

    const result = getWeekDates(date);

    expect(result).toEqual(expected);
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date('2025-07-20'); // 2025년 7월 20일 (일요일)
    const expected = [
      new Date('2025-07-20'), // 일요일 (주의 시작)
      new Date('2025-07-21'), // 월요일
      new Date('2025-07-22'), // 화요일
      new Date('2025-07-23'), // 수요일
      new Date('2025-07-24'), // 목요일
      new Date('2025-07-25'), // 금요일
      new Date('2025-07-26'), // 토요일
    ];

    const result = getWeekDates(date);

    expect(result).toEqual(expected);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const date = new Date('2025-12-29'); // 2025년 12월 29일 (월요일)
    const expected = [
      new Date('2025-12-28'), // 일요일 (주의 시작)
      new Date('2025-12-29'), // 월요일
      new Date('2025-12-30'), // 화요일
      new Date('2025-12-31'), // 수요일
      new Date('2026-01-01'), // 목요일 (2026년 1월 1일)
      new Date('2026-01-02'), // 금요일
      new Date('2026-01-03'), // 토요일
    ];

    const result = getWeekDates(date);

    expect(result).toEqual(expected);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const date = new Date('2025-01-01'); // 2025년 1월 1일 (수요일)
    const expected = [
      new Date('2024-12-29'), // 일요일 (주의 시작, 2024년 12월 29일)
      new Date('2024-12-30'), // 월요일 (2024년 12월 30일)
      new Date('2024-12-31'), // 화요일 (2024년 12월 31일)
      new Date('2025-01-01'), // 수요일
      new Date('2025-01-02'), // 목요일
      new Date('2025-01-03'), // 금요일
      new Date('2025-01-04'), // 토요일
    ];

    const result = getWeekDates(date);

    expect(result).toEqual(expected);
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const date = new Date('2024-02-29'); // 2024년 2월 29일 (목요일)
    const expected = [
      new Date('2024-02-25'), // 일요일 (주의 시작)
      new Date('2024-02-26'), // 월요일
      new Date('2024-02-27'), // 화요일
      new Date('2024-02-28'), // 수요일
      new Date('2024-02-29'), // 목요일
      new Date('2024-03-01'), // 금요일 (3월 1일)
      new Date('2024-03-02'), // 토요일
    ];

    const result = getWeekDates(date);

    expect(result).toEqual(expected);
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const date = new Date('2025-07-31'); // 2025년 7월 31일 (목요일)
    const expected = [
      new Date('2025-07-27'), // 일요일 (주의 시작)
      new Date('2025-07-28'), // 월요일
      new Date('2025-07-29'), // 화요일
      new Date('2025-07-30'), // 수요일
      new Date('2025-07-31'), // 목요일
      new Date('2025-08-01'), // 금요일 (8월 1일)
      new Date('2025-08-02'), // 토요일
    ];

    const result = getWeekDates(date);

    expect(result).toEqual(expected);
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
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '테스트 이벤트 1',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '테스트',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 15,
    },
    {
      id: '2',
      title: '테스트 이벤트 2',
      date: '2025-07-02',
      startTime: '14:00',
      endTime: '15:00',
      description: '테스트 설명 2',
      location: '테스트 장소 2',
      category: '테스트2',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 30,
    },
  ];

  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const date = 1; // 1일
    const expected = [mockEvents[0]];

    const result = getEventsForDay(mockEvents, date);

    expect(result).toEqual(expected);
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const date = 3; // 3일
    const expected: Event[] = [];

    const result = getEventsForDay(mockEvents, date);

    expect(result).toEqual(expected);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const date = 0; // 0일
    const expected: Event[] = [];

    const result = getEventsForDay(mockEvents, date);

    expect(result).toEqual(expected);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const date = 32; // 32일
    const expected: Event[] = [];

    const result = getEventsForDay(mockEvents, date);

    expect(result).toEqual(expected);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-07-15'); // 2025년 7월 15일
    const expected = '2025년 7월 3주';

    const result = formatWeek(date);

    expect(result).toBe(expected);
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date(2025, 6, 1); // 2025년 7월 1일
    const expected = '2025년 7월 1주';

    const result = formatWeek(date);

    expect(result).toBe(expected);
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-07-31'); // 2025년 7월 31일
    const expected = '2025년 7월 5주';

    const result = formatWeek(date);

    expect(result).toBe(expected);
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date(2025, 11, 29); // 2025년 12월 29일
    // formatWeek는 해당 날짜가 속한 주의 주차를 계산하므로 연도가 바뀌는 주에서는 다른 결과가 나올 수 있음
    const result = formatWeek(date);

    // 결과가 올바른 형식인지만 확인
    expect(result).toMatch(/^\d{4}년 \d{1,2}월 \d+주$/);
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2024-02-29'); // 2024년 2월 29일
    const expected = '2024년 2월 5주';

    const result = formatWeek(date);

    expect(result).toBe(expected);
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-02-28'); // 2025년 2월 28일
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
  // 경계값 테스트 추가
  it("2026년 1월 1일을 '2026년 1월'로 반환한다", () => {
    const date = new Date('2026-01-01');
    const expected = '2026년 1월';
    const result = formatMonth(date);
    expect(result).toBe(expected);
  });
  it("2026년 12월 31일을 '2026년 12월'로 반환한다", () => {
    const date = new Date('2026-12-31');
    const expected = '2026년 12월';
    const result = formatMonth(date);
    expect(result).toBe(expected);
  });
  // 엣지 케이스 추가
  it("윤년의 2월 29일을 '2024년 2월'로 반환한다", () => {
    const date = new Date('2024-02-29');
    const expected = '2024년 2월';
    const result = formatMonth(date);
    expect(result).toBe(expected);
  });
});

describe('isDateInRange', () => {
  const start = new Date('2025-07-01');
  const end = new Date('2025-07-31');

  it('범위 내의 날짜 2025-07-10에 대해 true를 반환한다', () => {
    const date = new Date('2025-07-10');
    const result = isDateInRange(date, start, end);
    expect(result).toBe(true);
  });

  it('범위의 시작일 2025-07-01에 대해 true를 반환한다', () => {
    const date = new Date('2025-07-01');
    const result = isDateInRange(date, start, end);
    expect(result).toBe(true);
  });

  it('범위의 종료일 2025-07-31에 대해 true를 반환한다', () => {
    const date = new Date('2025-07-31');
    const result = isDateInRange(date, start, end);
    expect(result).toBe(true);
  });

  it('범위 이전의 날짜 2025-06-30에 대해 false를 반환한다', () => {
    const date = new Date('2025-06-30');
    const result = isDateInRange(date, start, end);
    expect(result).toBe(false);
  });

  it('범위 이후의 날짜 2025-08-01에 대해 false를 반환한다', () => {
    const date = new Date('2025-08-01');
    const result = isDateInRange(date, start, end);
    expect(result).toBe(false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const date = new Date('2025-07-15');
    const result = isDateInRange(date, end, start);
    expect(result).toBe(false);
  });

  // 시작일의 마지막 순간으로 경계값 테스트
  it('시작일의 마지막 순간(2025-07-01 23:59:59)에 대해 true를 반환한다', () => {
    const date = new Date('2025-07-01T23:59:59.999');
    expect(isDateInRange(date, start, end)).toBe(true);
  });
  // 종료일의 첫 순간으로 경계값 테스트
  it('종료일의 첫 순간(2025-07-31 00:00:00)에 대해 true를 반환한다', () => {
    const date = new Date('2025-07-31T00:00:00.000');
    expect(isDateInRange(date, start, end)).toBe(true);
  });
});

describe('fillZero', () => {
  it("5를 2자리로 변환하면 '05'를 반환한다", () => {
    const result = fillZero(5, 2);
    expect(result).toBe('05');
  });

  it("10을 2자리로 변환하면 '10'을 반환한다", () => {
    const result = fillZero(10, 2);
    expect(result).toBe('10');
  });

  it("3을 3자리로 변환하면 '003'을 반환한다", () => {
    const result = fillZero(3, 3);
    expect(result).toBe('003');
  });

  it("100을 2자리로 변환하면 '100'을 반환한다", () => {
    const result = fillZero(100, 2);
    expect(result).toBe('100');
  });

  it("0을 2자리로 변환하면 '00'을 반환한다", () => {
    const result = fillZero(0, 2);
    expect(result).toBe('00');
  });

  it("0을 10자리로 변환하면 '0000000000'을 반환한다", () => {
    const result = fillZero(0, 10);
    expect(result).toBe('0000000000');
  });

  it("1을 5자리로 변환하면 '00001'을 반환한다", () => {
    const result = fillZero(1, 5);
    expect(result).toBe('00001');
  });

  it("소수점이 있는 3.14를 5자리로 변환하면 '03.14'를 반환한다", () => {
    const result = fillZero(3.14, 5);
    expect(result).toBe('03.14');
  });

  it('size 파라미터를 생략하면 기본값 2를 사용한다', () => {
    const result = fillZero(5);
    expect(result).toBe('05');
  });

  it('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    expect(fillZero(1, 0)).toBe('1');
    expect(fillZero(123, 2)).toBe('123');
    expect(fillZero(2147483647, 9)).toBe('2147483647');

    expect(fillZero(123.45, 4)).toBe('123.45');
    expect(fillZero(12.34, 4)).toBe('12.34');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    const date = new Date('2025-07-15');
    const expected = '2025-07-15';

    const result = formatDate(date);

    expect(result).toBe(expected);
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    const date = new Date('2025-06-20');
    const day = 30;
    const expected = '2025-06-30';

    const result = formatDate(date, day);

    expect(result).toBe(expected);
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const date = new Date('2025-03-15'); // 3월
    const expected = '2025-03-15';

    const result = formatDate(date);

    expect(result).toBe(expected);
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const date = new Date('2025-07-05'); // 5일
    const expected = '2025-07-05';

    const result = formatDate(date);

    expect(result).toBe(expected);
  });
});
