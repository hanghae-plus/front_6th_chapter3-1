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
  it.only('1월은 31일 수를 반환한다', () => {
    expect(getDaysInMonth(2024, 1)).toBe(31);
    expect(getDaysInMonth(2025, 1)).toBe(31);
  });

  it.only('4월은 30일 일수를 반환한다', () => {
    expect(getDaysInMonth(2024, 4)).toBe(30);
    expect(getDaysInMonth(2025, 4)).toBe(30);
  });

  it.only('윤년의 2월에 대해 29일을 반환한다', () => {
    expect(getDaysInMonth(2020, 2)).toBe(29);
    expect(getDaysInMonth(2024, 2)).toBe(29);
  });

  it.only('평년의 2월에 대해 28일을 반환한다', () => {
    expect(getDaysInMonth(2021, 2)).toBe(28);
    expect(getDaysInMonth(2022, 2)).toBe(28);
    expect(getDaysInMonth(2023, 2)).toBe(28);
    expect(getDaysInMonth(2025, 2)).toBe(28);
  });

  describe('유효하지 않은 월에 대해 적절히 처리한다', () => {
    it.only('월이 0일 때 이전 해의 12월 일수를 반환한다', () => {
      expect(getDaysInMonth(2025, 0)).toBe(31); // 24년 12월
    });

    it.only('월이 음수일 때 이전 해의 해당 월 일수를 반환한다', () => {
      expect(getDaysInMonth(2025, -1)).toBe(30); // 24년 11월
      expect(getDaysInMonth(2025, -10)).toBe(29); // 24년 2월
    });

    it.only('월이 12를 초과할 때 다음 해의 해당 월 일수를 반환한다', () => {
      expect(getDaysInMonth(2025, 13)).toBe(31); // 26년 1월
    });
  });
});

describe('getWeekDates', () => {
  it.only('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date('2025-08-06');
    const weekDates = getWeekDates(date);

    expect(weekDates).toHaveLength(7);
    expect(weekDates).toEqual([
      new Date('2025-08-03'),
      new Date('2025-08-04'),
      new Date('2025-08-05'),
      new Date('2025-08-06'),
      new Date('2025-08-07'),
      new Date('2025-08-08'),
      new Date('2025-08-09'),
    ]);
  });

  it.only('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date('2025-08-04');
    const weekDates = getWeekDates(date);

    expect(weekDates).toHaveLength(7);
    expect(weekDates).toEqual([
      new Date('2025-08-03'),
      new Date('2025-08-04'),
      new Date('2025-08-05'),
      new Date('2025-08-06'),
      new Date('2025-08-07'),
      new Date('2025-08-08'),
      new Date('2025-08-09'),
    ]);
  });

  it.only('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date('2025-08-03');
    const weekDates = getWeekDates(date);

    expect(weekDates).toHaveLength(7);
    expect(weekDates).toEqual([
      new Date('2025-08-03'),
      new Date('2025-08-04'),
      new Date('2025-08-05'),
      new Date('2025-08-06'),
      new Date('2025-08-07'),
      new Date('2025-08-08'),
      new Date('2025-08-09'),
    ]);
  });

  it.only('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const date = new Date('2025-12-31');
    const weekDates = getWeekDates(date);

    expect(weekDates).toHaveLength(7);
    expect(weekDates).toEqual([
      new Date('2025-12-28'),
      new Date('2025-12-29'),
      new Date('2025-12-30'),
      new Date('2025-12-31'),
      new Date('2026-01-01'),
      new Date('2026-01-02'),
      new Date('2026-01-03'),
    ]);
  });

  it.only('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const date = new Date('2025-01-01');
    const weekDates = getWeekDates(date);

    expect(weekDates).toHaveLength(7);
    expect(weekDates).toEqual([
      new Date('2024-12-29'),
      new Date('2024-12-30'),
      new Date('2024-12-31'),
      new Date('2025-01-01'),
      new Date('2025-01-02'),
      new Date('2025-01-03'),
      new Date('2025-01-04'),
    ]);
  });

  it.only('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const date = new Date('2024-02-29');
    const weekDates = getWeekDates(date);

    expect(weekDates).toHaveLength(7);
    expect(weekDates).toEqual([
      new Date('2024-02-25'),
      new Date('2024-02-26'),
      new Date('2024-02-27'),
      new Date('2024-02-28'),
      new Date('2024-02-29'),
      new Date('2024-03-01'),
      new Date('2024-03-02'),
    ]);
  });

  it.only('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const date = new Date('2025-08-31');
    const weekDates = getWeekDates(date);

    expect(weekDates).toHaveLength(7);
    expect(weekDates).toEqual([
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
  it.only('2025년 8월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const date = new Date('2025-08-01');
    const weeks = getWeeksAtMonth(date);

    expect(weeks).toHaveLength(6);
    expect(weeks[0]).toEqual([null, null, null, null, null, 1, 2]);
    expect(weeks[1]).toEqual([3, 4, 5, 6, 7, 8, 9]);
    expect(weeks[2]).toEqual([10, 11, 12, 13, 14, 15, 16]);
    expect(weeks[3]).toEqual([17, 18, 19, 20, 21, 22, 23]);
    expect(weeks[4]).toEqual([24, 25, 26, 27, 28, 29, 30]);
    expect(weeks[5]).toEqual([31, null, null, null, null, null, null]);
  });
});

