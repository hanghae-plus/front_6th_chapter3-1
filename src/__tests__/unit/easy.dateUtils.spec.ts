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
  it('2025년 1월은 31일 일수를 반환한다', () => {
    expect(getDaysInMonth(2025, 1)).toBe(31);
    expect(getDaysInMonth(2025, 1)).not.toBe(32);
  });

  it('2025년 4월은 30일 일수를 반환한다', () => {
    expect(getDaysInMonth(2025, 4)).toBe(30);
  });

  it('2024년 윤년의 2월에 대해 29일 일수를 반환한다', () => {
    expect(getDaysInMonth(2024, 2)).toBe(29);
  });

  it('2025년 평년의 2월에 대해 28일을 반환한다', () => {
    expect(getDaysInMonth(2025, 2)).toBe(28);
  });

  it('유효하지 않은 월은 일수 0을 반환한다', () => {
    expect(getDaysInMonth(2025, 13)).toBe(0);
    expect(getDaysInMonth(2025, -1)).toBe(0);
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 해당 주의 올바른 일주일을 반환한다', () => {
    const wednesday = new Date('2025-08-20');

    expect(getWeekDates(wednesday)).toEqual([
      new Date('2025-08-17'),
      new Date('2025-08-18'),
      new Date('2025-08-19'),
      new Date('2025-08-20'),
      new Date('2025-08-21'),
      new Date('2025-08-22'),
      new Date('2025-08-23'),
    ]);
  });

  it('주의 시작(월요일)에 해당 주의 올바른 일주일을 반환한다', () => {
    const monday = new Date('2025-08-18');

    expect(getWeekDates(monday)).toEqual([
      new Date('2025-08-17'),
      new Date('2025-08-18'),
      new Date('2025-08-19'),
      new Date('2025-08-20'),
      new Date('2025-08-21'),
      new Date('2025-08-22'),
      new Date('2025-08-23'),
    ]);
  });

  it('주의 끝(일요일)에 해당 주의 올바른 일주일을 반환한다', () => {
    const sunday = new Date('2025-08-23');

    expect(getWeekDates(sunday)).toEqual([
      new Date('2025-08-17'),
      new Date('2025-08-18'),
      new Date('2025-08-19'),
      new Date('2025-08-20'),
      new Date('2025-08-21'),
      new Date('2025-08-22'),
      new Date('2025-08-23'),
    ]);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const lastDayOfYear = new Date('2025-12-31');

    expect(getWeekDates(lastDayOfYear)).toEqual([
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
    const firstDayOfYear = new Date('2026-01-01');

    expect(getWeekDates(firstDayOfYear)).toEqual([
      new Date('2025-12-28'),
      new Date('2025-12-29'),
      new Date('2025-12-30'),
      new Date('2025-12-31'),
      new Date('2026-01-01'),
      new Date('2026-01-02'),
      new Date('2026-01-03'),
    ]);
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const leapYearFeburary = new Date('2024-02-29');

    expect(getWeekDates(leapYearFeburary)).toEqual([
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
    const lastDayOfMonth = new Date('2025-08-31');

    expect(getWeekDates(lastDayOfMonth)).toEqual([
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
    const date = new Date(2025, 6, 1);
    const weeks = getWeeksAtMonth(date);

    expect(weeks).toHaveLength(5);

    expect(weeks[0]).toEqual([null, null, 1, 2, 3, 4, 5]);
    expect(weeks[1]).toEqual([6, 7, 8, 9, 10, 11, 12]);
    expect(weeks[2]).toEqual([13, 14, 15, 16, 17, 18, 19]);
    expect(weeks[3]).toEqual([20, 21, 22, 23, 24, 25, 26]);
    expect(weeks[4]).toEqual([27, 28, 29, 30, 31, null, null]);

    weeks.forEach((week) => {
      expect(week).toHaveLength(7);
    });

    const allDays = weeks.flat().filter((day) => day !== null);
    const expectedDays = Array.from({ length: 31 }, (_, i) => i + 1);
    expect(allDays).toEqual(expectedDays);
  });
});

describe('getEventsForDay', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '회의',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:30',
      description: '팀 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '프레젠테이션',
      date: '2025-07-01',
      startTime: '14:00',
      endTime: '15:30',
      description: '분기 발표',
      location: '대회의실',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 60,
    },
    {
      id: '3',
      title: '점심 약속',
      date: '2025-07-15',
      startTime: '12:00',
      endTime: '13:30',
      description: '고객과 점심',
      location: '레스토랑 B',
      category: '기타',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '4',
      title: '워크샵',
      date: '2025-06-30',
      startTime: '10:00',
      endTime: '17:00',
      description: '기술 워크샵',
      location: '교육센터',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 60,
    },
    {
      id: '5',
      title: '회식',
      date: '2025-08-01',
      startTime: '18:00',
      endTime: '21:00',
      description: '팀 회식',
      location: '음식점 C',
      category: '기타',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 120,
    },
  ];

  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const result = getEventsForDay(mockEvents, 1);

    expect(result).toHaveLength(3);
    expect(result[0].id).toBe('1');
    expect(result[0].title).toBe('회의');
    expect(result[0]).toEqual(mockEvents[0]);

    expect(result[1].id).toBe('2');
    expect(result[1].title).toBe('프레젠테이션');
    expect(result[1]).toEqual(mockEvents[1]);

    expect(result[2].id).toBe('5');
    expect(result[2].title).toBe('회식');
    expect(result[2]).toEqual(mockEvents[4]);

    result.forEach((event) => {
      expect(new Date(event.date).getDate()).toBe(1);
    });
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(mockEvents, 25);

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(mockEvents, 0);

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(mockEvents, 32);

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });
});

