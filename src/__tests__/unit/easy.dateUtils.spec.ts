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

const COMMON_YEAR = 2025; //평년 테스트용
const LEAP_YEAR = 2024; //윤년 테스트용

describe('getDaysInMonth', () => {
  it('1월은 31일 수를 반환한다', () => {
    expect(getDaysInMonth(COMMON_YEAR, 1)).toBe(31);
    expect(getDaysInMonth(LEAP_YEAR, 1)).toBe(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    expect(getDaysInMonth(COMMON_YEAR, 4)).toBe(30);
    expect(getDaysInMonth(LEAP_YEAR, 4)).toBe(30);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    expect(getDaysInMonth(LEAP_YEAR, 2)).toBe(29);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    expect(getDaysInMonth(COMMON_YEAR, 2)).toBe(28);
  });

  // 여기서 말하는 적절히란?? NaN을 반환?
  it('유효하지 않은 월에 대해 적절히 처리한다', () => {
    /**
     * JS Date는 month가 숫자이면 node/browser에서 자동으로 보정함
     * 따라서 "유효하지 않은 월" 테스트는 TS가 걸러주지 못한 값을 테스트
     * number타입이지만 유효하지 않은 NaN, Infinity 테스트
     * any로 형변환한 경우도 테스트
     */

    expect(getDaysInMonth(COMMON_YEAR, NaN)).toBeNaN();
    expect(getDaysInMonth(COMMON_YEAR, Infinity)).toBeNaN();
    expect(getDaysInMonth(COMMON_YEAR, 'abc' as unknown as number)).toBeNaN();
  });
});

describe('getWeekDates', () => {
  // 참조값 비교가 아닌 값 비교를 위해 matcher로 toEqual를 사용

  const WEEK_AUG_17_TO_23_2025 = [
    new Date(2025, 7, 17),
    new Date(2025, 7, 18),
    new Date(2025, 7, 19),
    new Date(2025, 7, 20),
    new Date(2025, 7, 21),
    new Date(2025, 7, 22),
    new Date(2025, 7, 23),
  ];

  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    expect(getWeekDates(new Date(2025, 7, 20))).toEqual(WEEK_AUG_17_TO_23_2025);
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    expect(getWeekDates(new Date(2025, 7, 18))).toEqual(WEEK_AUG_17_TO_23_2025);
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    expect(getWeekDates(new Date(2025, 7, 17))).toEqual(WEEK_AUG_17_TO_23_2025);
  });

  const WEEK_DEC_28_2025_TO_JAN_3_2026 = [
    new Date(2025, 11, 28),
    new Date(2025, 11, 29),
    new Date(2025, 11, 30),
    new Date(2025, 11, 31),
    new Date(2026, 0, 1),
    new Date(2026, 0, 2),
    new Date(2026, 0, 3),
  ];
  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    expect(getWeekDates(new Date(2025, 11, 31))).toEqual(WEEK_DEC_28_2025_TO_JAN_3_2026);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    expect(getWeekDates(new Date(2026, 0, 1))).toEqual(WEEK_DEC_28_2025_TO_JAN_3_2026);
  });

  const WEEK_FEB_25_TO_MAR_2_2024 = [
    new Date(2024, 1, 25),
    new Date(2024, 1, 26),
    new Date(2024, 1, 27),
    new Date(2024, 1, 28),
    new Date(2024, 1, 29),
    new Date(2024, 2, 1),
    new Date(2024, 2, 2),
  ];

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    expect(getWeekDates(new Date(LEAP_YEAR, 1, 29))).toEqual(WEEK_FEB_25_TO_MAR_2_2024);
  });

  const WEEK_JAN_25_TO_31_2026 = [
    new Date(2026, 0, 25),
    new Date(2026, 0, 26),
    new Date(2026, 0, 27),
    new Date(2026, 0, 28),
    new Date(2026, 0, 29),
    new Date(2026, 0, 30),
    new Date(2026, 0, 31),
  ];

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    expect(getWeekDates(new Date(2026, 0, 31))).toEqual(WEEK_JAN_25_TO_31_2026);
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    expect(getWeeksAtMonth(new Date(2025, 6, 1))).toEqual([
      [null, null, 1, 2, 3, 4, 5],
      [6, 7, 8, 9, 10, 11, 12],
      [13, 14, 15, 16, 17, 18, 19],
      [20, 21, 22, 23, 24, 25, 26],
      [27, 28, 29, 30, 31, null, null],
    ]);
  });
});

describe('getEventsForDay', () => {
  const MOCK_EVENTS: Event[] = [
    {
      id: 'new-1',
      title: '오전 회의',
      date: '2025-08-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '월초 팀 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: 'new-2',
      title: '오후 미팅',
      date: '2025-08-01',
      startTime: '14:00',
      endTime: '15:00',
      description: '월초 프로젝트 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: '09702fb3-a478-40b3-905e-9ab3c8849dcd',
      title: '점심 약속',
      date: '2025-08-21',
      startTime: '12:30',
      endTime: '13:30',
      description: '동료와 점심 식사',
      location: '회사 근처 식당',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: 'da3ca408-836a-4d98-b67a-ca389d07552b',
      title: '프로젝트 마감',
      date: '2025-08-25',
      startTime: '09:00',
      endTime: '18:00',
      description: '분기별 프로젝트 마감',
      location: '사무실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: 'dac62941-69e5-4ec0-98cc-24c2a79a7f81',
      title: '생일 파티',
      date: '2025-08-28',
      startTime: '19:00',
      endTime: '22:00',
      description: '친구 생일 축하',
      location: '친구 집',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: '80d85368-b4a4-47b3-b959-25171d49371f',
      title: '운동',
      date: '2025-08-22',
      startTime: '18:00',
      endTime: '19:00',
      description: '주간 운동',
      location: '헬스장',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
  ];

  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    expect(getEventsForDay(MOCK_EVENTS, 1)).toEqual([MOCK_EVENTS[0], MOCK_EVENTS[1]]);
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    expect(getEventsForDay(MOCK_EVENTS, 2)).toEqual([]);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    expect(getEventsForDay(MOCK_EVENTS, 0)).toEqual([]);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    expect(getEventsForDay(MOCK_EVENTS, 32)).toEqual([]);
    expect(getEventsForDay(MOCK_EVENTS, 100)).toEqual([]);
  });
});

// 주의 기준은 '목요일'로 한다.
describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    expect(formatWeek(new Date(2025, 7, 18))).toBe('2025년 8월 3주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    expect(formatWeek(new Date(2025, 7, 4))).toBe('2025년 8월 1주');
    expect(formatWeek(new Date(2025, 7, 7))).toBe('2025년 8월 1주');
    expect(formatWeek(new Date(2025, 7, 9))).toBe('2025년 8월 1주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    expect(formatWeek(new Date(2025, 7, 24))).toBe('2025년 8월 4주');
    expect(formatWeek(new Date(2025, 7, 28))).toBe('2025년 8월 4주');
    expect(formatWeek(new Date(2025, 7, 30))).toBe('2025년 8월 4주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    expect(formatWeek(new Date(2025, 11, 29))).toBe('2026년 1월 1주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    expect(formatWeek(new Date(2024, 1, 26))).toBe('2024년 2월 5주');
    expect(formatWeek(new Date(2028, 1, 27))).toBe('2028년 3월 1주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    expect(formatWeek(new Date(2025, 1, 26))).toBe('2025년 2월 4주');
    expect(formatWeek(new Date(2026, 1, 26))).toBe('2026년 2월 4주');
  });
});

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    expect(formatMonth(new Date(2025, 6, 10))).toBe('2025년 7월');
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
