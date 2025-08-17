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

describe('getDaysInMonth: 월의 일수 계산', () => {
  it('1월은 31일을 반환한다', () => {
    expect(getDaysInMonth(2025, 1)).toBe(31);
  });

  it('4월은 30일을 반환한다', () => {
    expect(getDaysInMonth(2025, 4)).toBe(30);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    expect(getDaysInMonth(2024, 2)).toBe(29);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    expect(getDaysInMonth(2025, 2)).toBe(28);
  });

  it('유효하지 않은 월에 대해 적절히 처리한다', () => {
    expect(getDaysInMonth(2025, 13)).toBe(31);
  });
});

describe('getWeekDates: 해당 주의 날짜 집합 반환', () => {
  describe('일반 케이스', () => {
    const [일요일, 월요일, 화요일, 수요일, 목요일, 금요일, 토요일] = [
      new Date('2025-08-17'),
      new Date('2025-08-18'),
      new Date('2025-08-19'),
      new Date('2025-08-20'),
      new Date('2025-08-21'),
      new Date('2025-08-22'),
      new Date('2025-08-23'),
    ];

    it('수요일 기준 해당 주의 날짜들을 반환한다', () => {
      expect(getWeekDates(수요일)).toEqual([
        일요일,
        월요일,
        화요일,
        수요일,
        목요일,
        금요일,
        토요일,
      ]);
    });

    it('월요일 기준 해당 주의 날짜들을 반환한다', () => {
      expect(getWeekDates(월요일)).toEqual([
        일요일,
        월요일,
        화요일,
        수요일,
        목요일,
        금요일,
        토요일,
      ]);
    });

    it('일요일 기준 해당 주의 날짜들을 반환한다', () => {
      expect(getWeekDates(일요일)).toEqual([
        일요일,
        월요일,
        화요일,
        수요일,
        목요일,
        금요일,
        토요일,
      ]);
    });
  });

  describe('연도 경계', () => {
    const [일요일, 월요일, 화요일, 연말날짜, 연초날짜, 금요일, 토요일] = [
      new Date('2025-12-28'),
      new Date('2025-12-29'),
      new Date('2025-12-30'),
      new Date('2025-12-31'),
      new Date('2026-01-01'),
      new Date('2026-01-02'),
      new Date('2026-01-03'),
    ];
    it('연말(12/31 포함 주)을 정확히 처리한다', () => {
      expect(getWeekDates(연말날짜)).toEqual([
        일요일,
        월요일,
        화요일,
        연말날짜,
        연초날짜,
        금요일,
        토요일,
      ]);
    });
    it('연초(01/01 포함 주)을 정확히 처리한다', () => {
      expect(getWeekDates(연초날짜)).toEqual([
        일요일,
        월요일,
        화요일,
        연말날짜,
        연초날짜,
        금요일,
        토요일,
      ]);
    });
  });

  describe('월 경계', () => {
    it('월의 첫 날짜를 포함한 주를 올바르게 처리한다', () => {
      const [일요일, 월요일, 화요일, 수요일, 목요일, 월의_첫_날짜, 토요일] = [
        new Date('2025-07-27'),
        new Date('2025-07-28'),
        new Date('2025-07-29'),
        new Date('2025-07-30'),
        new Date('2025-07-31'),
        new Date('2025-08-01'),
        new Date('2025-08-02'),
      ];
      expect(getWeekDates(월의_첫_날짜)).toEqual([
        일요일,
        월요일,
        화요일,
        수요일,
        목요일,
        월의_첫_날짜,
        토요일,
      ]);
    });
    it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
      const [월의_마지막_날자, 월요일, 화요일, 수요일, 목요일, 금요일, 토요일] = [
        new Date('2025-08-31'),
        new Date('2025-09-01'),
        new Date('2025-09-02'),
        new Date('2025-09-03'),
        new Date('2025-09-04'),
        new Date('2025-09-05'),
        new Date('2025-09-06'),
      ];
      expect(getWeekDates(월의_마지막_날자)).toEqual([
        월의_마지막_날자,
        월요일,
        화요일,
        수요일,
        목요일,
        금요일,
        토요일,
      ]);
    });
  });

  describe('윤년 케이스', () => {
    const [일요일, 월요일, 화요일, 윤년날짜, 목요일, 금요일, 토요일] = [
      new Date('2024-02-25'),
      new Date('2024-02-26'),
      new Date('2024-02-27'),
      new Date('2024-02-28'),
      new Date('2024-02-29'),
      new Date('2024-03-01'),
      new Date('2024-03-02'),
    ];

    it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
      expect(getWeekDates(윤년날짜)).toEqual([
        일요일,
        월요일,
        화요일,
        윤년날짜,
        목요일,
        금요일,
        토요일,
      ]);
    });
  });
});

