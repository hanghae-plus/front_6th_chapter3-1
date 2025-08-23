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

  it('유효하지 않은 월에 대해 적절히 처리한다', () => {
    expect(getDaysInMonth(2025, 0)).toBe(31);
    expect(getDaysInMonth(2025, 13)).toBe(31);
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    // 2025년 8월 20일 (수요일)
    const wednesday = new Date(2025, 7, 20);
    const weekDates = getWeekDates(wednesday);

    // 1. 총 7일
    expect(weekDates).toHaveLength(7);

    // 2. 일요일 (2025-08-17)
    expect(weekDates[0].getDate()).toBe(17);
    expect(weekDates[0].getDay()).toBe(0);

    // 3. 수요일 (2025-08-20)
    expect(weekDates[3].getDate()).toBe(20);
    expect(weekDates[3].getDay()).toBe(3);

    // 4. 토요일 (2025-08-23)
    expect(weekDates[6].getDate()).toBe(23);
    expect(weekDates[6].getDay()).toBe(6);

    // 5. 각 날짜 사이는 하루
    for (let i = 0; i < 6; i++) {
      const currentDate = weekDates[i];
      const nextDate = weekDates[i + 1];
      const dayDifference = nextDate.getTime() - currentDate.getTime();
      expect(dayDifference).toBe(24 * 60 * 60 * 1000);
    }
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    // 2025년 8월 18일 (월요일)
    const monday = new Date(2025, 7, 18);
    const weekDates = getWeekDates(monday);

    // 1. 총 7일
    expect(weekDates).toHaveLength(7);

    // 2. 일요일 (2025-08-17) - 주의 시작
    expect(weekDates[0].getDate()).toBe(17);
    expect(weekDates[0].getDay()).toBe(0);

    // 3. 월요일 (2025-08-18) - 입력한 날짜
    expect(weekDates[1].getDate()).toBe(18);
    expect(weekDates[1].getDay()).toBe(1);

    // 4. 토요일 (2025-08-23) - 주의 끝
    expect(weekDates[6].getDate()).toBe(23);
    expect(weekDates[6].getDay()).toBe(6);
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    // 2025년 8월 17일 (일요일)
    const sunday = new Date(2025, 7, 17);
    const weekDates = getWeekDates(sunday);

    // 1. 총 7일
    expect(weekDates).toHaveLength(7);

    // 2. 일요일 (2025-08-17)
    expect(weekDates[0].getDate()).toBe(17);
    expect(weekDates[0].getDay()).toBe(0);

    // 3. 토요일 (2025-08-23)
    expect(weekDates[6].getDate()).toBe(23);
    expect(weekDates[6].getDay()).toBe(6);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    // 2024년 12월 30일 (월요일) - 주가 2025년으로 넘어감
    const monday = new Date(2024, 11, 30);
    const weekDates = getWeekDates(monday);

    // 1. 총 7일
    expect(weekDates).toHaveLength(7);

    // 2. 일요일 (2024-12-29)
    expect(weekDates[0].getDate()).toBe(29);
    expect(weekDates[0].getFullYear()).toBe(2024);
    expect(weekDates[0].getDay()).toBe(0);

    // 3. 월요일 (2024-12-30)
    expect(weekDates[1].getDate()).toBe(30);
    expect(weekDates[1].getFullYear()).toBe(2024);
    expect(weekDates[1].getDay()).toBe(1);

    // 4. 토요일 (2025-01-04)
    expect(weekDates[6].getDate()).toBe(4);
    expect(weekDates[6].getFullYear()).toBe(2025);
    expect(weekDates[6].getDay()).toBe(6);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    // 2025년 1월 1일 (수요일) - 주가 2024년에서 시작
    const wednesday = new Date(2025, 0, 1);
    const weekDates = getWeekDates(wednesday);

    // 1. 총 7일
    expect(weekDates).toHaveLength(7);

    // 2. 일요일 (2024-12-29)
    expect(weekDates[0].getDate()).toBe(29);
    expect(weekDates[0].getFullYear()).toBe(2024);
    expect(weekDates[0].getDay()).toBe(0);

    // 3. 수요일 (2025-01-01)
    expect(weekDates[3].getDate()).toBe(1);
    expect(weekDates[3].getFullYear()).toBe(2025);
    expect(weekDates[3].getDay()).toBe(3);

    // 4. 토요일 (2025-01-04)
    expect(weekDates[6].getDate()).toBe(4);
    expect(weekDates[6].getFullYear()).toBe(2025);
    expect(weekDates[6].getDay()).toBe(6);
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    // 2024년 2월 29일 (목요일) - 윤년
    const thursday = new Date(2024, 1, 29);
    const weekDates = getWeekDates(thursday);

    // 1. 총 7일
    expect(weekDates).toHaveLength(7);

    // 2. 일요일 (2024-02-25)
    expect(weekDates[0].getDate()).toBe(25);
    expect(weekDates[0].getMonth()).toBe(1); // 2월
    expect(weekDates[0].getDay()).toBe(0);

    // 3. 목요일 (2024-02-29) - 윤년의 2월 29일
    expect(weekDates[4].getDate()).toBe(29);
    expect(weekDates[4].getMonth()).toBe(1); // 2월
    expect(weekDates[4].getDay()).toBe(4);

    // 4. 토요일 (2024-03-02)
    expect(weekDates[6].getDate()).toBe(2);
    expect(weekDates[6].getMonth()).toBe(2); // 3월
    expect(weekDates[6].getDay()).toBe(6);
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    // 2025년 8월 31일 (일요일) - 월의 마지막 날
    const sunday = new Date(2025, 7, 31);
    const weekDates = getWeekDates(sunday);

    // 1. 총 7일
    expect(weekDates).toHaveLength(7);

    // 2. 일요일 (2025-08-31) - 8월의 마지막 날
    expect(weekDates[0].getDate()).toBe(31);
    expect(weekDates[0].getMonth()).toBe(7); // 8월
    expect(weekDates[0].getDay()).toBe(0);

    // 3. 토요일 (2025-09-06) - 다음 달로 넘어감
    expect(weekDates[6].getDate()).toBe(6);
    expect(weekDates[6].getMonth()).toBe(8); // 9월
    expect(weekDates[6].getDay()).toBe(6);
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    // 2025년 7월 1일 (화요일)
    const date = new Date(2025, 6, 1);
    const weeks = getWeeksAtMonth(date);

    // 1. 7월은 총 5주
    expect(weeks).toHaveLength(5);

    // 2. 첫 번째 주 확인 (6월 29일 ~ 7월 5일)
    // 일요일(null), 월요일(null), 화요일(1), 수요일(2), 목요일(3), 금요일(4), 토요일(5)
    expect(weeks[0]).toEqual([null, null, 1, 2, 3, 4, 5]);

    // 3. 두 번째 주 확인 (7월 6일 ~ 7월 12일)
    expect(weeks[1]).toEqual([6, 7, 8, 9, 10, 11, 12]);

    // 4. 마지막 주 확인 (7월 27일 ~ 8월 2일)
    // 일요일(27), 월요일(28), 화요일(29), 수요일(30), 목요일(31), 금요일(null), 토요일(null)
    expect(weeks[4]).toEqual([27, 28, 29, 30, 31, null, null]);
  });
});

