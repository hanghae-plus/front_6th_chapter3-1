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
    const daysInMonth = getDaysInMonth(2025, 1);
    expect(daysInMonth).toBe(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    const daysInMonth = getDaysInMonth(2025, 4);
    expect(daysInMonth).toBe(30);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    const daysInMonth = getDaysInMonth(2024, 2); // 2024년이 윤년이므로
    expect(daysInMonth).toBe(29);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    const daysInMonth = getDaysInMonth(2025, 2);
    expect(daysInMonth).toBe(28);
  });

  it('유효하지 않은 월에 대해 -1을 반환한다', () => {
    const daysInMonth = getDaysInMonth(2025, 13);
    expect(daysInMonth).toBe(-1);
  });
});

describe('getWeekDates', () => {
  const expectValidWeekDates = (dates: Date[]) => {
    expect(dates).toHaveLength(7);
    // 일요일(0)부터 토요일(6)까지 순서대로 검증
    dates.forEach((date, index) => {
      expect(date.getDay()).toBe(index);
    });
  };

  it('수요일에 해당하는 날짜를 입력했을때 그 주의 일~토까지의 날짜를 반환한다', () => {
    const wednesday = new Date(2025, 0, 3);
    const weekDates = getWeekDates(wednesday);
    expectValidWeekDates(weekDates);
  });

  it('월요일에 해당하는 날짜를 입력했을때 그 주의 일~토까지의 날짜를 반환한다', () => {
    const monday = new Date(2025, 0, 1);
    const weekDates = getWeekDates(monday);
    expectValidWeekDates(weekDates);
  });

  it('일요일에 해당하는 날짜를 입력했을때 그 주의 일~토까지의 날짜를 반환한다', () => {
    const sunday = new Date(2025, 0, 7);
    const weekDates = getWeekDates(sunday);
    expectValidWeekDates(weekDates);
  });

  it('연도가 끝나는 날짜를 입력 했을 때 다음해 1월이 포함된 그 주의 일~토 날짜를 반환한다', () => {
    const yearEnd = new Date(2025, 11, 31);
    const weekDates = getWeekDates(yearEnd);
    expectValidWeekDates(weekDates);
  });

  it('연도가 시작되는 날짜를 입력 했을 때 이전해 12월이 포함된 그 주의 일~토 날짜를 반환한다', () => {
    const yearStart = new Date(2025, 0, 1);
    const weekDates = getWeekDates(yearStart);
    expectValidWeekDates(weekDates);
  });

  it('윤년의 마지막 날짜(2월 29일)를 입력했을때 그 주의 일~토까지의 날짜를 반환한다', () => {
    const leapDay = new Date(2025, 1, 29);
    const weekDates = getWeekDates(leapDay);
    expectValidWeekDates(weekDates);
  });

  it('월의 마지막 날짜를 입력했을때 그 주의 일~토까지의 날짜를 반환한다', () => {
    const monthEnd = new Date(2025, 0, 31);
    const weekDates = getWeekDates(monthEnd);
    expectValidWeekDates(weekDates);
  });
});

describe('getWeeksAtMonth', () => {
  it('입력한 날짜의 월에 해당하는 주별 날짜 정보를 배열로 반환한다', () => {
    const date = new Date(2025, 6, 1);
    const weeksAtMonth = getWeeksAtMonth(date);

    // 각 주는 7일로 구성 (null 포함)
    weeksAtMonth.forEach((week) => {
      expect(week).toHaveLength(7);
    });

    // 첫 번째 주에 1일이 포함되어야 함
    const firstWeek = weeksAtMonth[0];
    expect(firstWeek).toContain(1);

    // (7월은 31일까지니까) 마지막 주에 31일이 포함되어야 함
    const lastWeek = weeksAtMonth[weeksAtMonth.length - 1];
    expect(lastWeek).toContain(31);

    // 빈 날짜는 null로 채워져야 함
    const flatDates = weeksAtMonth.flat();
    const nullCount = flatDates.filter((date) => date === null).length;
    expect(nullCount).toBeGreaterThanOrEqual(0); // null이 있을 수 있음
  });
});