describe('getEventsForDay', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '회의',
      date: '2025-08-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀 회의',
      location: '회의실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '점심',
      date: '2025-08-01',
      startTime: '12:00',
      endTime: '13:00',
      description: '점심 약속',
      location: '식당',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '3',
      title: '운동',
      date: '2025-08-15',
      startTime: '18:00',
      endTime: '19:00',
      description: '헬스장',
      location: '헬스장',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  it.only('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const result = getEventsForDay(mockEvents, 1);

    expect(result).toHaveLength(2);
    expect(result[0]).toBe(mockEvents[0]);
    expect(result[1]).toBe(mockEvents[1]);
  });

  it.only('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(mockEvents, 10);

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it.only('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(mockEvents, 0);

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it.only('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(mockEvents, 32);

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });
});

describe('formatWeek', () => {
  it.only('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-08-15');
    const result = formatWeek(date);

    expect(result).toBe('2025년 8월 2주');
  });

  it.only('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-08-03');
    const result = formatWeek(date);

    expect(result).toBe('2025년 8월 1주');
  });

  it.only('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-08-24');
    const result = formatWeek(date);

    expect(result).toBe('2025년 8월 4주');
  });

  it.only('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-01-01');
    const result = formatWeek(date);

    expect(result).toBe('2025년 1월 1주');
  });

  it.only('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2024-02-29');
    const result = formatWeek(date);

    expect(result).toBe('2024년 2월 5주');
  });

  it.only('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-02-28');
    const result = formatWeek(date);

    expect(result).toBe('2025년 2월 4주');
  });
});

describe('formatMonth', () => {
  it.only("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    const date = new Date('2025-07-10');
    const result = formatMonth(date);
    
    expect(result).toBe('2025년 7월');
  });

  it.only("2025년 8월 1일을 '2025년 8월'로 반환한다", () => {
    const date = new Date('2025-08-01');
    const result = formatMonth(date);
    
    expect(result).toBe('2025년 8월');
  });

  it.only("2024년 2월 29일을 '2024년 2월'로 반환한다 (윤년)", () => {
    const date = new Date('2024-02-29');
    const result = formatMonth(date);
    
    expect(result).toBe('2024년 2월');
  });

  it.only("2025년 12월 31일을 '2025년 12월'로 반환한다", () => {
    const date = new Date('2025-12-31');
    const result = formatMonth(date);
    
    expect(result).toBe('2025년 12월');
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
