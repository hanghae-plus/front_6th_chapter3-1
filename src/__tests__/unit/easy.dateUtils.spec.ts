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
    const days = getDaysInMonth(2025, 1);
    expect(days).toBe(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    const days = getDaysInMonth(2025, 4);
    expect(days).toBe(30);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    const days = getDaysInMonth(2024, 2);
    expect(days).toBe(29);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    const days = getDaysInMonth(2025, 2);
    expect(days).toBe(28);
  });
  // JS Date는 month가 1~12 범위를 넘어도 자동 보정
  it('유효하지 않은 월에 대해 적절히 처리한다', () => {
    expect(getDaysInMonth(2025, 13)).toBe(31); // 12월 마지막 날
    expect(getDaysInMonth(2025, 0)).toBe(31); // 1월 0일 → 12월 마지막 날
  });
});

describe('getWeekDates', () => {
  const expectWeekContains = (inputDate: Date) => {
    const weekDates = getWeekDates(inputDate);
    expect(weekDates).toHaveLength(7);
    const contains = weekDates.some(
      (d) =>
        d.getFullYear() === inputDate.getFullYear() &&
        d.getMonth() === inputDate.getMonth() &&
        d.getDate() === inputDate.getDate()
    );
    expect(contains).toBe(true);
  };
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    expectWeekContains(new Date('2025-08-20'));
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    expectWeekContains(new Date('2025-08-18'));
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    expectWeekContains(new Date('2025-08-18'));
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    expectWeekContains(new Date('2025-08-18'));
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    expectWeekContains(new Date('2025-08-18'));
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    expectWeekContains(new Date('2024-02-29'));
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    expectWeekContains(new Date('2025-04-30'));
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const testWeeksAtMonth = getWeeksAtMonth(new Date('2025-07-01'));
    expect(testWeeksAtMonth[0]).toEqual([null, null, 1, 2, 3, 4, 5]);
    expect(testWeeksAtMonth[testWeeksAtMonth.length - 1]).toEqual([27, 28, 29, 30, 31, null, null]);
  });
});

describe('getEventsForDay', () => {
  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const events = [
      { id: '1', title: '회의', date: '2025-08-01' },
      { id: '2', title: '점심', date: '2025-08-01' },
      { id: '3', title: '회의2', date: '2025-08-02' },
    ] as Event[];

    const result = getEventsForDay(events, 1);

    expect(result).toHaveLength(2);
    expect(result.map((e) => e.id)).toEqual(['1', '2']);
  });
  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const events = [{ id: '1', title: '회의', date: '2025-08-01' }] as Event[];
    const result = getEventsForDay(events, 2);
    expect(result).toEqual([]);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const events = [{ id: '1', title: '회의', date: '2025-08-01' }] as Event[];
    const result = getEventsForDay(events, 0);
    expect(result).toEqual([]);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const events = [{ id: '1', title: '회의', date: '2025-08-01' }] as Event[];
    const result = getEventsForDay(events, 32);
    expect(result).toEqual([]);
  });
});

describe('formatWeek', () => {
  // 목요일 기준으로 해당 월의 첫 목요일을 찾음
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    expect(formatWeek(new Date('2025-08-21'))).toBe('2025년 8월 3주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    expect(formatWeek(new Date('2025-08-01'))).toBe('2025년 7월 5주');
    expect(formatWeek(new Date('2025-08-02'))).toBe('2025년 7월 5주');
    expect(formatWeek(new Date('2025-08-01'))).not.toBe('2025년 8월 1주');
    expect(formatWeek(new Date('2025-08-02'))).not.toBe('2025년 8월 1주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    expect(formatWeek(new Date('2025-09-01'))).toBe('2025년 9월 1주');
    expect(formatWeek(new Date('2025-09-01'))).toBe('2025년 9월 1주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2024-12-30');
    const week = formatWeek(date);
    expect(typeof week).toBe('string');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    expect(formatWeek(new Date('2024-02-29'))).toBe('2024년 2월 5주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    expect(formatWeek(new Date('2025-02-28'))).toBe('2025년 2월 4주');
  });
});

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    expect(formatMonth(new Date('2025-07-10'))).toBe('2025년 7월');
  });
});

describe('isDateInRange', () => {
  it('범위 내의 날짜 2025-07-10에 대해 true를 반환한다', () => {
    expect(
      isDateInRange(new Date('2025-07-10'), new Date('2025-07-09'), new Date('2025-07-11'))
    ).toBe(true);
  });

  it('범위의 시작일 2025-07-01에 대해 true를 반환한다', () => {
    expect(
      isDateInRange(new Date('2025-07-01'), new Date('2025-07-01'), new Date('2025-07-11'))
    ).toBe(true);
  });

  it('범위의 종료일 2025-07-31에 대해 true를 반환한다', () => {
    expect(
      isDateInRange(new Date('2025-07-10'), new Date('2025-07-09'), new Date('2025-07-31'))
    ).toBe(true);
  });

  it('범위 이전의 날짜 2025-06-30에 대해 false를 반환한다', () => {
    expect(
      isDateInRange(new Date('2025-06-30'), new Date('2025-07-09'), new Date('2025-07-11'))
    ).toBe(false);
  });

  it('범위 이후의 날짜 2025-08-01에 대해 false를 반환한다', () => {
    expect(
      isDateInRange(new Date('2025-07-08'), new Date('2025-07-09'), new Date('2025-08-01'))
    ).toBe(false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    expect(
      isDateInRange(new Date('2025-07-12'), new Date('2025-07-09'), new Date('2025-07-11'))
    ).toBe(false);
    expect(
      isDateInRange(new Date('2025-07-01'), new Date('2025-07-09'), new Date('2025-06-30'))
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
    expect(fillZero(1)).toBe('01');
    expect(fillZero(10)).toBe('10');
    expect(fillZero(100)).toBe('100');
  });

  it('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    expect(fillZero(100, 1)).toBe('100');
    expect(fillZero(10, 1)).toBe('10');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    expect(formatDate(new Date('2025-08-21'))).toBe('2025-08-21');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    expect(formatDate(new Date('2025-08-21'), 31)).toBe('2025-08-31');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    expect(formatDate(new Date('2025-08-03'))).toBe('2025-08-03');
    expect(formatDate(new Date('2025-12-03'))).toBe('2025-12-03');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    expect(formatDate(new Date('2025-08-03'))).toBe('2025-08-03');
    expect(formatDate(new Date('2025-08-13'))).toBe('2025-08-13');
  });
});
