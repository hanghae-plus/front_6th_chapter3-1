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
    expect(getDaysInMonth(new Date().getFullYear(), 1)).toBe(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    expect(getDaysInMonth(new Date().getFullYear(), 4)).toBe(30);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    expect(getDaysInMonth(2024, 2)).toBe(29);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    expect(getDaysInMonth(2025, 2)).toBe(28);
  });

  it('유효하지 않은 월에 대해 적절히 처리한다', () => {
    // NOTE
    // 1~12 범위 외의 숫자를 전달하면 다음 해로 넘어가서 계산됨
    // 함수 getDaysInMonth 내부에 13 이상의 숫자를 전달했을 때 처리하는 코드가 있어야 함
    expect(getDaysInMonth(2025, 20)).toBe(null);
  });
});

describe('getWeekDates', () => {
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
    expect(getWeekDates(new Date('2025-08-24'))).toEqual([
      new Date('2025-08-24'),
      new Date('2025-08-25'),
      new Date('2025-08-26'),
      new Date('2025-08-27'),
      new Date('2025-08-28'),
      new Date('2025-08-29'),
      new Date('2025-08-30'),
    ]);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    expect(getWeekDates(new Date('2025-12-30'))).toEqual([
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
    expect(getWeekDates(new Date('2025-01-01'))).toEqual([
      new Date('2024-12-29'),
      new Date('2024-12-30'),
      new Date('2024-12-31'),
      new Date('2025-01-01'),
      new Date('2025-01-02'),
      new Date('2025-01-03'),
      new Date('2025-01-04'),
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

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    expect(getWeekDates(new Date('2025-08-31'))).toEqual([
      new Date('2025-08-31'),
      new Date('2025-09-01'),
      new Date('2025-09-02'),
      new Date('2025-09-03'),
      new Date('2025-09-04'),
      new Date('2025-09-05'),
      new Date('2025-09-06'),
    ]);
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
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
    const event0801: Event = {
      date: '2025-08-01',
      title: '',
      category: '',
      description: '',
      endTime: '',
      startTime: '',
      id: '',
      location: '',
      notificationTime: 0,
      repeat: { interval: 0, type: 'daily', endDate: '' },
    };

    const event0802: Event = {
      date: '2025-08-02',
      title: '',
      category: '',
      description: '',
      endTime: '',
      startTime: '',
      id: '',
      location: '',
      notificationTime: 0,
      repeat: { interval: 0, type: 'daily', endDate: '' },
    };

    const event: Event[] = [event0801, event0802];
    const expected: Event[] = [event0801];

    expect(getEventsForDay(event, 1)).toEqual(expected);
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const event: Event[] = [
      {
        date: '2025-08-01',
        title: '',
        category: '',
        description: '',
        endTime: '',
        startTime: '',
        id: '',
        location: '',
        notificationTime: 0,
        repeat: { interval: 0, type: 'daily', endDate: '' },
      },
      {
        date: '2025-08-02',
        title: '',
        category: '',
        description: '',
        endTime: '',
        startTime: '',
        id: '',
        location: '',
        notificationTime: 0,
        repeat: { interval: 0, type: 'daily', endDate: '' },
      },
    ];

    expect(getEventsForDay(event, 3)).toEqual([]);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const event: Event[] = [
      {
        date: '2025-08-00',
        title: '',
        category: '',
        description: '',
        endTime: '',
        startTime: '',
        id: '',
        location: '',
        notificationTime: 0,
        repeat: { interval: 0, type: 'daily', endDate: '' },
      },
      {
        date: '2025-08-00',
        title: '',
        category: '',
        description: '',
        endTime: '',
        startTime: '',
        id: '',
        location: '',
        notificationTime: 0,
        repeat: { interval: 0, type: 'daily', endDate: '' },
      },
    ];

    expect(getEventsForDay(event, 0)).toEqual([]);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const event: Event[] = [
      {
        date: '2025-08-32',
        title: '',
        category: '',
        description: '',
        endTime: '',
        startTime: '',
        id: '',
        location: '',
        notificationTime: 0,
        repeat: { interval: 0, type: 'daily', endDate: '' },
      },
      {
        date: '2025-08-33',
        title: '',
        category: '',
        description: '',
        endTime: '',
        startTime: '',
        id: '',
        location: '',
        notificationTime: 0,
        repeat: { interval: 0, type: 'daily', endDate: '' },
      },
    ];

    expect(getEventsForDay(event, 32)).toEqual([]);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {});

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {});

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {});

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {});

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {});

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {});
});

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    expect(formatMonth(new Date('2025-07-10'))).toBe('2025년 7월');
  });
});

describe('isDateInRange', () => {
  it('범위 내의 날짜 2025-07-10에 대해 true를 반환한다', () => {
    expect(
      isDateInRange(new Date('2025-07-10'), new Date('2025-07-05'), new Date('2025-07-15'))
    ).toBe(true);
  });

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
