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
import { createMockEvent } from '../utils';

describe('getDaysInMonth', () => {
  it('1월은 31일을 반환한다', () => {
    const daysInMonth = getDaysInMonth(2025, 1);
    expect(daysInMonth).toBe(31);
  });

  it('4월은 30일을 반환한다', () => {
    const daysInMonth = getDaysInMonth(2025, 4);
    expect(daysInMonth).toBe(30);
  });

  it('윤년(2024년)의 2월에 대해 29일을 반환한다', () => {
    const daysInMonth = getDaysInMonth(2024, 2);
    expect(daysInMonth).toBe(29);
  });

  it('평년(2025년)의 2월에 대해 28일을 반환한다', () => {
    const daysInMonth = getDaysInMonth(2025, 2);
    expect(daysInMonth).toBe(28);
  });

  it('월이 12를 초과하면 자동으로 다음 해로 넘어가서 계산한다', () => {
    const daysInMonth = getDaysInMonth(2025, 13);
    expect(daysInMonth).toBe(31); // 2026년 1월로 처리
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)를 기준으로 해당 주의 전체 날짜들을 반환한다', () => {
    const wednesday = new Date('2025-08-13');
    const weekDates = getWeekDates(wednesday);

    expect(weekDates).toHaveLength(7);
    expect(weekDates[0]).toEqual(new Date('2025-08-10')); // 일요일
    expect(weekDates[6]).toEqual(new Date('2025-08-16')); // 토요일
  });

  it('월요일에 대해 해당 주의 전체 날짜들을 반환한다', () => {
    const monday = new Date('2025-08-11');
    const weekDates = getWeekDates(monday);

    expect(weekDates).toHaveLength(7);
    expect(weekDates[0]).toEqual(new Date('2025-08-10')); // 일요일
    expect(weekDates[6]).toEqual(new Date('2025-08-16')); // 토요일
  });

  it('일요일에 대해 해당 주의 전체 날짜들을 반환한다', () => {
    const sunday = new Date('2025-08-10');
    const weekDates = getWeekDates(sunday);

    expect(weekDates).toHaveLength(7);
    expect(weekDates[0]).toEqual(new Date('2025-08-10')); // 일요일
    expect(weekDates[6]).toEqual(new Date('2025-08-16')); // 토요일
  });

  it('연말이 포함된 주에 대해 해당 주의 날짜들을 올바르게 반환한다', () => {
    const lastDayOfYear = new Date('2025-12-28');

    const weekDates = getWeekDates(lastDayOfYear).map((d) => d.getDate());
    expect(weekDates).toEqual([28, 29, 30, 31, 1, 2, 3]);
  });

  it('연초가 포함된 주에 대해 해당 주의 날짜들을 올바르게 반환한다', () => {
    const firstDayOfYear = new Date('2026-01-01');

    const weekDates = getWeekDates(firstDayOfYear).map((d) => d.getDate());
    expect(weekDates).toEqual([28, 29, 30, 31, 1, 2, 3]);
  });

  it('윤년의 2월 29일을 포함한 주에 대해 해당 주의 날짜들을 올바르게 반환한다', () => {
    const leapYear = new Date('2024-02-29');

    const weekDates = getWeekDates(leapYear).map((d) => d.getDate());
    expect(weekDates).toEqual([25, 26, 27, 28, 29, 1, 2]);
  });

  it('월의 마지막을 포함한 주에 대해 해당 주의 날짜들을 반환한다', () => {
    const sundayEndOfMonth = new Date('2025-08-31');
    const weekDates = getWeekDates(sundayEndOfMonth).map((d) => d.getDate());

    expect(weekDates).toEqual([31, 1, 2, 3, 4, 5, 6]);
  });
});

