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
  test('1월은 31일 수를 반환한다', () => {
    expect(getDaysInMonth(2025, 1)).toBe(31);
  });

  test('4월은 30일 일수를 반환한다', () => {
    expect(getDaysInMonth(2025, 4)).toBe(30);
  });

  test('윤년의 2월에 대해 29일을 반환한다', () => {
    expect(getDaysInMonth(2024, 2)).toBe(29);
  });

  test('평년의 2월에 대해 28일을 반환한다', () => {
    expect(getDaysInMonth(2025, 2)).toBe(28);
  });

  // NOTE: 이 테스트는 불필요한 테스트라고 판단하였으나 최대한 현재 기능에 유사하게 구현하였습니다.
  // 테스트를 불필요하다고 판단한 이유는, getDaysInMonth 함수가 JavaScript 내장 기능 테스트에 지나치지 않는다고 판단했기 때문입니다.
  describe('잘못된 월 입력 처리', () => {
    test('13월 입력 시 이전 달(12월)의 일수인 31일을 반환한다', () => {
      expect(getDaysInMonth(2025, 13)).toBe(31);
    });

    test('0월 입력 시 이전 달(12월)의 일수인 31일을 반환한다', () => {
      expect(getDaysInMonth(2025, 0)).toBe(31);
    });

    test('-1월 입력 시 이전 달(11월)의 일수인 30일을 반환한다', () => {
      expect(getDaysInMonth(2025, -1)).toBe(30);
    });
  });
});
describe('getWeekDates', () => {
  describe('일반 케이스', () => {
    test('수요일(2025-08-20)을 기준으로 해당 주의 7일을 반환한다', () => {
      const date = new Date('2025-08-20');
      const weekDates = getWeekDates(date);
      expect(weekDates).toHaveLength(7);
      expect(weekDates[0].toISOString().split('T')[0]).toBe('2025-08-17');
      expect(weekDates[6].toISOString().split('T')[0]).toBe('2025-08-23');
    });

    test('월요일(2025-08-18)을 기준으로 해당 주의 7일을 반환한다', () => {
      const date = new Date('2025-08-18');
      const weekDates = getWeekDates(date);
      expect(weekDates).toHaveLength(7);
      expect(weekDates[0].toISOString().split('T')[0]).toBe('2025-08-17');
      expect(weekDates[6].toISOString().split('T')[0]).toBe('2025-08-23');
    });

    test('일요일(2025-08-24)을 기준으로 해당 주의 7일을 반환한다', () => {
      const date = new Date('2025-08-24');
      const weekDates = getWeekDates(date);
      expect(weekDates).toHaveLength(7);
      expect(weekDates[0].toISOString().split('T')[0]).toBe('2025-08-24');
      expect(weekDates[6].toISOString().split('T')[0]).toBe('2025-08-30');
    });
  });

  describe('연도 경계값 처리', () => {
    test('연말(2024-12-30)을 기준으로 이전 연도와 다음 연도에 걸친 주를 반환한다', () => {
      const date = new Date('2024-12-30');
      const weekDates = getWeekDates(date);
      expect(weekDates[0].toISOString().split('T')[0]).toBe('2024-12-29');
      expect(weekDates[6].toISOString().split('T')[0]).toBe('2025-01-04');
    });

    test('연초(2025-01-01)를 기준으로 이전 연도와 다음 연도에 걸친 주를 반환한다', () => {
      const date = new Date('2025-01-01');
      const weekDates = getWeekDates(date);
      expect(weekDates[0].toISOString().split('T')[0]).toBe('2024-12-29');
      expect(weekDates[6].toISOString().split('T')[0]).toBe('2025-01-04');
    });
  });

  describe('특수한 날짜', () => {
    test('윤년의 2월 29일(2024-02-29)을 포함한 주를 올바르게 처리한다', () => {
      const date = new Date('2024-02-29');
      const weekDates = getWeekDates(date);
      expect(weekDates[0].toISOString().split('T')[0]).toBe('2024-02-25');
      expect(weekDates[6].toISOString().split('T')[0]).toBe('2024-03-02');
    });

    test('월의 마지막 날(2025-04-30)을 포함한 주를 올바르게 처리한다', () => {
      const date = new Date('2025-04-30');
      const weekDates = getWeekDates(date);
      expect(weekDates[0].toISOString().split('T')[0]).toBe('2025-04-27');
      expect(weekDates[6].toISOString().split('T')[0]).toBe('2025-05-03');
    });
  });
});

