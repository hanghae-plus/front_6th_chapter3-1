import { Event } from '../../types';
import realEvents from '../../__mocks__/response/realEvents.json';
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
    const days = getDaysInMonth(2024, 2);
    expect(days).toBe(29);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    const days = getDaysInMonth(2023, 2);
    expect(days).toBe(28);
  });

  // it('유효하지 않은 월에 대해 적절히 처리한다', () => {
  //   expect(() => getDaysInMonth(2025, 0)).toThrow();
  //   expect(() => getDaysInMonth(2025, 13)).toThrow();
  //   expect(() => getDaysInMonth(2025, -1)).toThrow();
  // });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date('2025-08-20'); // 수요일
    const week = getWeekDates(date);
    const expected = [
      'Sun Aug 17 2025',
      'Mon Aug 18 2025',
      'Tue Aug 19 2025',
      'Wed Aug 20 2025',
      'Thu Aug 21 2025',
      'Fri Aug 22 2025',
      'Sat Aug 23 2025',
    ];

    expect(week.map((day) => day.toDateString())).toEqual(expected);
  });

  // 주의 시작을 일요일로 두고 테스트 (월 -> 일)
  it('주의 시작(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date('2025-08-17');
    const week = getWeekDates(date);
    const expected = [
      'Sun Aug 17 2025',
      'Mon Aug 18 2025',
      'Tue Aug 19 2025',
      'Wed Aug 20 2025',
      'Thu Aug 21 2025',
      'Fri Aug 22 2025',
      'Sat Aug 23 2025',
    ];

    expect(week.map((day) => day.toDateString())).toEqual(expected);
  });

  // 주의 끝을 토요일로 두고 테스트 (일 -> 토)
  it('주의 끝(토요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date('2025-08-23');
    const week = getWeekDates(date);
    const expected = [
      'Sun Aug 17 2025',
      'Mon Aug 18 2025',
      'Tue Aug 19 2025',
      'Wed Aug 20 2025',
      'Thu Aug 21 2025',
      'Fri Aug 22 2025',
      'Sat Aug 23 2025',
    ];

    expect(week.map((day) => day.toDateString())).toEqual(expected);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const date = new Date('2024-12-31');
    const week = getWeekDates(date);
    const expected = [
      'Sun Dec 29 2024',
      'Mon Dec 30 2024',
      'Tue Dec 31 2024',
      'Wed Jan 01 2025',
      'Thu Jan 02 2025',
      'Fri Jan 03 2025',
      'Sat Jan 04 2025',
    ];

    expect(week.map((day) => day.toDateString())).toEqual(expected);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const date = new Date('2025-01-01');
    const week = getWeekDates(date);
    const expected = [
      'Sun Dec 29 2024',
      'Mon Dec 30 2024',
      'Tue Dec 31 2024',
      'Wed Jan 01 2025',
      'Thu Jan 02 2025',
      'Fri Jan 03 2025',
      'Sat Jan 04 2025',
    ];

    expect(week.map((day) => day.toDateString())).toEqual(expected);
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const date = new Date('2024-02-29');
    const week = getWeekDates(date);
    const expected = [
      'Sun Feb 25 2024',
      'Mon Feb 26 2024',
      'Tue Feb 27 2024',
      'Wed Feb 28 2024',
      'Thu Feb 29 2024',
      'Fri Mar 01 2024',
      'Sat Mar 02 2024',
    ];

    expect(week.map((day) => day.toDateString())).toEqual(expected);
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const date = new Date('2025-08-31');
    const week = getWeekDates(date);
    const expected = [
      'Sun Aug 31 2025',
      'Mon Sep 01 2025',
      'Tue Sep 02 2025',
      'Wed Sep 03 2025',
      'Thu Sep 04 2025',
      'Fri Sep 05 2025',
      'Sat Sep 06 2025',
    ];

    expect(week.map((day) => day.toDateString())).toEqual(expected);
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const date = new Date('2025-07-01');
    const weeks = getWeeksAtMonth(date);
    const expected = [
      [null, null, 1, 2, 3, 4, 5],
      [6, 7, 8, 9, 10, 11, 12],
      [13, 14, 15, 16, 17, 18, 19],
      [20, 21, 22, 23, 24, 25, 26],
      [27, 28, 29, 30, 31, null, null],
    ];

    expect(weeks).toEqual(expected);
  });
});

