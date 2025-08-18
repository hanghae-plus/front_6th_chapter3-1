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
import { createMockEvent } from '../utils';

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
    expect(getDaysInMonth(2025, 13)).toBe(31);
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    // 과제 진행 중인 2025년 8월 17일 기준으로..
    expect(getWeekDates(new Date('2025-08-20'))).toHaveLength(7);

    const weekDates = getWeekDates(new Date('2025-08-20'));

    expect(weekDates[0].getDate()).toBe(17);
    expect(weekDates[6].getDate()).toBe(23);
  });

  it('월요일에 대해 올바른 주의 날짜들을 반환한다', () => {
    // 과제 진행 중인 2025년 8월 17일 기준으로..
    expect(getWeekDates(new Date('2025-08-18'))).toHaveLength(7);

    const weekDates = getWeekDates(new Date('2025-08-18'));

    expect(weekDates[0].getDate()).toBe(17);
    expect(weekDates[6].getDate()).toBe(23);
  });

  it('일요일에 대해 올바른 주의 날짜들을 반환한다', () => {
    expect(getWeekDates(new Date('2025-08-17'))).toHaveLength(7);

    const weekDates = getWeekDates(new Date('2025-08-17'));

    expect(weekDates[0].getDate()).toBe(17);
    expect(weekDates[6].getDate()).toBe(23);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    expect(getWeekDates(new Date('2025-12-31'))).toHaveLength(7);

    const weekDates = getWeekDates(new Date('2025-12-31'));

    expect(weekDates[0].getDate()).toBe(28);
    expect(weekDates[6].getDate()).toBe(3);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    expect(getWeekDates(new Date('2025-01-01'))).toHaveLength(7);

    const weekDates = getWeekDates(new Date('2025-01-01'));

    expect(weekDates[0].getDate()).toBe(29);
    expect(weekDates[6].getDate()).toBe(4);
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    expect(getWeekDates(new Date('2024-02-29'))).toHaveLength(7);

    const weekDates = getWeekDates(new Date('2024-02-29'));

    expect(weekDates[0].getDate()).toBe(25);
    expect(weekDates[6].getDate()).toBe(2);
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    expect(getWeekDates(new Date('2025-08-31'))).toHaveLength(7);

    const weekDates = getWeekDates(new Date('2025-08-31'));

    expect(weekDates[0].getDate()).toBe(31);
    expect(weekDates[6].getDate()).toBe(6);
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const expectedWeeks = [
      [null, null, 1, 2, 3, 4, 5],
      [6, 7, 8, 9, 10, 11, 12],
      [13, 14, 15, 16, 17, 18, 19],
      [20, 21, 22, 23, 24, 25, 26],
      [27, 28, 29, 30, 31, null, null],
    ];

    const result = getWeeksAtMonth(new Date('2025-07-01'));
    expect(result).toEqual(expectedWeeks);
  });
});

describe('getEventsForDay', () => {
  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const events = [
      createMockEvent(1, { date: '2025-08-01' }), // 1일
      createMockEvent(2, { date: '2025-08-02' }), // 2일
      createMockEvent(3, { date: '2025-08-01' }), // 1일
    ];

    const result = getEventsForDay(events, 1);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('3');
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const events = [
      createMockEvent(1, { date: '2025-08-02' }), // 2일
      createMockEvent(2, { date: '2025-08-03' }), // 3일
      createMockEvent(3, { date: '2025-08-04' }), // 4일
    ];

    // 1일에 해당하는 이벤트를 찾는데 없도록 처리하자
    const result = getEventsForDay(events, 1);

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const events = [
      createMockEvent(1, { date: '2025-08-01' }), // 1일
      createMockEvent(2, { date: '2025-08-02' }), // 2일
      createMockEvent(3, { date: '2025-08-03' }), // 3일
    ];

    // 0일에 해당하는 이벤트를 찾는데 없도록 처리하자 반복
    const result = getEventsForDay(events, 0);

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const events = [
      createMockEvent(1, { date: '2025-08-01' }), // 1일
      createMockEvent(2, { date: '2025-08-02' }), // 2일
      createMockEvent(3, { date: '2025-08-03' }), // 3일
    ];

    // 32일에 해당하는 이벤트를 찾는데 없도록 처리하자 반복..반복
    const result = getEventsForDay(events, 32);

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date('2025-08-18'));

    expect(result).toBe('2025년 8월 3주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date('2025-08-04'));

    expect(result).toBe('2025년 8월 1주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date('2025-08-31'));

    expect(result).toBe('2025년 9월 1주');
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
  it('범위 내의 날짜 2025-07-10에 대해 true를 반환한다', () => {
    const result = isDateInRange(
      new Date('2025-07-10'),
      new Date('2025-07-01'),
      new Date('2025-07-31')
    );

    expect(result).toBe(true);
  });

  it('범위의 시작일 2025-07-01에 대해 true를 반환한다', () => {
    const result = isDateInRange(
      new Date('2025-07-01'),
      new Date('2025-07-01'),
      new Date('2025-07-31')
    );

    expect(result).toBe(true);
  });

  it('범위의 종료일 2025-07-31에 대해 true를 반환한다', () => {
    const result = isDateInRange(
      new Date('2025-07-31'),
      new Date('2025-07-01'),
      new Date('2025-07-31')
    );

    expect(result).toBe(true);
  });

  it('범위 이전의 날짜 2025-06-30에 대해 false를 반환한다', () => {
    const result = isDateInRange(
      new Date('2025-06-30'),
      new Date('2025-07-01'),
      new Date('2025-07-31')
    );

    expect(result).toBe(false);
  });

  it('범위 이후의 날짜 2025-08-01에 대해 false를 반환한다', () => {
    const result = isDateInRange(
      new Date('2025-08-01'),
      new Date('2025-07-01'),
      new Date('2025-07-31')
    );

    expect(result).toBe(false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const result = isDateInRange(
      new Date('2025-07-31'),
      new Date('2025-08-01'),
      new Date('2025-07-01')
    );

    expect(result).toBe(false);
  });
});

describe('fillZero', () => {
  it("5를 2자리로 변환하면 '05'를 반환한다", () => {
    const result = fillZero(5);

    expect(result).toBe('05');
  });

  it("10을 2자리로 변환하면 '10'을 반환한다", () => {
    const result = fillZero(10);

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
    const result = fillZero(1234);

    expect(result).toBe('1234');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    const result = formatDate(new Date('2025-08-18'));

    expect(result).toBe('2025-08-18');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    const result = formatDate(new Date('2025-08-18'), 19);

    expect(result).toBe('2025-08-19');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const result = formatDate(new Date('2025-7-18'));

    expect(result).toBe('2025-07-18');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const result = formatDate(new Date('2025-8-8'));

    expect(result).toBe('2025-08-08');
  });
});
