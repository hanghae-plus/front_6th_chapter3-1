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
    // 윤년 = 1년이 366일이 되는 해
    // 윤년은 4년마다 한 번씩 온다.
    expect(getDaysInMonth(2024, 2)).toBe(29);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    expect(getDaysInMonth(2025, 2)).toBe(28);
  });

  /**
   * 캘린더에서 선택하는 날짜가 주입되는 방식이기 때문에,
   * 유효하지 않은 입력이 매개변수로 주입되는 경우는 없다고 판단
   *
   * 그리고 해당 테스트를 통해서 유의미한 결과값을 도출해낼 수 있는지 잘 모르겠음
   */
  it('유효하지 않은 월을 입력할 경우 자동으로 이월하여 올바른 월의 일수를 반환한다', () => {
    expect(getDaysInMonth(2025, 13)).toBe(31); // 2026년 1월의 일수
    expect(getDaysInMonth(2025, 25)).toBe(31); // 2027년 1월의 일수
    expect(getDaysInMonth(2025, -2)).toBe(31); // 2024년 10월의 일수
  });
});

describe('getWeekDates', () => {
  /**
   * 아래의 테스트 케이스들은 모두
   * 1. 주가 7일로 구성되는지
   * 2. 주의 시작일과 종료일이 올바른지
   *
   * 를 검증하는 테스트들이다. 하지만,
   *
   * 1. 주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다
   * 2. 주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다
   * 3. 주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다
   *
   * 다른 테스트 케이스들은 반례를 다루고 있는 반면, 위 3개의 테스트는 중복되는 테스트로 불필요한 테스트이다.
   *
   */
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const result = getWeekDates(new Date('2025-01-15')); // 수요일
    expect(result).toHaveLength(7);
    expect(result[0].toDateString()).toBe(new Date('2025-01-12').toDateString()); // 일요일
    expect(result[6].toDateString()).toBe(new Date('2025-01-18').toDateString()); // 토요일
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const result = getWeekDates(new Date('2025-01-13')); // 월요일
    expect(result).toHaveLength(7);
    expect(result[0].toDateString()).toBe(new Date('2025-01-12').toDateString()); // 일요일
    expect(result[1].toDateString()).toBe(new Date('2025-01-13').toDateString()); // 월요일
    expect(result[6].toDateString()).toBe(new Date('2025-01-18').toDateString()); // 토요일
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const result = getWeekDates(new Date('2025-01-19')); // 일요일
    expect(result).toHaveLength(7);
    expect(result[0].toDateString()).toBe(new Date('2025-01-19').toDateString()); // 일요일
    expect(result[6].toDateString()).toBe(new Date('2025-01-25').toDateString()); // 토요일
  });

  /**
   * 아래의 두 개의 테스트는 목적은 동일하지만, 위 주석친 사례와 달리 반례를 다루고 있음
   */
  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const result = getWeekDates(new Date('2025-12-30')); // 화요일
    expect(result).toHaveLength(7);
    expect(result[0].toDateString()).toBe(new Date('2025-12-28').toDateString()); // 일요일
    expect(result[6].toDateString()).toBe(new Date('2026-01-03').toDateString()); // 토요일
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const result = getWeekDates(new Date('2025-01-01')); // 수요일
    expect(result).toHaveLength(7);
    expect(result[0].toDateString()).toBe(new Date('2024-12-29').toDateString()); // 일요일
    expect(result[6].toDateString()).toBe(new Date('2025-01-04').toDateString()); // 토요일
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const result = getWeekDates(new Date('2024-02-29')); // 목요일
    expect(result).toHaveLength(7);
    expect(result[0].toDateString()).toBe(new Date('2024-02-25').toDateString()); // 일요일
    expect(result[6].toDateString()).toBe(new Date('2024-03-02').toDateString()); // 토요일
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const result = getWeekDates(new Date('2025-01-31')); // 금요일
    expect(result).toHaveLength(7);
    expect(result[0].toDateString()).toBe(new Date('2025-01-26').toDateString()); // 일요일
    expect(result[6].toDateString()).toBe(new Date('2025-02-01').toDateString()); // 토요일
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const result = getWeeksAtMonth(new Date('2025-07-01'));

    expect(result).toEqual([
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
      title: '1일 이벤트',
      date: '2025-01-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '1일 이벤트',
      location: '장소',
      category: '카테고리',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '15일 이벤트',
      date: '2025-01-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '15일 이벤트',
      location: '장소',
      category: '카테고리',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 15,
    },
  ];

  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const result = getEventsForDay(mockEvents, 1);
    expect(result).toEqual([
      {
        id: '1',
        title: '1일 이벤트',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '1일 이벤트',
        location: '장소',
        category: '카테고리',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(mockEvents, 10);
    expect(result).toEqual([]);
  });

  /**
   * 날짜가 0 혹은 32 이상이 되는 경우는 존재하지 않음.
   * 아래 두 개의 테스트는 불필요한 테스트
   */
  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(mockEvents, 0);
    expect(result).toEqual([]);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(mockEvents, 32);
    expect(result).toEqual([]);
  });
});