describe('getWeeksAtMonth', () => {
  test('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
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
    test('1일(2025-07-01)에 해당하는 이벤트 2개를 정확히 반환한다', () => {
      const day = 1;
      const result = getEventsForDay(mockEvents, day);
      expect(result).toHaveLength(2);
      expect(result).toEqual([mockEvents[0], mockEvents[1]]);
    });

    test('2일(2025-07-02)에 해당하는 이벤트 1개를 정확히 반환한다', () => {
      const day = 2;
      const result = getEventsForDay(mockEvents, day);
      expect(result).toHaveLength(1);
      expect(result).toEqual([mockEvents[2]]);
    });
  });

  describe('이벤트가 없는 날짜', () => {
    test('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
      const day = 5;
      const result = getEventsForDay(mockEvents, day);
      expect(result).toEqual([]);
    });
  });

  describe('잘못된 날짜 입력', () => {
    test('날짜가 0일 경우 빈 배열을 반환한다', () => {
      const day = 0;
      const result = getEventsForDay(mockEvents, day);
      expect(result).toEqual([]);
    });

    test('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
      const day = 32;
      const result = getEventsForDay(mockEvents, day);
      expect(result).toEqual([]);
    });

    test('음수 날짜인 경우 빈 배열을 반환한다', () => {
      const day = -1;
      const result = getEventsForDay(mockEvents, day);
      expect(result).toEqual([]);
    });
  });
});

describe('formatWeek', () => {
  describe('기본 동작', () => {
    test('월 중간의 날짜는 해당 월의 주차를 반환한다', () => {
      const date = new Date('2025-07-15');
      expect(formatWeek(date)).toBe('2025년 7월 3주');
    });
  });

  describe('월 경계값 테스트', () => {
    test('월의 첫날은 1주차로 분류된다', () => {
      const date = new Date('2025-07-01');
      expect(formatWeek(date)).toBe('2025년 7월 1주');
    });

    test('월의 마지막날은 해당 월의 마지막 주차로 분류된다', () => {
      const date = new Date('2025-07-31');
      expect(formatWeek(date)).toBe('2025년 7월 5주');
    });
  });

  describe('연도/월 경계값 테스트', () => {
    test('12월 말일이 목요일 기준으로 다음해 1월에 속하면 다음해로 분류된다', () => {
      const date = new Date('2024-12-30');
      expect(formatWeek(date)).toBe('2025년 1월 1주');
    });
  });

  describe('주 단위 일관성', () => {
    test('같은 주의 모든 요일은 동일한 주차로 분류된다', () => {
      const sunday = new Date('2025-07-13');
      const wednesday = new Date('2025-07-16');
      const saturday = new Date('2025-07-19');

      const expectedWeek = '2025년 7월 3주';
      expect(formatWeek(sunday)).toBe(expectedWeek);
      expect(formatWeek(wednesday)).toBe(expectedWeek);
      expect(formatWeek(saturday)).toBe(expectedWeek);
    });
  });
});

describe('formatMonth', () => {
  test("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    const date = new Date('2025-07-10');
    expect(formatMonth(date)).toBe('2025년 7월');
  });
});

describe('isDateInRange', () => {
  describe('범위 내 날짜 검증', () => {
    test('시작일(2025-07-01)과 종료일(2025-07-31) 사이의 날짜(2025-07-10)는 범위에 포함된다', () => {
      const date = new Date('2025-07-10');
      const start = new Date('2025-07-01');
      const end = new Date('2025-07-31');

      expect(isDateInRange(date, start, end)).toBe(true);
    });
  });

  describe('경계값 포함 여부', () => {
    test('시작일(2025-07-01)은 범위에 포함된다', () => {
      const date = new Date('2025-07-01');
      const start = new Date('2025-07-01');
      const end = new Date('2025-07-31');

      expect(isDateInRange(date, start, end)).toBe(true);
    });

    test('종료일(2025-07-31)은 범위에 포함된다', () => {
      const date = new Date('2025-07-31');
      const start = new Date('2025-07-01');
      const end = new Date('2025-07-31');

      expect(isDateInRange(date, start, end)).toBe(true);
    });
  });

  describe('범위 밖 날짜 검증', () => {
    test('시작일(2025-07-01) 이전의 날짜(2025-06-30)는 범위에 포함되지 않는다', () => {
      const date = new Date('2025-06-30');
      const start = new Date('2025-07-01');
      const end = new Date('2025-07-31');

      expect(isDateInRange(date, start, end)).toBe(false);
    });

    test('종료일(2025-07-31) 이후의 날짜(2025-08-01)는 범위에 포함되지 않는다', () => {
      const date = new Date('2025-08-01');
      const start = new Date('2025-07-01');
      const end = new Date('2025-07-31');

      expect(isDateInRange(date, start, end)).toBe(false);
    });
  });

  describe('잘못된 범위 처리', () => {
    test('시작일(2025-07-31)이 종료일(2025-07-01)보다 늦으면 어떤 날짜도 범위에 포함되지 않는다', () => {
      const date = new Date('2025-07-15');
      const start = new Date('2025-07-31');
      const end = new Date('2025-07-01');

      expect(isDateInRange(date, start, end)).toBe(false);
    });
  });

  describe('시간 정보 무시 검증', () => {
    test('같은 날짜라면 시간이 달라도 범위에 포함된다', () => {
      const date = new Date('2025-07-01T23:59:59');
      const start = new Date('2025-07-01T00:00:00');
      const end = new Date('2025-07-31T12:00:00');

      expect(isDateInRange(date, start, end)).toBe(true);
    });
  });
});