describe('getWeeksAtMonth: 월 달력 주 배열 생성', () => {
  it('2025년 7월의 주 배열을 반환한다', () => {
    const [첫째주, 둘째주, 셋째주, 넷째주, 다섯째주] = getWeeksAtMonth(new Date('2025-07-01'));

    expect(첫째주).toEqual([null, null, 1, 2, 3, 4, 5]);
    expect(둘째주).toEqual([6, 7, 8, 9, 10, 11, 12]);
    expect(셋째주).toEqual([13, 14, 15, 16, 17, 18, 19]);
    expect(넷째주).toEqual([20, 21, 22, 23, 24, 25, 26]);
    expect(다섯째주).toEqual([27, 28, 29, 30, 31, null, null]);
  });
});

describe('getEventsForDay: 특정 일자의 이벤트 필터링', () => {
  const events = [
    {
      id: '1',
      title: '기존 회의',
      date: '2025-08-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '1',
      title: '기존 회의',
      date: '2025-08-31',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ] as Event[];

  it('1일 이벤트만 반환한다', () => {
    const 특정날짜 = 1;
    const result = getEventsForDay(events, 특정날짜);

    expect(result).toEqual([
      {
        id: '1',
        title: '기존 회의',
        date: '2025-08-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
  });

  it('해당 날짜에 이벤트가 없으면 빈 배열을 반환한다', () => {
    const 특정날짜 = 2;
    const result = getEventsForDay(events, 특정날짜);

    expect(result).toEqual([]);
  });

  it('날짜가 0일이면 빈 배열을 반환한다', () => {
    const 특정날짜 = 0;
    const result = getEventsForDay(events, 특정날짜);

    expect(result).toEqual([]);
  });

  it('날짜가 32일 이상이면 빈 배열을 반환한다', () => {
    const 특정날짜 = 32;
    const result = getEventsForDay(events, 특정날짜);

    expect(result).toEqual([]);
  });
});

describe('formatWeek: 월 기준 주차 포맷', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const 중간날짜 = formatWeek(new Date('2025-08-15'));

    expect(중간날짜).toEqual('2025년 8월 2주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const 첫주 = formatWeek(new Date('2025-08-01'));

    expect(첫주).toEqual('2025년 8월 1주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const 마지막주 = formatWeek(new Date('2025-08-31'));

    expect(마지막주).toEqual('2025년 8월 5주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const 연도바뀜 = formatWeek(new Date('2025-12-31'));

    expect(연도바뀜).toEqual('2025년 12월 5주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const 윤년2월마지막주 = formatWeek(new Date('2024-02-29'));

    expect(윤년2월마지막주).toEqual('2024년 2월 5주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const 평년2월마지막주 = formatWeek(new Date('2025-02-28'));

    expect(평년2월마지막주).toEqual('2025년 2월 4주');
  });
});

describe('formatMonth: 월 포맷', () => {
  it('2025-07-10을 "2025년 7월"로 포맷한다', () => {
    const 월정보 = formatMonth(new Date('2025-07-10'));

    expect(월정보).toEqual('2025년 7월');
  });
});

describe('isDateInRange: 날짜 범위 포함 여부', () => {
  it('범위 내의 날짜(2025-07-10)는 true', () => {
    const 범위내날짜 = isDateInRange(
      new Date('2025-07-10'),
      new Date('2025-07-01'),
      new Date('2025-07-31')
    );

    expect(범위내날짜).toBe(true);
  });

  it('범위의 시작일(2025-07-01)은 true', () => {
    const 범위시작일 = isDateInRange(
      new Date('2025-07-01'),
      new Date('2025-07-01'),
      new Date('2025-07-31')
    );

    expect(범위시작일).toBe(true);
  });

  it('범위의 종료일(2025-07-31)은 true', () => {
    const 범위종료일 = isDateInRange(
      new Date('2025-07-31'),
      new Date('2025-07-01'),
      new Date('2025-07-31')
    );

    expect(범위종료일).toBe(true);
  });

  it('범위 이전(2025-06-30)은 false', () => {
    const 범위이전날짜 = isDateInRange(
      new Date('2025-06-30'),
      new Date('2025-07-01'),
      new Date('2025-07-31')
    );

    expect(범위이전날짜).toBe(false);
  });

  it('범위 이후(2025-08-01)는 false', () => {
    const 범위이후날짜 = isDateInRange(
      new Date('2025-08-01'),
      new Date('2025-07-01'),
      new Date('2025-07-31')
    );

    expect(범위이후날짜).toBe(false);
  });

  it('시작일이 종료일보다 늦으면 모든 날짜는 false', () => {
    const 시작일늦은경우 = isDateInRange(
      new Date('2025-07-31'),
      new Date('2025-07-31'),
      new Date('2025-07-01')
    );

    expect(시작일늦은경우).toBe(false);
  });
});

describe('fillZero: 0 패딩', () => {
  it("5를 2자리로 변환하면 '05'를 반환한다", () => {
    const 결과 = fillZero(5);

    expect(결과).toBe('05');
  });

  it("10을 2자리로 변환하면 '10'을 반환한다", () => {
    const 결과 = fillZero(10);

    expect(결과).toBe('10');
  });

  it("3을 3자리로 변환하면 '003'을 반환한다", () => {
    const 결과 = fillZero(3, 3);

    expect(결과).toBe('003');
  });

  it("100을 2자리로 변환하면 '100'을 반환한다", () => {
    const 결과 = fillZero(100);

    expect(결과).toBe('100');
  });

  it("0을 2자리로 변환하면 '00'을 반환한다", () => {
    const 결과 = fillZero(0);

    expect(결과).toBe('00');
  });

  it("1을 5자리로 변환하면 '00001'을 반환한다", () => {
    const 결과 = fillZero(1, 5);

    expect(결과).toBe('00001');
  });

  it("소수점이 있는 3.14를 5자리로 변환하면 '03.14'를 반환한다", () => {
    const 결과 = fillZero(3.14, 5);

    expect(결과).toBe('03.14');
  });

  it('size 파라미터를 생략하면 기본값 2를 사용한다', () => {
    const 결과 = fillZero(1);

    expect(결과).toBe('01');
  });

  it('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    const 결과 = fillZero(100, 2);

    expect(결과).toBe('100');
  });
});

describe('formatDate: 날짜 포맷', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    const 결과 = formatDate(new Date('2025-08-15'));

    expect(결과).toBe('2025-08-15');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    const 결과 = formatDate(new Date('2025-08-15'), 10);

    expect(결과).toBe('2025-08-10');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const 결과 = formatDate(new Date('2025-08-15'));

    expect(결과).toBe('2025-08-15');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const 결과 = formatDate(new Date('2025-08-01'));

    expect(결과).toBe('2025-08-01');
  });
});