describe('formatWeek', () => {
  /**
   * 아래 3개의 테스트들은 모두 동일한 목적을 가지는 테스트로 불필요한 테스트이다.
   */
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date('2025-07-15'));
    expect(result).toBe('2025년 7월 3주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date('2025-07-01'));
    expect(result).toBe('2025년 7월 1주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date('2025-07-31'));
    expect(result).toBe('2025년 7월 5주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date('2025-12-31'));
    expect(result).toBe('2026년 1월 1주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date('2024-02-29'));
    expect(result).toBe('2024년 2월 5주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date('2025-02-28'));
    expect(result).toBe('2025년 2월 4주');
  });
});

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    const result = formatMonth(new Date('2025-07-10'));
    expect(result).toBe('2025년 7월');
  });
});

describe('isDateInRange', () => {
  /**
   * 1. 범위 내의 날짜 2025-07-10에 대해 true를 반환한다
   * 2. 범위의 시작일 2025-07-01에 대해 true를 반환한다
   * 3. 범위의 종료일 2025-07-31에 대해 true를 반환한다
   *
   * 위 3개의 테스트는 모두 경계값 내부를 다루는 테스트로 불필요한 테스트이다.
   */
  it('범위 내의 날짜 2025-07-10에 대해 true를 반환한다', () => {
    const start = new Date('2025-07-01');
    const end = new Date('2025-07-31');
    const testDate = new Date('2025-07-10');
    expect(isDateInRange(testDate, start, end)).toBe(true);
  });

  it('범위의 시작일 2025-07-01에 대해 true를 반환한다', () => {
    const start = new Date('2025-07-01');
    const end = new Date('2025-07-31');
    const testDate = new Date('2025-07-01');
    expect(isDateInRange(testDate, start, end)).toBe(true);
  });

  it('범위의 종료일 2025-07-31에 대해 true를 반환한다', () => {
    const start = new Date('2025-07-01');
    const end = new Date('2025-07-31');
    const testDate = new Date('2025-07-31');
    expect(isDateInRange(testDate, start, end)).toBe(true);
  });

  it('범위 이전의 날짜 2025-06-30에 대해 false를 반환한다', () => {
    const start = new Date('2025-07-01');
    const end = new Date('2025-07-31');
    const testDate = new Date('2025-06-30');
    expect(isDateInRange(testDate, start, end)).toBe(false);
  });

  it('범위 이후의 날짜 2025-08-01에 대해 false를 반환한다', () => {
    const start = new Date('2025-07-01');
    const end = new Date('2025-07-31');
    const testDate = new Date('2025-08-01');
    expect(isDateInRange(testDate, start, end)).toBe(false);
  });

  /**
   * 범위 이전 날짜 검증에 대한 테스트와 동일한 목적을 가지는 테스트
   */
  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const start = new Date('2025-07-31');
    const end = new Date('2025-07-01');
    const testDate = new Date('2025-07-15');
    expect(isDateInRange(testDate, start, end)).toBe(false);
  });
});

describe('fillZero', () => {
  // 기본 동작
  it("5를 2자리로 변환하면 '05'를 반환한다", () => {
    expect(fillZero(5, 2)).toBe('05');
  });

  // 기본 동작
  it("10을 2자리로 변환하면 '10'을 반환한다", () => {
    expect(fillZero(10, 2)).toBe('10');
  });

  // 다른 자릿수
  it("3을 3자리로 변환하면 '003'을 반환한다", () => {
    expect(fillZero(3, 3)).toBe('003');
  });

  // 경계값
  it("100을 2자리로 변환하면 '100'을 반환한다", () => {
    expect(fillZero(100, 2)).toBe('100');
  });

  // 경계값
  it("0을 2자리로 변환하면 '00'을 반환한다", () => {
    expect(fillZero(0, 2)).toBe('00');
  });

  // 필요하지 않은 테스트
  it("1을 5자리로 변환하면 '00001'을 반환한다", () => {
    expect(fillZero(1, 5)).toBe('00001');
  });

  // 필요하지 않은 테스트
  it('소수점이 있는 3.14를 5자리로 변환하면 "03.14"를 반환한다', () => {
    expect(fillZero(3.14, 5)).toBe('03.14');
  });

  // 반례
  it('size 파라미터를 생략하면 기본값 2를 사용한다', () => {
    expect(fillZero(5)).toBe('05');
  });

  // 필요하지 않은 테스트
  it('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    expect(fillZero(100, 2)).toBe('100');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    const result = formatDate(new Date('2025-07-15'));
    expect(result).toBe('2025-07-15');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    const result = formatDate(new Date('2025-07-15'), 20);
    expect(result).toBe('2025-07-20');
  });

  /**
   * "날짜를 YYYY-MM-DD 형식으로 포맷팅한다" 테스트에서 충분히 검증이 가능한 테스트이므로,
   * 아래 2개의 테스트는 불필요한 테스트
   */
  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const result = formatDate(new Date('2025-03-15'));
    expect(result).toBe('2025-03-15');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const result = formatDate(new Date('2025-07-05'));
    expect(result).toBe('2025-07-05');
  });
});