describe('getEventsForDay 예외 케이스', () => {
  it('전체 이벤트가 없다면 날짜가 1일인 경우 빈 배열을 반환한다', () => {
    const emptyEvents: Event[] = [];
    const result = getEventsForDay(emptyEvents, 1);

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it('조회하는 날짜가 정상적이지 않은 날짜라면 빈 배열을 반환한다', () => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '회의',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:30',
        description: '팀 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
      {
        id: '2',
        title: '휴가',
        date: '2025-07-30',
        startTime: '09:30',
        endTime: '18:30',
        description: '병원 방문',
        location: '집',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 60,
      },
    ];

    // -1일
    const minusDays = getEventsForDay(mockEvents, -1);

    expect(minusDays).toEqual([]);
    expect(minusDays).toHaveLength(0);
    expect(Array.isArray(minusDays)).toBe(true);

    // 32일
    const overDays = getEventsForDay(mockEvents, 32);
    expect(overDays).toEqual([]);
    expect(overDays).toHaveLength(0);
    expect(Array.isArray(overDays)).toBe(true);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const targetDate = formatWeek(new Date('2025-08-15'));
    expect(targetDate).toBe('2025년 8월 2주');
  });

  it('월의 첫 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const targetDate = formatWeek(new Date('2025-08-01'));
    expect(targetDate).toBe('2025년 7월 5주');
  });

  it('월의 마지막 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const targetDate = formatWeek(new Date('2025-08-31'));
    expect(targetDate).toBe('2025년 9월 1주');
  });

  it('연도가 넘어가는 마지막 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const targetDate = formatWeek(new Date('2025-12-31'));
    expect(targetDate).toBe('2026년 1월 1주');
  });

  it('윤년 2월의 마지막 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const targetDate = formatWeek(new Date('2024-02-29'));
    expect(targetDate).toBe('2024년 2월 5주');
  });

  it('평년 2월의 마지막 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const targetDate = formatWeek(new Date('2025-02-28'));
    expect(targetDate).toBe('2025년 2월 4주');
  });
});

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'의 텍스트 형태로 반환한다", () => {
    const targetDate = formatMonth(new Date('2025-07-10'));
    expect(targetDate).toBe('2025년 7월');
  });

  it("윤년 2월을 '2024년 2월' 텍스트 형태로 반환한다", () => {
    const result = formatMonth(new Date('2024-02-29'));
    expect(result).toBe('2024년 2월');
  });

  it('Date 생성자로 만든 객체를 올바른 텍스트 형태로 반환한다', () => {
    const result = formatMonth(new Date(2025, 6, 15));
    expect(result).toBe('2025년 7월');
    expect(result).toBeTypeOf('string');
  });
});

describe('isDateInRange', () => {
  const rangeStart = new Date('2025-07-01');
  const rangeEnd = new Date('2025-07-31');

  it('범위 내의 날짜 2025-07-10에 대해 true를 반환한다', () => {
    const targetDate = new Date('2025-07-10');
    const result = isDateInRange(targetDate, rangeStart, rangeEnd);

    expect(result).toBe(true);
  });

  it('범위의 시작일 2025-07-01에 대해 true를 반환한다', () => {
    const targetDate = new Date('2025-07-10');
    const result = isDateInRange(targetDate, rangeStart, rangeEnd);

    expect(result).toBe(true);
  });

  it('범위의 종료일 2025-07-31에 대해 true를 반환한다', () => {
    const targetDate = new Date('2025-07-31');
    const result = isDateInRange(targetDate, rangeStart, rangeEnd);

    expect(result).toBe(true);
  });

  it('범위 이전의 날짜 2025-06-30에 대해 false를 반환한다', () => {
    const targetDate = new Date('2025-06-30');
    const result = isDateInRange(targetDate, rangeStart, rangeEnd);

    expect(result).toBe(false);
  });

  it('범위 이후의 날짜 2025-08-01에 대해 false를 반환한다', () => {
    const targetDate = new Date('2025-08-01');
    const result = isDateInRange(targetDate, rangeStart, rangeEnd);

    expect(result).toBe(false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const targetDate = new Date('2025-07-10');
    const result = isDateInRange(targetDate, rangeEnd, rangeStart);
    expect(result).toBe(false);
  });
});

describe('fillZero', () => {
  it("5를 2자리로 변환하면 '05'를 반환한다", () => {
    const result = fillZero(5, 2);
    expect(result).toBe('05');
  });

  it("10을 2자리로 변환하면 '10'을 반환한다", () => {
    const result = fillZero(10, 2);
    expect(result).toBe('10');
  });

  it("3을 3자리로 변환하면 '003'을 반환한다", () => {
    const result = fillZero(3, 3);
    expect(result).toBe('003');
  });

  it("100을 2자리로 변환하면 '100'을 반환한다", () => {
    const result = fillZero(100, 2);
    expect(result).toBe('100');
  });

  it("0을 2자리로 변환하면 '00'을 반환한다", () => {
    const result = fillZero(0, 2);
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
    const result = fillZero(10000, 2);
    expect(result).toBe('10000');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    const targetDate = formatDate(new Date(2025, 8, 20));
    expect(targetDate).toBe('2025-09-20');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    const targetDate = formatDate(new Date(2025, 8), 12);
    expect(targetDate).toBe('2025-09-12');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const targetDate = formatDate(new Date(2025, 8), 12);
    expect(targetDate).toBe('2025-09-12');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const targetDate = formatDate(new Date(2025, 8, 1));
    expect(targetDate).toBe('2025-09-01');
  });
});
