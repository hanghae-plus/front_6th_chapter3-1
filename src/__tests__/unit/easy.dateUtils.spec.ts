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

  // 무의미한 테스트 삭제
  it('유효하지 않은 월에 대해 적절히 처리한다', () => {
    expect(getDaysInMonth(2025, 0)).toBe(31); // 작년 11월로 계산
    expect(getDaysInMonth(2025, 13)).toBe(31); // 익년 1월로 간주
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const currentDate = new Date(); // 2025년 10월 1일 (수요일)
    const weekDates = getWeekDates(currentDate);

    expect(weekDates).toEqual([
      new Date(2025, 8, 28), // 일요일
      new Date(2025, 8, 29), // 월요일
      new Date(2025, 8, 30), // 화요일
      new Date(2025, 9, 1), // 수요일
      new Date(2025, 9, 2), // 목요일
      new Date(2025, 9, 3), // 금요일
      new Date(2025, 9, 4), // 토요일
    ]);
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const currentDate = new Date(2025, 8, 29); // 월요일
    const weekDates = getWeekDates(currentDate);

    expect(weekDates).toEqual([
      new Date(2025, 8, 28), // 일요일
      new Date(2025, 8, 29), // 월요일
      new Date(2025, 8, 30), // 화요일
      new Date(2025, 9, 1), // 수요일
      new Date(2025, 9, 2), // 목요일
      new Date(2025, 9, 3), // 금요일
      new Date(2025, 9, 4), // 토요일
    ]);
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const currentDate = new Date(2025, 8, 28); // 일요일
    const weekDates = getWeekDates(currentDate);

    expect(weekDates).toEqual([
      new Date(2025, 8, 28), // 일요일
      new Date(2025, 8, 29), // 월요일
      new Date(2025, 8, 30), // 화요일
      new Date(2025, 9, 1), // 수요일
      new Date(2025, 9, 2), // 목요일
      new Date(2025, 9, 3), // 금요일
      new Date(2025, 9, 4), // 토요일
    ]);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const currentDate = new Date(2025, 11, 31); // 2025년 12월 31일 (수요일)
    const weekDates = getWeekDates(currentDate);
    console.log(weekDates);

    expect(weekDates).toEqual([
      new Date(2025, 11, 28), // 일요일
      new Date(2025, 11, 29), // 월요일
      new Date(2025, 11, 30), // 화요일
      new Date(2025, 11, 31), // 수요일
      new Date(2026, 0, 1), // 목요일
      new Date(2026, 0, 2), // 금요일
      new Date(2026, 0, 3), // 토요일
    ]);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const currentDate = new Date(2026, 0, 1); // 2026년 1월 1일 (목요일)
    const weekDates = getWeekDates(currentDate);
    console.log(weekDates);

    expect(weekDates).toEqual([
      new Date(2025, 11, 28), // 일요일
      new Date(2025, 11, 29), // 월요일
      new Date(2025, 11, 30), // 화요일
      new Date(2025, 11, 31), // 수요일
      new Date(2026, 0, 1), // 목요일
      new Date(2026, 0, 2), // 금요일
      new Date(2026, 0, 3), // 토요일
    ]);
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const currentDate = new Date(2024, 1, 29); // 2024년 2월 29일 (목요일)
    const weekDates = getWeekDates(currentDate);
    console.log(weekDates);

    expect(weekDates).toEqual([
      new Date(2024, 1, 25), // 일요일
      new Date(2024, 1, 26), // 월요일
      new Date(2024, 1, 27), // 화요일
      new Date(2024, 1, 28), // 수요일
      new Date(2024, 1, 29), // 목요일
      new Date(2024, 2, 1), // 금요일
      new Date(2024, 2, 2), // 토요일
    ]);
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const currentDate = new Date(2025, 11, 31); // 2025년 12월 31일 (수요일)
    const weekDates = getWeekDates(currentDate);
    console.log(weekDates);

    expect(weekDates).toEqual([
      new Date(2025, 11, 28), // 일요일
      new Date(2025, 11, 29), // 월요일
      new Date(2025, 11, 30), // 화요일
      new Date(2025, 11, 31), // 수요일
      new Date(2026, 0, 1), // 목요일
      new Date(2026, 0, 2), // 금요일
      new Date(2026, 0, 3), // 토요일
    ]);
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const currentDate = new Date(2025, 6, 1); // 2025년 7월 1일 (화요일)
    const weeks = getWeeksAtMonth(currentDate);
    console.log(weeks);

    expect(weeks).toEqual([
      [null, null, 1, 2, 3, 4, 5],
      [6, 7, 8, 9, 10, 11, 12],
      [13, 14, 15, 16, 17, 18, 19],
      [20, 21, 22, 23, 24, 25, 26],
      [27, 28, 29, 30, 31, null, null],
    ]);
  });
});