describe('getWeeksAtMonth', () => {
  it('입력된 날짜가 속한 월을 주 단위 배열로 반환한다 (빈 요일은 null 처리)', () => {
    const weeksAtMonth = getWeeksAtMonth(new Date('2025-07-01'));

    expect(weeksAtMonth).toEqual([
      [null, null, 1, 2, 3, 4, 5],
      [6, 7, 8, 9, 10, 11, 12],
      [13, 14, 15, 16, 17, 18, 19],
      [20, 21, 22, 23, 24, 25, 26],
      [27, 28, 29, 30, 31, null, null],
    ]);
  });

  it('평년의 2월 28일로 끝나는 월의 주 단의 배열을 올바르게 처리한다', () => {
    const weeksAtMonth = getWeeksAtMonth(new Date('2025-02-28'));

    expect(weeksAtMonth).toEqual([
      [null, null, null, null, null, null, 1],
      [2, 3, 4, 5, 6, 7, 8],
      [9, 10, 11, 12, 13, 14, 15],
      [16, 17, 18, 19, 20, 21, 22],
      [23, 24, 25, 26, 27, 28, null],
    ]);
  });

  it('윤년의 2월 29일로 끝나는 월의 주 단의 배열을 올바르게 처리한다', () => {
    const weeksAtMonth = getWeeksAtMonth(new Date('2024-02-29'));

    expect(weeksAtMonth).toEqual([
      [null, null, null, null, 1, 2, 3],
      [4, 5, 6, 7, 8, 9, 10],
      [11, 12, 13, 14, 15, 16, 17],
      [18, 19, 20, 21, 22, 23, 24],
      [25, 26, 27, 28, 29, null, null],
    ]);
  });
});

describe('getEventsForDay', () => {
  //이벤트 생성
  const events = [
    createMockEvent(1, { date: '2025-08-01' }),
    createMockEvent(2, { date: '2025-08-12' }),
    createMockEvent(3, { date: '2025-08-28' }),
  ];

  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const eventsForDay = getEventsForDay(events, 1);
    expect(eventsForDay).toEqual([events[0]]);
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const eventsForDay = getEventsForDay(events, 4);
    expect(eventsForDay).toEqual([]);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const eventsForDay = getEventsForDay(events, 0);
    expect(eventsForDay).toEqual([]);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const eventsForDay = getEventsForDay(events, 32);
    expect(eventsForDay).toEqual([]);
  });
});

describe('formatWeek (목요일 기준으로 월/주차를 계산)', () => {
  it('월 중간 날짜 입력 시 해당 월과 주차를 반환한다', () => {
    const week = formatWeek(new Date('2025-08-15'));
    expect(week).toBe('2025년 8월 2주');
  });

  it('월 초 날짜가 속한 주가 이전 달에 포함되면 이전 달과 주차를 반환한다', () => {
    const week = formatWeek(new Date('2025-08-01'));
    expect(week).toBe('2025년 7월 5주');
  });

  it('월 말 날짜가 속한 주가 다음 달에 포함되면 다음 달과 주차를 반환한다', () => {
    const week = formatWeek(new Date('2025-08-31'));
    expect(week).toBe('2025년 9월 1주');
  });

  it('해당 주가 연도를 넘어가면, 다음 해의 연도와 주차를 반환한다', () => {
    const week = formatWeek(new Date('2025-12-28'));
    expect(week).toBe('2026년 1월 1주');
  });

  it('윤년(2024년) 2월의 마지막 날짜 입력 시 해당 월과 주차를 올바르게 반환한다', () => {
    const week = formatWeek(new Date('2024-02-29'));
    expect(week).toBe('2024년 2월 5주');
  });

  it('평년(2025년) 2월의 마지막 날짜 입력 시 해당 월과 주차를 올바르게 반환한다', () => {
    const week = formatWeek(new Date('2025-02-28'));
    expect(week).toBe('2025년 2월 4주');
  });
});

describe('formatMonth', () => {
  it('주어진 날짜의 연도와 월을 "YYYY년 M월" 형식으로 반환한다', () => {
    const month = formatMonth(new Date('2025-07-10'));
    expect(month).toBe('2025년 7월');
  });

  it('연도가 바뀌는 날짜도 올바르게 처리한다', () => {
    const month = formatMonth(new Date('2026-01-01'));
    expect(month).toBe('2026년 1월');
  });
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