describe('getEventsForDay', () => {
  // 테스트용 이벤트 데이터 생성
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '이벤트1',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: 'd1',
      location: 'l1',
      category: 'c1',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 60,
    },
    {
      id: '2',
      title: '이벤트2',
      date: '2025-07-01',
      startTime: '14:00',
      endTime: '15:00',
      description: 'd2',
      location: 'l2',
      category: 'c2',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 60,
    },
    {
      id: '3',
      title: '이벤트3',
      date: '2025-07-02',
      startTime: '11:00',
      endTime: '12:00',
      description: 'd3',
      location: 'l3',
      category: 'c3',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 60,
    },
  ];

  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const eventsForDay1 = getEventsForDay(mockEvents, 1);

    // 1. 1일에 해당하는 이벤트 2개 반환
    expect(eventsForDay1).toHaveLength(2);

    // 2. 반환된 이벤트들이 모두 1일 날짜인지 확인
    eventsForDay1.forEach((event) => {
      expect(new Date(event.date).getDate()).toBe(1);
    });

    // 3. 올바른 이벤트들이 반환되는지 확인
    expect(eventsForDay1.map((e) => e.id)).toEqual(['1', '2']);
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const eventsForDay10 = getEventsForDay(mockEvents, 10);

    // 1. 빈 배열 반환
    expect(eventsForDay10).toHaveLength(0);
    expect(eventsForDay10).toEqual([]);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const eventsForDay0 = getEventsForDay(mockEvents, 0);

    // 1. 빈 배열 반환
    expect(eventsForDay0).toHaveLength(0);
    expect(eventsForDay0).toEqual([]);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const eventsForDay32 = getEventsForDay(mockEvents, 32);

    // 1. 빈 배열 반환
    expect(eventsForDay32).toHaveLength(0);
    expect(eventsForDay32).toEqual([]);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    // 2025년 7월 15일 (화요일)
    const midDate = new Date(2025, 6, 15);
    const weekInfo = formatWeek(midDate);

    // 1. "YYYY년 M월 N주" 형식으로 반환
    expect(weekInfo).toMatch(/^\d{4}년 \d{1,2}월 \d주$/);

    // 2. 7월 3주로 반환 (목요일 기준 계산)
    expect(weekInfo).toBe('2025년 7월 3주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    // 2025년 7월 1일 (화요일)
    const firstWeek = new Date(2025, 6, 1);
    const weekInfo = formatWeek(firstWeek);

    // 1. "YYYY년 M월 N주" 형식으로 반환
    expect(weekInfo).toMatch(/^\d{4}년 \d{1,2}월 \d주$/);

    // 2. 7월 1주로 반환 (목요일이 7월 3일이므로 7월 1주)
    expect(weekInfo).toBe('2025년 7월 1주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    // 2025년 7월 31일 (목요일)
    const lastWeek = new Date(2025, 6, 31);
    const weekInfo = formatWeek(lastWeek);

    // 1. "YYYY년 M월 N주" 형식으로 반환
    expect(weekInfo).toMatch(/^\d{4}년 \d{1,2}월 \d주$/);

    // 2. 7월 5주로 반환
    expect(weekInfo).toBe('2025년 7월 5주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    // 2025년 1월 1일 (수요일)
    const newYearDate = new Date(2025, 0, 1);
    const weekInfo = formatWeek(newYearDate);

    // 1. "YYYY년 M월 N주" 형식으로 반환
    expect(weekInfo).toMatch(/^\d{4}년 \d{1,2}월 \d주$/);

    // 2. 목요일(1월 2일)이 2025년이므로 2025년 1월 1주
    expect(weekInfo).toBe('2025년 1월 1주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    // 2024년 2월 29일 (목요일)
    const leapYearEnd = new Date(2024, 1, 29);
    const weekInfo = formatWeek(leapYearEnd);

    // 1. "YYYY년 M월 N주" 형식으로 반환
    expect(weekInfo).toMatch(/^\d{4}년 \d{1,2}월 \d주$/);

    // 2. 2월 5주로 반환
    expect(weekInfo).toBe('2024년 2월 5주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    // 2025년 2월 28일 (금요일)
    const normalYearEnd = new Date(2025, 1, 28);
    const weekInfo = formatWeek(normalYearEnd);

    // 1. "YYYY년 M월 N주" 형식으로 반환
    expect(weekInfo).toMatch(/^\d{4}년 \d{1,2}월 \d주$/);

    // 2. 2월 4주로 반환 (목요일이 2월 27일)
    expect(weekInfo).toBe('2025년 2월 4주');
  });
});

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    // 2025년 7월 10일
    const date = new Date(2025, 6, 10);
    const monthString = formatMonth(date);

    // 1. "YYYY년 M월" 형식으로 반환
    expect(monthString).toBe('2025년 7월');
  });
});