describe('fillZero', () => {
  test("5를 2자리로 변환하면 '05'를 반환한다", () => {
    expect(fillZero(5)).toBe('05');
  });

  test("10을 2자리로 변환하면 '10'을 반환한다", () => {
    expect(fillZero(10)).toBe('10');
  });

  test("3을 3자리로 변환하면 '003'을 반환한다", () => {
    expect(fillZero(3, 3)).toBe('003');
  });

  test("100을 2자리로 변환하면 '100'을 반환한다", () => {
    expect(fillZero(100)).toBe('100');
  });

  test("0을 2자리로 변환하면 '00'을 반환한다", () => {
    expect(fillZero(0)).toBe('00');
  });

  test("1을 5자리로 변환하면 '00001'을 반환한다", () => {
    expect(fillZero(1, 5)).toBe('00001');
  });

  test("소수점이 있는 3.14를 5자리로 변환하면 '03.14'를 반환한다", () => {
    expect(fillZero(3.14, 5)).toBe('03.14');
  });

  test('size 파라미터를 생략하면 기본값 2를 사용한다', () => {
    expect(fillZero(7)).toBe('07');
  });

  test('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    expect(fillZero(1000, 3)).toBe('1000');
  });
});

describe('formatDate', () => {
  describe('기본 날짜 포맷팅', () => {
    test('2025년 7월 15일을 YYYY-MM-DD 형식으로 포맷팅한다', () => {
      const date = new Date('2025-07-15');
      expect(formatDate(date)).toBe('2025-07-15');
    });

    test('day 파라미터(20)로 일자(2025-07-20)로 변경할 수 있다', () => {
      const date = new Date('2025-07-15');
      expect(formatDate(date, 20)).toBe('2025-07-20');
    });
  });

  // test('day 파라미터(31)가 제공되면 해당 일자(2025-07-01)로 포맷팅한다', () => {
  //   const date = new Date('2025-06-15');
  //   expect(formatDate(date, 31)).toBe('2025-07-01');
  // });

  describe('자릿수 처리', () => {
    test('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
      const date = new Date('2025-01-15');
      expect(formatDate(date)).toBe('2025-01-15');
    });

    test('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
      const date = new Date('2025-07-05');
      expect(formatDate(date)).toBe('2025-07-05');
    });

    test('한 자리 day 파라미터를 두 자리로 패딩한다', () => {
      const date = new Date('2025-07-15');
      expect(formatDate(date, 1)).toBe('2025-07-01');
    });
  });

  describe('경계값 테스트', () => {
    // test('없는 날짜(2025-01-32)을 올바르게 포맷팅한다', () => {
    //   const date = new Date('2025-01-31');
    //   expect(formatDate(date, 32)).toBe('2025-02-01');
    // });

    test('연도의 첫날(1월 1일)을 올바르게 포맷팅한다', () => {
      const date = new Date('2025-01-01');
      expect(formatDate(date)).toBe('2025-01-01');
    });

    test('연도의 마지막날(12월 31일)을 올바르게 포맷팅한다', () => {
      const date = new Date('2025-12-31');
      expect(formatDate(date)).toBe('2025-12-31');
    });

    test('윤년의 2월 29일을 올바르게 포맷팅한다', () => {
      const date = new Date('2024-02-29');
      expect(formatDate(date)).toBe('2024-02-29');
    });
  });
});
