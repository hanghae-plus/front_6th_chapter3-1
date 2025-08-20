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
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {});
});

describe('getEventsForDay', () => {
  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {});

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {});

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {});

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {});
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
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {});
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
