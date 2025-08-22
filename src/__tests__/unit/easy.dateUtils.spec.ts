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
    expect(getDaysInMonth(2025, 1)).toBe(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    expect(getDaysInMonth(2025, 4)).toBe(30);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    expect(getDaysInMonth(2024, 2)).toBe(29);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    expect(getDaysInMonth(2025, 2)).toBe(28);
  });

  it('유효하지 않은 월에 대해 적절히 처리한다', () => {
    expect(() => getDaysInMonth(2024, 13)).toThrow();
    expect(() => getDaysInMonth(2024, 0)).toThrow();
    expect(() => getDaysInMonth(2024, -1)).toThrow();
  });
});

describe('getWeekDates', () => {
  const expectWeekFrom = (actualWeek: Date[], startDay: Date) => {
    expect(actualWeek).toHaveLength(7);

    actualWeek.forEach((date, index) => {
      const expectedDate = new Date(startDay);
      expectedDate.setDate(startDay.getDate() + index);
      expect(date).toEqual(expectedDate);
    });
  };

  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const wednesday = new Date(2025, 7, 20);
    const result = getWeekDates(wednesday);

    expectWeekFrom(result, new Date(2025, 7, 17));
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const monday = new Date(2025, 7, 18);
    const result = getWeekDates(monday);

    expectWeekFrom(result, new Date(2025, 7, 17));
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const sunday = new Date(2025, 7, 24);
    const result = getWeekDates(sunday);

    expectWeekFrom(result, new Date(2025, 7, 24));
  });

  it('12월 말일이 포함된 주가 다음 해까지 올바르게 처리된다 (연말)', () => {
    const december31 = new Date(2025, 11, 31);
    const result = getWeekDates(december31);

    expectWeekFrom(result, new Date(2025, 11, 28));
  });

  it('1월 초가 포함된 주가 이전 해부터 올바르게 처리된다 (연초)', () => {
    const january1 = new Date(2026, 0, 1);
    const result = getWeekDates(january1);

    expectWeekFrom(result, new Date(2025, 11, 28));
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const february29 = new Date(2024, 1, 29);
    const result = getWeekDates(february29);

    expectWeekFrom(result, new Date(2024, 1, 25));
  });

  it('1월 31일을 포함한 주는 2월 1일까지 포함하여 반환한다', () => {
    const lastDayOfMonth = new Date(2025, 0, 31);
    const result = getWeekDates(lastDayOfMonth);

    expectWeekFrom(result, new Date(2025, 0, 26));
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const july1 = new Date(2025, 6, 1);
    const result = getWeeksAtMonth(july1);

    expect(result).toEqual([
      [null, null, 1, 2, 3, 4, 5],
      [6, 7, 8, 9, 10, 11, 12],
      [13, 14, 15, 16, 17, 18, 19],
      [20, 21, 22, 23, 24, 25, 26],
      [27, 28, 29, 30, 31, null, null],
    ]);
  });
});

describe('getEventsForDay', () => {
  const events: Event[] = [
    {
      id: '1',
      title: 'Event 1',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    },
    {
      id: '2',
      title: 'Event 2',
      date: '2025-07-02',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    },
  ];

  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const result = getEventsForDay(events, 1);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Event 1');
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(events, 3);

    expect(result).toEqual([]);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(events, 0);

    expect(result).toEqual([]);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(events, 32);

    expect(result).toEqual([]);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date(2025, 7, 20));

    expect(result).toBe('2025년 8월 3주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date(2025, 7, 3));

    expect(result).toBe('2025년 8월 1주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date(2025, 7, 30));

    expect(result).toBe('2025년 8월 4주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date(2025, 11, 31));

    expect(result).toBe('2026년 1월 1주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date(2024, 1, 29));

    expect(result).toBe('2024년 2월 5주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date(2025, 1, 28));

    expect(result).toBe('2025년 2월 4주');
  });
});

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    const result = formatMonth(new Date(2025, 6, 10));

    expect(result).toBe('2025년 7월');
  });
});

describe('isDateInRange', () => {
  describe('2025년 7월 범위(7/1 ~ 7/31)에서', () => {
    const startDate = new Date(2025, 6, 1);
    const endDate = new Date(2025, 6, 31);

    it('범위 내 날짜는 true를 반환한다', () => {
      const result = isDateInRange(new Date(2025, 6, 10), startDate, endDate);

      expect(result).toBe(true);
    });

    it('시작일은 true를 반환한다', () => {
      const result = isDateInRange(startDate, startDate, endDate);

      expect(result).toBe(true);
    });

    it('종료일은 true를 반환한다', () => {
      const result = isDateInRange(endDate, startDate, endDate);

      expect(result).toBe(true);
    });

    it('범위 이전 날짜는 false를 반환한다', () => {
      const result = isDateInRange(new Date(2025, 5, 30), startDate, endDate);

      expect(result).toBe(false);
    });
  });

  it('시작일이 종료일보다 늦으면 false를 반환한다', () => {
    const result = isDateInRange(
      new Date(2025, 6, 10),
      new Date(2025, 6, 31),
      new Date(2025, 6, 1)
    );

    expect(result).toBe(false);
  });
});

describe('fillZero', () => {
  it("5를 2자리로 변환하면 '05'를 반환한다", () => {
    const result = fillZero(5);

    expect(result).toBe('05');
  });

  it("10을 2자리로 변환하면 '10'을 반환한다", () => {
    const result = fillZero(10);

    expect(result).toBe('10');
  });

  it("3을 3자리로 변환하면 '003'을 반환한다", () => {
    const result = fillZero(3, 3);

    expect(result).toBe('003');
  });

  it("100을 2자리로 변환하면 '100'을 반환한다", () => {
    const result = fillZero(100);

    expect(result).toBe('100');
  });

  it("0을 2자리로 변환하면 '00'을 반환한다", () => {
    const result = fillZero(0);

    expect(result).toBe('00');
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
    const result = fillZero(1);

    expect(result).toBe('01');
  });

  it('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    const result = fillZero(1000, 2);

    expect(result).toBe('1000');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    const result = formatDate(new Date(2025, 7, 20));

    expect(result).toBe('2025-08-20');
  });

  it('day 파라미터로 다른 일자를 지정할 수 있다', () => {
    const result = formatDate(new Date(2025, 7, 20), 21);

    expect(result).toBe('2025-08-21');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const result = formatDate(new Date(2025, 0, 20));

    expect(result).toBe('2025-01-20');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const result = formatDate(new Date(2025, 7, 1));

    expect(result).toBe('2025-08-01');
  });
});
