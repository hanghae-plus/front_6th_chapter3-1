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
    // January(31 days) 테스트
    const days = getDaysInMonth(2025, 1);
    expect(days).toBe(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    // April(30 days) 테스트
    const days = getDaysInMonth(2025, 4);
    expect(days).toBe(30);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    const days = getDaysInMonth(2024, 2);
    expect(days).toBe(29);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    const days = getDaysInMonth(2026, 2);
    expect(days).toBe(28);
  });

  it('유효하지 않은 월에 대해 적절히 처리한다', () => {
    const days = getDaysInMonth(2025, 200);
    expect(days).toBe(31);
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const wednesday = new Date(2025, 6, 9);
    const weekDates = getWeekDates(wednesday);

    expect(weekDates.length).toBe(7);
    expect(weekDates[0].toISOString().slice(0, 10)).toBe('2025-07-06'); // 일요일
    expect(weekDates[1].toISOString().slice(0, 10)).toBe('2025-07-07'); // 월요일
    expect(weekDates[2].toISOString().slice(0, 10)).toBe('2025-07-08'); // 화요일
    expect(weekDates[3].toISOString().slice(0, 10)).toBe('2025-07-09'); // 수요일
    expect(weekDates[4].toISOString().slice(0, 10)).toBe('2025-07-10'); // 목요일
    expect(weekDates[5].toISOString().slice(0, 10)).toBe('2025-07-11'); // 금요일
    expect(weekDates[6].toISOString().slice(0, 10)).toBe('2025-07-12'); // 토요일
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const monday = new Date(2025, 6, 7); // 2025-07-07은 월요일
    // 월요일을 기준으로 주의 날짜들을 구한다
    const weekDates = getWeekDates(monday);

    expect(weekDates.length).toBe(7);
    expect(weekDates[0].toISOString().slice(0, 10)).toBe('2025-07-06'); // 일요일
    expect(weekDates[1].toISOString().slice(0, 10)).toBe('2025-07-07'); // 월요일
    expect(weekDates[2].toISOString().slice(0, 10)).toBe('2025-07-08'); // 화요일
    expect(weekDates[3].toISOString().slice(0, 10)).toBe('2025-07-09'); // 수요일
    expect(weekDates[4].toISOString().slice(0, 10)).toBe('2025-07-10'); // 목요일
    expect(weekDates[5].toISOString().slice(0, 10)).toBe('2025-07-11'); // 금요일
    expect(weekDates[6].toISOString().slice(0, 10)).toBe('2025-07-12'); // 토요일
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const sunday = new Date(2025, 6, 6); // 2025-07-06은 일요일
    const weekDates = getWeekDates(sunday);

    expect(weekDates.length).toBe(7);
    expect(weekDates[0].toISOString().slice(0, 10)).toBe('2025-07-06'); // 월요일
    expect(weekDates[1].toISOString().slice(0, 10)).toBe('2025-07-07'); // 월요일
    expect(weekDates[2].toISOString().slice(0, 10)).toBe('2025-07-08'); // 화요일
    expect(weekDates[3].toISOString().slice(0, 10)).toBe('2025-07-09'); // 수요일
    expect(weekDates[4].toISOString().slice(0, 10)).toBe('2025-07-10'); // 목요일
    expect(weekDates[5].toISOString().slice(0, 10)).toBe('2025-07-11'); // 금요일
    expect(weekDates[6].toISOString().slice(0, 10)).toBe('2025-07-12'); // 토요일
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const wednesday = new Date(2025, 11, 31);
    const weekDates = getWeekDates(wednesday);

    expect(weekDates.length).toBe(7);
    expect(weekDates[0].toISOString().slice(0, 10)).toBe('2025-12-28'); // 일요일
    expect(weekDates[1].toISOString().slice(0, 10)).toBe('2025-12-29'); // 월요일
    expect(weekDates[2].toISOString().slice(0, 10)).toBe('2025-12-30'); // 화요일
    expect(weekDates[3].toISOString().slice(0, 10)).toBe('2025-12-31'); // 수요일
    expect(weekDates[4].toISOString().slice(0, 10)).toBe('2026-01-01'); // 목요일
    expect(weekDates[5].toISOString().slice(0, 10)).toBe('2026-01-02'); // 금요일
    expect(weekDates[6].toISOString().slice(0, 10)).toBe('2026-01-03'); // 토요일
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const wednesday = new Date(2026, 0, 1);
    const weekDates = getWeekDates(wednesday);

    expect(weekDates.length).toBe(7);
    expect(weekDates[0].toISOString().slice(0, 10)).toBe('2025-12-28');
    expect(weekDates[1].toISOString().slice(0, 10)).toBe('2025-12-29');
    expect(weekDates[2].toISOString().slice(0, 10)).toBe('2025-12-30');
    expect(weekDates[3].toISOString().slice(0, 10)).toBe('2025-12-31');
    expect(weekDates[4].toISOString().slice(0, 10)).toBe('2026-01-01');
    expect(weekDates[5].toISOString().slice(0, 10)).toBe('2026-01-02');
    expect(weekDates[6].toISOString().slice(0, 10)).toBe('2026-01-03');
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    // 2024년 2월 29일(목요일)은 윤년의 2월 29일이다.
    const leapFeb = new Date(2024, 1, 29); // 2024-02-29
    const weekDates = getWeekDates(leapFeb);

    expect(weekDates.length).toBe(7);
    expect(weekDates[0].toISOString().slice(0, 10)).toBe('2024-02-25'); // 일요일
    expect(weekDates[1].toISOString().slice(0, 10)).toBe('2024-02-26'); // 월요일
    expect(weekDates[2].toISOString().slice(0, 10)).toBe('2024-02-27'); // 화요일
    expect(weekDates[3].toISOString().slice(0, 10)).toBe('2024-02-28'); // 수요일
    expect(weekDates[4].toISOString().slice(0, 10)).toBe('2024-02-29'); // 목요일 (윤년 2월 29일)
    expect(weekDates[5].toISOString().slice(0, 10)).toBe('2024-03-01'); // 금요일
    expect(weekDates[6].toISOString().slice(0, 10)).toBe('2024-03-02'); // 토요일
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    // 2025년 12월 31일(수요일)을 기준으로 테스트
    const wednesday = new Date(2025, 11, 31); // 2025-12-31
    const weekDates = getWeekDates(wednesday);

    expect(weekDates.length).toBe(7);
    expect(weekDates[0].toISOString().slice(0, 10)).toBe('2025-12-28'); // 일요일
    expect(weekDates[1].toISOString().slice(0, 10)).toBe('2025-12-29'); // 월요일
    expect(weekDates[2].toISOString().slice(0, 10)).toBe('2025-12-30'); // 화요일
    expect(weekDates[3].toISOString().slice(0, 10)).toBe('2025-12-31'); // 수요일 (월의 마지막 날)
    expect(weekDates[4].toISOString().slice(0, 10)).toBe('2026-01-01'); // 목요일 (다음 해 1월)
    expect(weekDates[5].toISOString().slice(0, 10)).toBe('2026-01-02'); // 금요일
    expect(weekDates[6].toISOString().slice(0, 10)).toBe('2026-01-03'); // 토요일
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const days = new Date(2025, 6, 1);
    const weekInfo = getWeeksAtMonth(days);
    expect(weekInfo).toEqual([
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
    const events: Event[] = [
      {
        id: '1',
        title: '테스트1',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '테스트2',
        date: '2025-07-02',
        startTime: '12:00',
        endTime: '13:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '테스트3',
        date: '2025-07-01',
        startTime: '14:00',
        endTime: '15:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ];
    // 1일에 해당하는 이벤트만 반환해야 함
    const result = getEventsForDay(events, 1);
    expect(result).toHaveLength(2);
    expect(result.map((e) => e.id)).toEqual(expect.arrayContaining(['1', '3']));
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    // 테스트용 이벤트 배열
    const events: Event[] = [
      {
        id: '1',
        title: '테스트1',
        date: '2025-07-03',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '테스트2',
        date: '2025-07-02',
        startTime: '12:00',
        endTime: '13:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '테스트3',
        date: '2025-07-04',
        startTime: '14:00',
        endTime: '15:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ];
    // 1일에 해당하는 이벤트만 반환해야 함
    const result = getEventsForDay(events, 1);
    expect(result).toHaveLength(0);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '테스트1',
        date: '2025-07-03',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ];

    const result = getEventsForDay(events, 0);
    expect(result).toHaveLength(0);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '테스트1',
        date: '2025-07-32',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ];

    const result = getEventsForDay(events, 32);
    expect(result).toHaveLength(0);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date(2025, 6, 10); // 2025-07-10
    expect(formatWeek(date)).toBe('2025년 7월 2주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date(2025, 6, 1); // 2025-07-01
    expect(formatWeek(date)).toBe('2025년 7월 1주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date(2025, 6, 31); // 2025-07-31
    expect(formatWeek(date)).toBe('2025년 7월 5주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date(2024, 11, 31); // 2024-12-31
    expect(formatWeek(date)).toBe('2025년 1월 1주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date(2024, 1, 29); // 2024-02-29
    expect(formatWeek(date)).toBe('2024년 2월 5주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date(2025, 1, 28); // 2025-02-28
    expect(formatWeek(date)).toBe('2025년 2월 4주');
  });
});

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    const date = new Date(2025, 6, 10);
    expect(formatMonth(date)).toBe('2025년 7월');
  });
});

describe('isDateInRange', () => {
  it('범위 내의 날짜 2025-07-10에 대해 true를 반환한다', () => {
    expect(
      isDateInRange(
        new Date(2025, 6, 10), // 2025-07-10
        new Date(2025, 6, 1), // 2025-07-01
        new Date(2025, 6, 31) // 2025-07-31
      )
    ).toBe(true);
  });

  it('범위의 시작일 2025-07-01에 대해 true를 반환한다', () => {
    expect(
      isDateInRange(
        new Date(2025, 6, 1), // 2025-07-01
        new Date(2025, 6, 1), // 2025-07-01
        new Date(2025, 6, 31) // 2025-07-31
      )
    ).toBe(true);
  });

  it('범위의 종료일 2025-07-31에 대해 true를 반환한다', () => {
    expect(
      isDateInRange(
        new Date(2025, 6, 31), // 2025-07-31
        new Date(2025, 6, 1), // 2025-07-01
        new Date(2025, 6, 31) // 2025-07-31
      )
    ).toBe(true);
  });

  it('범위 이전의 날짜 2025-06-30에 대해 false를 반환한다', () => {
    expect(
      isDateInRange(
        new Date(2025, 5, 30), // 2025-06-30
        new Date(2025, 6, 1), // 2025-07-01
        new Date(2025, 6, 31) // 2025-07-31
      )
    ).toBe(false);
  });

  it('범위 이후의 날짜 2025-08-01에 대해 false를 반환한다', () => {
    expect(
      isDateInRange(
        new Date(2025, 7, 1), // 2025-08-01
        new Date(2025, 6, 1), // 2025-07-01
        new Date(2025, 6, 31) // 2025-07-31
      )
    ).toBe(false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    expect(
      isDateInRange(
        new Date(2025, 6, 10), // 2025-07-10
        new Date(2025, 6, 31), // 2025-07-31
        new Date(2025, 6, 1) // 2025-07-01
      )
    ).toBe(false);
    expect(
      isDateInRange(
        new Date(2025, 6, 1), // 2025-07-01
        new Date(2025, 6, 31), // 2025-07-31
        new Date(2025, 6, 1) // 2025-07-01
      )
    ).toBe(false);
    expect(
      isDateInRange(
        new Date(2025, 6, 31), // 2025-07-31
        new Date(2025, 6, 31), // 2025-07-31
        new Date(2025, 6, 1) // 2025-07-01
      )
    ).toBe(false);
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
    expect(fillZero(7)).toBe('07');
  });

  it('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    expect(fillZero(1234, 2)).toBe('1234');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    expect(formatDate(new Date(2025, 6, 10))).toBe('2025-07-10');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    expect(formatDate(new Date(2025, 6, 1), 15)).toBe('2025-07-15');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    expect(formatDate(new Date(2025, 2, 10))).toBe('2025-03-10');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    expect(formatDate(new Date(2025, 6, 5))).toBe('2025-07-05');
  });
});