describe('getEventsForDay', () => {
  const events = realEvents.events as Event[];

  // 20일에 해당하는 이벤트 확인 (1일 -> 20일)
  it('특정 날짜(20일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const result = getEventsForDay(events, 20);
    expect(result).toEqual([
      {
        id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
        title: '팀 회의',
        date: '2025-08-20',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ]);
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(events, 19);
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
    const date = new Date('2025-08-15');
    const formattedDate = formatWeek(date);
    expect(formattedDate).toBe('2025년 8월 2주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-08-01');
    const formattedDate = formatWeek(date);
    expect(formattedDate).toBe('2025년 7월 5주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-08-31');
    const formattedDate = formatWeek(date);
    expect(formattedDate).toBe('2025년 9월 1주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2024-12-31');
    const formattedDate = formatWeek(date);
    expect(formattedDate).toBe('2025년 1월 1주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2024-02-29');
    const formattedDate = formatWeek(date);
    expect(formattedDate).toBe('2024년 2월 5주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-02-28');
    const formattedDate = formatWeek(date);
    expect(formattedDate).toBe('2025년 2월 4주');
  });
});

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    const date = new Date('2025-07-10');
    const formattedDate = formatMonth(date);
    expect(formattedDate).toBe('2025년 7월');
  });
});

describe('isDateInRange', () => {
  const startDate = new Date('2025-07-01');
  const endDate = new Date('2025-07-31');

  it('범위 내의 날짜 2025-07-10에 대해 true를 반환한다', () => {
    const date = new Date('2025-07-10');
    const result = isDateInRange(date, startDate, endDate);
    expect(result).toBe(true);
  });

  it('범위의 시작일 2025-07-01에 대해 true를 반환한다', () => {
    const date = new Date('2025-07-01');
    const result = isDateInRange(date, startDate, endDate);
    expect(result).toBe(true);
  });

  it('범위의 종료일 2025-07-31에 대해 true를 반환한다', () => {
    const date = new Date('2025-07-31');
    const result = isDateInRange(date, startDate, endDate);
    expect(result).toBe(true);
  });

  it('범위 이전의 날짜 2025-06-30에 대해 false를 반환한다', () => {
    const date = new Date('2025-06-30');
    const result = isDateInRange(date, startDate, endDate);
    expect(result).toBe(false);
  });

  it('범위 이후의 날짜 2025-08-01에 대해 false를 반환한다', () => {
    const date = new Date('2025-08-01');
    const result = isDateInRange(date, startDate, endDate);
    expect(result).toBe(false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const startDate = new Date('2025-08-01');
    const endDate = new Date('2025-07-31');

    expect(isDateInRange(new Date('2025-07-10'), startDate, endDate)).toBe(false);
    expect(isDateInRange(new Date('2025-08-01'), startDate, endDate)).toBe(false);
    expect(isDateInRange(new Date('2025-07-31'), startDate, endDate)).toBe(false);
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
    expect(fillZero(6)).toBe('06');
    expect(fillZero(18)).toBe('18');
  });

  it('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    expect(fillZero(12345, 3)).toBe('12345');
    expect(fillZero(987, 2)).toBe('987');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    const date = new Date('2025-08-17');
    const formattedDate = formatDate(date);
    expect(formattedDate).toBe('2025-08-17');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    const date = new Date('2025-08-17');
    const formattedDate = formatDate(date, 18);
    expect(formattedDate).toBe('2025-08-18');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const date = new Date('2025-02-17');
    const formattedDate = formatDate(date);
    expect(formattedDate).toBe('2025-02-17');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const date = new Date('2025-08-07');
    const formattedDate = formatDate(date);
    expect(formattedDate).toBe('2025-08-07');
  });
});