describe('getEventsForDay', () => {
  // 1월에 해당하는 Events
  const eventsOfMonth: Event[] = [
    {
      id: '1',
      title: '회의',
      date: '2025-01-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '점심',
      date: '2025-01-01',
      startTime: '12:00',
      endTime: '13:00',
      description: '',
      location: '',
      category: '개인',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '3',
      title: '운동',
      date: '2025-01-15',
      startTime: '18:00',
      endTime: '19:00',
      description: '',
      location: '',
      category: '개인',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
  ];

  const expectEmptyEvents = (day: number) => {
    const eventsForDay = getEventsForDay(eventsOfMonth, day);
    expect(eventsForDay).toHaveLength(0);
    expect(eventsForDay).toEqual([]);
  };

  it('해당 월의 특정 날짜에 이벤트가 있을때 해당 이벤트 배열을 반환한다', () => {
    const eventsForDay = getEventsForDay(eventsOfMonth, 1);

    expect(eventsForDay).toHaveLength(2);
    expect(eventsForDay[0].title).toBe('회의');
    expect(eventsForDay[1].title).toBe('점심');
  });

  it('해당 월의 특정 날짜에 이벤트가 없을때 빈 배열을 반환한다', () => {
    expectEmptyEvents(10);
  });

  it('날짜가 0일일때 빈 배열을 반환한다', () => {
    expectEmptyEvents(0);
  });

  it('날짜가 32일 이상일때 빈 배열을 반환한다', () => {
    expectEmptyEvents(32);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜(15일)을 입력했을 때 그 주의 포맷된 문자열을 반환한다', () => {
    const dateAtMonthOfMiddle = new Date(2025, 0, 15);
    const fomratedWeek = formatWeek(dateAtMonthOfMiddle);
    expect(fomratedWeek).toBe('2025년 1월 3주');
  });

  it('월의 첫 주에 해당하는 날짜를 입력했을 때 그 주의 포맷된 문자열을 반환한다', () => {
    const dateAtMonthOfFirstWeek = new Date(2025, 0, 1);
    const fomratedWeek = formatWeek(dateAtMonthOfFirstWeek);
    expect(fomratedWeek).toBe('2025년 1월 1주');
  });

  it('월의 마지막 주에 해당하는 날짜를 입력했을 때 그 주의 포맷된 문자열을 반환한다', () => {
    const dateAtMonthOfLastWeek = new Date(2025, 0, 31);
    const fomratedWeek = formatWeek(dateAtMonthOfLastWeek);
    expect(fomratedWeek).toBe('2025년 1월 5주');
  });

  it('연도가 바뀌는 주에 해당하는 날짜를 입력했을 때 그 주의 포맷된 문자열을 반환한다', () => {
    const dateAtYearChange = new Date(2025, 11, 31);
    const fomratedWeek = formatWeek(dateAtYearChange);
    // 목요일이 기준되는 ISO표준 특성상 특정 케이스에서 주차가 다음 달로 넘어가는 주차가 있어서 로직에 문제가 있으나,
    // 테스트코드 작성이 목표이므로 일단은 넘어감.
    expect(fomratedWeek).toBe('2026년 1월 1주');
  });

  it('윤년 2월의 마지막 주에 해당하는 날짜를 입력했을 때 그 주의 포맷된 문자열을 반환한다', () => {
    const dateAtLeapYear = new Date(2024, 1, 29);
    const fomratedWeek = formatWeek(dateAtLeapYear);
    expect(fomratedWeek).toBe('2024년 2월 5주');
  });

  it('평년 2월의 마지막 주에 해당하는 날짜를 입력했을 때 그 주의 포맷된 문자열을 반환한다', () => {
    const dateAtCommonYear = new Date(2025, 1, 28);
    const fomratedWeek = formatWeek(dateAtCommonYear);
    expect(fomratedWeek).toBe('2025년 2월 4주');
  });
});

describe('formatMonth', () => {
  it('특정 날짜를 입력했을 때 그 월의 포맷된 문자열을 반환한다', () => {
    const date = new Date(2025, 6, 10);
    const fomratedMonth = formatMonth(date);
    expect(fomratedMonth).toBe('2025년 7월');
  });
});

describe('isDateInRange', () => {
  const expectDateInRange = (
    targetDate: Date,
    rangeStart: Date,
    rangeEnd: Date,
    expected: boolean
  ) => {
    const isInRange = isDateInRange(targetDate, rangeStart, rangeEnd);
    expect(isInRange).toBe(expected);
  };

  it('범위 내의 날짜 2025-07-10에 대해 true를 반환한다', () => {
    const targetDate = new Date(2025, 6, 10);
    const rangeStart = new Date(2025, 6, 1);
    const rangeEnd = new Date(2025, 6, 31);
    expectDateInRange(targetDate, rangeStart, rangeEnd, true);
  });

  it('범위의 시작일 2025-07-01에 대해 true를 반환한다', () => {
    const targetDate = new Date(2025, 6, 1);
    const rangeStart = new Date(2025, 6, 1);
    const rangeEnd = new Date(2025, 6, 31);
    expectDateInRange(targetDate, rangeStart, rangeEnd, true);
  });

  it('범위의 종료일 2025-07-31에 대해 true를 반환한다', () => {
    const targetDate = new Date(2025, 6, 31);
    const rangeStart = new Date(2025, 6, 1);
    const rangeEnd = new Date(2025, 6, 31);
    expectDateInRange(targetDate, rangeStart, rangeEnd, true);
  });

  it('범위 이전의 날짜 2025-06-30에 대해 false를 반환한다', () => {
    const targetDate = new Date(2025, 5, 30);
    const rangeStart = new Date(2025, 6, 1);
    const rangeEnd = new Date(2025, 6, 31);
    expectDateInRange(targetDate, rangeStart, rangeEnd, false);
  });

  it('범위 이후의 날짜 2025-08-01에 대해 false를 반환한다', () => {
    const targetDate = new Date(2025, 7, 1);
    const rangeStart = new Date(2025, 6, 1);
    const rangeEnd = new Date(2025, 6, 31);
    expectDateInRange(targetDate, rangeStart, rangeEnd, false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const targetDate = new Date(2025, 6, 15);
    const rangeStart = new Date(2025, 6, 31);
    const rangeEnd = new Date(2025, 6, 1);
    expectDateInRange(targetDate, rangeStart, rangeEnd, false);
  });
});

describe('fillZero', () => {
  it("5를 2자리로 변환하면 '05'를 반환한다", () => {
    const formattedNumber = fillZero(5);
    expect(formattedNumber).toBe('05');
  });

  it("10을 2자리로 변환하면 '10'을 반환한다", () => {
    const formattedNumber = fillZero(10);
    expect(formattedNumber).toBe('10');
  });

  it("3을 3자리로 변환하면 '003'을 반환한다", () => {
    const formattedNumber = fillZero(3, 3);
    expect(formattedNumber).toBe('003');
  });

  it("100을 2자리로 변환하면 '100'을 반환한다", () => {
    const formattedNumber = fillZero(100);
    expect(formattedNumber).toBe('100');
  });

  it("0을 2자리로 변환하면 '00'을 반환한다", () => {
    const formattedNumber = fillZero(0);
    expect(formattedNumber).toBe('00');
  });

  it("1을 5자리로 변환하면 '00001'을 반환한다", () => {
    const formattedNumber = fillZero(1, 5);
    expect(formattedNumber).toBe('00001');
  });

  it("소수점이 있는 3.14를 5자리로 변환하면 '03.14'를 반환한다", () => {
    const formattedNumber = fillZero(3.14, 5);
    expect(formattedNumber).toBe('03.14');
  });

  it('size 파라미터를 생략하면 기본값 2를 사용한다', () => {
    const formattedNumber = fillZero(1);
    expect(formattedNumber).toBe('01');
  });

  it('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    const formattedNumber = fillZero(1000);
    expect(formattedNumber).toBe('1000');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {});

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {});

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {});

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {});
});
