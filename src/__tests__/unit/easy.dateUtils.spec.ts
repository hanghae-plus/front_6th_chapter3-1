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

  describe('잘못된 월 입력 처리', () => {
    it('13월 입력 시 이전 달(12월)의 일수인 31일을 반환한다', () => {
      expect(getDaysInMonth(2025, 13)).toBe(31);
    });

    it('0월 입력 시 이전 달(12월)의 일수인 31일을 반환한다', () => {
      expect(getDaysInMonth(2025, 0)).toBe(31);
    });

    it('-1월 입력 시 이전 달(11월)의 일수인 30일을 반환한다', () => {
      expect(getDaysInMonth(2025, -1)).toBe(30);
    });
  });
});
describe('getWeekDates', () => {
  describe('일반 케이스', () => {
    it('수요일(2025-08-20)을 기준으로 해당 주의 7일을 반환한다', () => {
      const date = new Date('2025-08-20');
      const weekDates = getWeekDates(date);
      expect(weekDates).toHaveLength(7);
      expect(weekDates[0].toISOString().split('T')[0]).toBe('2025-08-17');
      expect(weekDates[6].toISOString().split('T')[0]).toBe('2025-08-23');
    });

    it('월요일(2025-08-18)을 기준으로 해당 주의 7일을 반환한다', () => {
      const date = new Date('2025-08-18');
      const weekDates = getWeekDates(date);
      expect(weekDates).toHaveLength(7);
      expect(weekDates[0].toISOString().split('T')[0]).toBe('2025-08-17');
      expect(weekDates[6].toISOString().split('T')[0]).toBe('2025-08-23');
    });

    it('일요일(2025-08-24)을 기준으로 해당 주의 7일을 반환한다', () => {
      const date = new Date('2025-08-24');
      const weekDates = getWeekDates(date);
      expect(weekDates).toHaveLength(7);
      expect(weekDates[0].toISOString().split('T')[0]).toBe('2025-08-24');
      expect(weekDates[6].toISOString().split('T')[0]).toBe('2025-08-30');
    });
  });

  describe('연도 경계값 처리', () => {
    it('연말(2024-12-30)을 기준으로 이전 연도와 다음 연도에 걸친 주를 반환한다', () => {
      const date = new Date('2024-12-30');
      const weekDates = getWeekDates(date);
      expect(weekDates[0].toISOString().split('T')[0]).toBe('2024-12-29');
      expect(weekDates[6].toISOString().split('T')[0]).toBe('2025-01-04');
    });

    it('연초(2025-01-01)를 기준으로 이전 연도와 다음 연도에 걸친 주를 반환한다', () => {
      const date = new Date('2025-01-01');
      const weekDates = getWeekDates(date);
      expect(weekDates[0].toISOString().split('T')[0]).toBe('2024-12-29');
      expect(weekDates[6].toISOString().split('T')[0]).toBe('2025-01-04');
    });
  });

  describe('특수한 날짜', () => {
    it('윤년의 2월 29일(2024-02-29)을 포함한 주를 올바르게 처리한다', () => {
      const date = new Date('2024-02-29');
      const weekDates = getWeekDates(date);
      expect(weekDates[0].toISOString().split('T')[0]).toBe('2024-02-25');
      expect(weekDates[6].toISOString().split('T')[0]).toBe('2024-03-02');
    });

    it('월의 마지막 날(2025-04-30)을 포함한 주를 올바르게 처리한다', () => {
      const date = new Date('2025-04-30');
      const weekDates = getWeekDates(date);
      expect(weekDates[0].toISOString().split('T')[0]).toBe('2025-04-27');
      expect(weekDates[6].toISOString().split('T')[0]).toBe('2025-05-03');
    });
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const date = new Date('2025-07-01');
    const weeks = getWeeksAtMonth(date);
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
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '항해 발제날',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '항해 발제',
      location: '팀 스파르타',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '표류플러스',
      date: '2025-07-01',
      startTime: '12:00',
      endTime: '13:00',
      description: '표플이들이랑 점심',
      location: '들깨수제비집',
      category: '가족',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    },
    {
      id: '3',
      title: '봉이 먹는 날',
      date: '2025-07-02',
      startTime: '14:00',
      endTime: '15:00',
      description: '봉이 먹는 날',
      location: '봉이뼈해장국',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 5,
    },
    {
      id: '4',
      title: '방탈출',
      date: '2025-07-15',
      startTime: '16:00',
      endTime: '17:00',
      description: '방탈출 카페',
      location: '방탈출 카페',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 60,
    },
  ];

  describe('정상적인 날짜 입력', () => {
    it('1일(2025-07-01)에 해당하는 이벤트 2개를 정확히 반환한다', () => {
      const day = 1;
      const result = getEventsForDay(mockEvents, day);
      expect(result).toHaveLength(2);
      expect(result).toEqual([mockEvents[0], mockEvents[1]]);
    });

    it('2일(2025-07-02)에 해당하는 이벤트 1개를 정확히 반환한다', () => {
      const day = 2;
      const result = getEventsForDay(mockEvents, day);
      expect(result).toHaveLength(1);
      expect(result).toEqual([mockEvents[2]]);
    });
  });

  describe('이벤트가 없는 날짜', () => {
    it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
      const day = 5;
      const result = getEventsForDay(mockEvents, day);
      expect(result).toEqual([]);
    });
  });

  describe('잘못된 날짜 입력', () => {
    it('날짜가 0일 경우 빈 배열을 반환한다', () => {
      const day = 0;
      const result = getEventsForDay(mockEvents, day);
      expect(result).toEqual([]);
    });

    it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
      const day = 32;
      const result = getEventsForDay(mockEvents, day);
      expect(result).toEqual([]);
    });

    it('음수 날짜인 경우 빈 배열을 반환한다', () => {
      const day = -1;
      const result = getEventsForDay(mockEvents, day);
      expect(result).toEqual([]);
    });
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
    const date = new Date('2025-07-10');
    expect(formatMonth(date)).toBe('2025년 7월');
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