describe('isDateInRange', () => {
  // 2025년 7월 1일 ~ 2025년 7월 31일
  const rangeStart = new Date(2025, 6, 1);
  const rangeEnd = new Date(2025, 6, 31);

  it('범위 내의 날짜 2025-07-10에 대해 true를 반환한다', () => {
    // 범위 내 날짜 (2025-07-10)
    const targetDate = new Date(2025, 6, 10);
    const result = isDateInRange(targetDate, rangeStart, rangeEnd);

    // 1. 범위 내 날짜이므로 true 반환
    expect(result).toBe(true);
  });

  it('범위의 시작일 2025-07-01에 대해 true를 반환한다', () => {
    // 범위 시작일 (2025-07-01)
    const targetDate = new Date(2025, 6, 1);
    const result = isDateInRange(targetDate, rangeStart, rangeEnd);

    // 1. 시작일도 범위에 포함되므로 true 반환
    expect(result).toBe(true);
  });

  it('범위의 종료일 2025-07-31에 대해 true를 반환한다', () => {
    // 범위 종료일 (2025-07-31)
    const targetDate = new Date(2025, 6, 31);
    const result = isDateInRange(targetDate, rangeStart, rangeEnd);

    // 1. 종료일도 범위에 포함되므로 true 반환
    expect(result).toBe(true);
  });

  it('범위 이전의 날짜 2025-06-30에 대해 false를 반환한다', () => {
    // 범위 이전 날짜 (2025-06-30)
    const targetDate = new Date(2025, 5, 30);
    const result = isDateInRange(targetDate, rangeStart, rangeEnd);

    // 1. 범위 이전 날짜이므로 false 반환
    expect(result).toBe(false);
  });

  it('범위 이후의 날짜 2025-08-01에 대해 false를 반환한다', () => {
    // 범위 이후 날짜 (2025-08-01)
    const targetDate = new Date(2025, 7, 1);
    const result = isDateInRange(targetDate, rangeStart, rangeEnd);

    // 1. 범위 이후 날짜이므로 false 반환
    expect(result).toBe(false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const invalidRangeStart = new Date(2025, 6, 31);
    const invalidRangeEnd = new Date(2025, 6, 1);
    const targetDate = new Date(2025, 6, 15);

    const result = isDateInRange(targetDate, invalidRangeStart, invalidRangeEnd);

    expect(result).toBe(false);
  });

  it('시간 정보가 있어도 순수 날짜만 비교한다', () => {
    const dateWithTime = new Date(2025, 6, 15, 14, 30, 0); // 2025-07-15 14:30:00
    const startWithTime = new Date(2025, 6, 1, 23, 59, 59); // 2025-07-01 23:59:59
    const endWithTime = new Date(2025, 6, 31, 0, 0, 1); // 2025-07-31 00:00:01

    const result = isDateInRange(dateWithTime, startWithTime, endWithTime);

    expect(result).toBe(true);
  });
});

describe('fillZero', () => {
  it("5를 2자리로 변환하면 '05'를 반환한다", () => {
    const result = fillZero(5, 2);

    expect(result).toBe('05');
    expect(typeof result).toBe('string');
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
    const result = fillZero(7);

    expect(result).toBe('07');
  });

  it('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    const result = fillZero(1000, 3);

    expect(result).toBe('1000');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    // 2025년 7월 15일
    const date = new Date(2025, 6, 15);
    const formattedDate = formatDate(date);

    // 1. YYYY-MM-DD 형식으로 반환
    expect(formattedDate).toBe('2025-07-15');
    expect(formattedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    // 2025년 7월 15일
    const date = new Date(2025, 6, 15);
    const formattedDate = formatDate(date, 25);

    // 1. day 파라미터로 일자 변경되어 2025-07-25로 반환
    expect(formattedDate).toBe('2025-07-25');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    // 2025년 3월 15일
    const date = new Date(2025, 2, 15);
    const formattedDate = formatDate(date);

    // 1. 월이 03으로 0패딩되어 반환
    expect(formattedDate).toBe('2025-03-15');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    // 2025년 7월 5일
    const date = new Date(2025, 6, 5);
    const formattedDate = formatDate(date);

    // 1. 일이 05로 0패딩되어 반환
    expect(formattedDate).toBe('2025-07-05');
  });

  it('day 파라미터가 한 자리 수일 때도 0패딩한다', () => {
    // 2025년 7월 15일
    const date = new Date(2025, 6, 15);
    const formattedDate = formatDate(date, 3);

    // 1. day가 03으로 0패딩되어 반환
    expect(formattedDate).toBe('2025-07-03');
  });
});