describe('getEventsForDay', () => {
  const dummyEvents = [
    {
      id: '1',
      title: '기존 회의',
      date: '2025-10-1',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ] as Event[];

  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const events = getEventsForDay(dummyEvents, 1);

    expect(events).toEqual(dummyEvents);
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const events = getEventsForDay(dummyEvents, 2);
    console.log(events);

    expect(events).toEqual([]);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const events = getEventsForDay(dummyEvents, 0);
    console.log(events);

    expect(events).toEqual([]);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const events = getEventsForDay(dummyEvents, 32);
    console.log(events);

    expect(events).toEqual([]);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const currentDate = new Date();

    expect(formatWeek(currentDate)).toBe('2025년 10월 1주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const currentDate = new Date(2025, 9, 1); // 2025년 10월 1일 (수요일)

    expect(formatWeek(currentDate)).toBe('2025년 10월 1주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const currentDate = new Date(2025, 9, 31); // 2025년 10월 31일 (금요일)

    expect(formatWeek(currentDate)).toBe('2025년 10월 5주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const currentDate = new Date(2025, 11, 31); // 2025년 12월 31일 (수요일)
    const weekInfo = formatWeek(currentDate);

    expect(weekInfo).toBe('2026년 1월 1주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const currentDate = new Date(2024, 1, 29); // 2024년 2월 29일 (목요일)
    const weekInfo = formatWeek(currentDate);

    expect(weekInfo).toBe('2024년 2월 5주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const currentDate = new Date(2025, 1, 28); // 2025년 2월 28일 (화요일)
    const weekInfo = formatWeek(currentDate);

    expect(weekInfo).toBe('2025년 2월 4주');
  });
});

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    const currentDate = new Date(2025, 6, 10); // 2025년 7월 10일 (목요일)
    const monthInfo = formatMonth(currentDate);

    expect(monthInfo).toBe('2025년 7월');
  });
});

describe('isDateInRange', () => {
  it('범위 내의 날짜 2025-07-10에 대해 true를 반환한다', () => {
    const startDate = new Date(2025, 6, 1);
    const endDate = new Date(2025, 6, 31);
    const testDate = new Date(2025, 6, 10);

    expect(isDateInRange(testDate, startDate, endDate)).toBe(true);
  });

  it('범위의 시작일 2025-07-01에 대해 true를 반환한다', () => {
    const startDate = new Date(2025, 6, 1);
    const endDate = new Date(2025, 6, 31);
    const testDate = new Date(2025, 6, 1);

    expect(isDateInRange(testDate, startDate, endDate)).toBe(true);
  });

  it('범위의 종료일 2025-07-31에 대해 true를 반환한다', () => {
    const startDate = new Date(2025, 6, 1);
    const endDate = new Date(2025, 6, 31);
    const testDate = new Date(2025, 6, 31);

    expect(isDateInRange(testDate, startDate, endDate)).toBe(true);
  });

  it('범위 이전의 날짜 2025-06-30에 대해 false를 반환한다', () => {
    const startDate = new Date(2025, 6, 1);
    const endDate = new Date(2025, 6, 31);
    const testDate = new Date(2025, 5, 30);

    expect(isDateInRange(testDate, startDate, endDate)).toBe(false);
  });

  it('범위 이후의 날짜 2025-08-01에 대해 false를 반환한다', () => {
    const startDate = new Date(2025, 6, 1);
    const endDate = new Date(2025, 6, 31);
    const testDate = new Date(2025, 7, 1);

    expect(isDateInRange(testDate, startDate, endDate)).toBe(false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const startDate = new Date(2025, 6, 31);
    const endDate = new Date(2025, 6, 1);
    const testDate = new Date(2025, 6, 15);

    expect(isDateInRange(testDate, startDate, endDate)).toBe(false);
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
    expect(fillZero(5)).toBe('05');
  });

  it('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    expect(fillZero(100, 2)).toBe('100');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    const currentDate = new Date();
    const formattedDate = formatDate(currentDate);

    expect(formattedDate).toBe('2025-10-01');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    const currentDate = new Date();
    const formattedDate = formatDate(currentDate, 15);
    expect(formattedDate).toBe('2025-10-15');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const currentDate = new Date(2025, 4, 1);
    const formattedDate = formatDate(currentDate);

    console.log(formattedDate);
    expect(formattedDate).toBe('2025-05-01');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const currentDate = new Date();
    const formattedDate = formatDate(currentDate, 5);

    expect(formattedDate).toBe('2025-10-05');
  });
});
