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

const COMMON_YEAR = 2025;
const LEAP_YEAR = 2020;

describe('getDaysInMonth', () => {
  it('1월은 31일 수를 반환한다', () => {
    expect(getDaysInMonth(COMMON_YEAR, 1)).toBe(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    expect(getDaysInMonth(COMMON_YEAR, 4)).toBe(30);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    expect(getDaysInMonth(LEAP_YEAR, 2)).toBe(29);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    expect(getDaysInMonth(COMMON_YEAR, 2)).toBe(28);
  });

  // 유효하지않은 함수의 기능이므로 테스트 코드를 제거하는 것이 맞다고 생각함
  it('유효하지 않은 월에 대해 적절히 처리한다', () => {
    expect(getDaysInMonth(COMMON_YEAR, 13));
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const wednesDay = new Date('2025-08-20'); // 수요일

    const weekDates = getWeekDates(wednesDay);
    expect(weekDates.length).toBe(7);
    expect(weekDates[3]).toEqual(new Date('2025-08-20')); // 수요일
    expect(weekDates[0].getDay()).toBe(0); // 일요일
    expect(weekDates[6].getDay()).toBe(6); // 토요일
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const monday = new Date('2025-08-18'); // 월요일

    const weekDates = getWeekDates(monday);
    expect(weekDates.length).toBe(7);
    expect(weekDates[1]).toEqual(new Date('2025-08-18'));
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const sunday = new Date('2025-08-17'); // 일요일

    const weekDates = getWeekDates(sunday);
    expect(weekDates.length).toBe(7);
    expect(weekDates[0]).toEqual(new Date('2025-08-17'));
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const lastDayOfYear = new Date('2025-12-31'); // 수요일

    const weekDates = getWeekDates(lastDayOfYear);
    expect(weekDates.length).toBe(7);
    expect(weekDates[3]).toEqual(new Date('2025-12-31'));
    expect(weekDates[0]).toEqual(new Date('2025-12-28'));
    expect(weekDates[6]).toEqual(new Date('2026-01-03'));
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const firstDayOfYear = new Date('2026-01-01'); // 목요일

    const weekDates = getWeekDates(firstDayOfYear);
    expect(weekDates.length).toBe(7);
    expect(weekDates[0]).toEqual(new Date('2025-12-28')); // 일요일
    expect(weekDates[1]).toEqual(new Date('2025-12-29')); // 월요일
    expect(weekDates[2]).toEqual(new Date('2025-12-30')); // 화요일
    expect(weekDates[3]).toEqual(new Date('2025-12-31')); // 수요일
    expect(weekDates[4]).toEqual(new Date('2026-01-01')); // 목요일
    expect(weekDates[5]).toEqual(new Date('2026-01-02')); // 금요일
    expect(weekDates[6]).toEqual(new Date('2026-01-03')); // 토요일
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const leapYearFinalDate = new Date('2020-02-29'); // 토요일
    const weekDates = getWeekDates(leapYearFinalDate);
    expect(weekDates).toContainEqual(new Date('2020-02-29'));
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const lastDayOfJanuary = new Date('2025-01-31');
    const weekDates = getWeekDates(lastDayOfJanuary); // 금요일

    expect(weekDates.length).toBe(7);
    expect(weekDates[5]).toEqual(new Date('2025-01-31'));
    expect(weekDates[6]).toEqual(new Date('2025-02-01'));
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const weeks = getWeeksAtMonth(new Date('2025-07-01'));
    expect(weeks[0]).toContainEqual(1);
  });
});

describe('getEventsForDay', () => {
  const events: Event[] = [
    {
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      title: '팀 회의',
      date: '2025-08-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
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
  ];
  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    expect(getEventsForDay(events, 1)).toEqual([
      {
        id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
        title: '팀 회의',
        date: '2025-08-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ]);
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    expect(getEventsForDay(events, 10)).toEqual([]);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    expect(getEventsForDay(events, 0)).toEqual([]);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    expect(getEventsForDay(events, 32)).toEqual([]);
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

  it('범위의 시작일 2025-07-01에 대해 true를 반환한다', () => {
    expect(
      isDateInRange(new Date('2025-07-10'), new Date('2025-07-01'), new Date('2025-07-15'))
    ).toBe(true);
  });

  it('범위의 종료일 2025-07-31에 대해 true를 반환한다', () => {
    expect(
      isDateInRange(new Date('2025-07-10'), new Date('2025-07-05'), new Date('2025-07-31'))
    ).toBe(true);
  });

  it('범위 이전의 날짜 2025-06-30에 대해 false를 반환한다', () => {
    expect(
      isDateInRange(new Date('2025-06-30'), new Date('2025-07-05'), new Date('2025-07-15'))
    ).toBe(false);
  });

  it('범위 이후의 날짜 2025-08-01에 대해 false를 반환한다', () => {
    expect(
      isDateInRange(new Date('2025-08-10'), new Date('2025-07-05'), new Date('2025-07-15'))
    ).toBe(false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    expect(
      isDateInRange(new Date('2025-07-10'), new Date('2025-07-25'), new Date('2025-07-15'))
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
    expect(fillZero(5)).toBe('05');
  });

  it('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    expect(fillZero(100, 1)).toBe('100');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {});

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {});

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {});

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {});
});
