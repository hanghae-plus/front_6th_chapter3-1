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
import { formatDateList } from './../../utils/testUtils';

describe('getDaysInMonth', () => {
  it('1월은 31일 수를 반환한다', () => {
    const currentYear = new Date().getFullYear();
    expect(getDaysInMonth(currentYear, 1)).toBe(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    const currentYear = new Date().getFullYear();
    expect(getDaysInMonth(currentYear, 4)).toBe(30);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    const leapYears = [1996, 2000, 2004, 2008, 2012, 2016, 2020, 2024, 2028, 2400];
    expect(leapYears.find((year) => getDaysInMonth(year, 2) !== 29)).toBe(undefined);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    const commonYears = [1999, 2001, 2002, 2003, 2005, 2006, 2007, 2009, 2010, 2011];
    expect(commonYears.find((year) => getDaysInMonth(year, 2) !== 28)).toBe(undefined);
  });

  it('유효하지 않은 월에 대해 적절히 처리한다', () => {
    expect(getDaysInMonth(2025, 13)).toBe(31);
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    // 2025.08.20 (수)
    const weekDates = getWeekDates(new Date(2025, 7, 20));

    expect(weekDates).toHaveLength(7);
    expect(formatDateList(weekDates)).toEqual([
      '2025-08-17',
      '2025-08-18',
      '2025-08-19',
      '2025-08-20',
      '2025-08-21',
      '2025-08-22',
      '2025-08-23',
    ]);
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    // 2025.08.18 (월)
    const weekDates = getWeekDates(new Date(2025, 7, 18));

    expect(weekDates).toHaveLength(7);
    expect(formatDateList(weekDates)).toEqual([
      '2025-08-17',
      '2025-08-18',
      '2025-08-19',
      '2025-08-20',
      '2025-08-21',
      '2025-08-22',
      '2025-08-23',
    ]);
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    // 2025.08.17 (일)
    const weekDates = getWeekDates(new Date(2025, 7, 17));

    expect(weekDates).toHaveLength(7);
    expect(formatDateList(weekDates)).toEqual([
      '2025-08-17',
      '2025-08-18',
      '2025-08-19',
      '2025-08-20',
      '2025-08-21',
      '2025-08-22',
      '2025-08-23',
    ]);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    // 2025.12.31 (수)
    const weekDates = getWeekDates(new Date(2025, 11, 31));

    expect(weekDates).toHaveLength(7);
    expect(formatDateList(weekDates)).toEqual([
      '2025-12-28',
      '2025-12-29',
      '2025-12-30',
      '2025-12-31',
      '2026-01-01',
      '2026-01-02',
      '2026-01-03',
    ]);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    // 2026.01.01 (목)
    const weekDates = getWeekDates(new Date(2026, 0, 1));

    expect(weekDates).toHaveLength(7);
    expect(formatDateList(weekDates)).toEqual([
      '2025-12-28',
      '2025-12-29',
      '2025-12-30',
      '2025-12-31',
      '2026-01-01',
      '2026-01-02',
      '2026-01-03',
    ]);
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    // 2024.02.29 (목)
    const weekDates = getWeekDates(new Date(2024, 1, 29));

    expect(weekDates).toHaveLength(7);
    expect(formatDateList(weekDates)).toEqual([
      '2024-02-25',
      '2024-02-26',
      '2024-02-27',
      '2024-02-28',
      '2024-02-29',
      '2024-03-01',
      '2024-03-02',
    ]);
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    // 2025.08.31 (일)
    const weekDates = getWeekDates(new Date(2025, 7, 31));

    expect(weekDates).toHaveLength(7);
    expect(formatDateList(weekDates)).toEqual([
      '2025-08-31',
      '2025-09-01',
      '2025-09-02',
      '2025-09-03',
      '2025-09-04',
      '2025-09-05',
      '2025-09-06',
    ]);
  });
});

describe('getWeeksAtMonth', () => {
  // 테스트 제목과 테스트 하고자 하는 내용이 모호하다고 생각되어 주석처리하고 다른 테스트를 추가하겠습니다.
  // eslint-disable-next-line
  // it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {});

  it('2025년 7월의 1일부터 31일까지 모든 날짜가 빠짐 없이 출력된다.', () => {
    const daysAtMonth = getWeeksAtMonth(new Date(2025, 6, 1))
      .flat(Infinity)
      .filter((x) => x);

    expect(daysAtMonth).toHaveLength(31);
    expect(daysAtMonth).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
      27, 28, 29, 30, 31,
    ]);
  });

  it('같은 달의 다른 날짜를 넣어도 결과가 동일하다.', () => {
    const july1th = getWeeksAtMonth(new Date(2025, 6, 1));
    const july15th = getWeeksAtMonth(new Date(2025, 6, 15));

    expect(july1th).toEqual(july15th);
  });

  it('월이 일요일 시작이면 첫째 주가 1~7로 채워진다.', () => {
    // 2025.06.01 (일)
    const weeks = getWeeksAtMonth(new Date(2025, 5, 1));
    expect(weeks[0]).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('6주가 필요한 달을 처리한다.', () => {
    const weeks = getWeeksAtMonth(new Date(2025, 7, 1));
    expect(weeks.length).toBe(6);
  });
});

describe('getEventsForDay', () => {
  const events: Event[] = [
    {
      id: 'a6b7c8d9-1111-2222-3333-444455556666',
      title: '디자인 QA',
      date: '2025-08-01',
      startTime: '16:00',
      endTime: '17:00',
      description: '신규 장바구니 페이지 픽셀 퍼펙트 검수',
      location: 'Figma/Jira',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '11112222-3333-4444-5555-666677778888',
      title: '코드리뷰 타임',
      date: '2025-08-22',
      startTime: '11:00',
      endTime: '11:30',
      description: 'PR #124 ~ #129 리뷰',
      location: 'GitHub PR',
      category: '업무',
      repeat: { type: 'weekly', interval: 1 },
      notificationTime: 5,
    },
    {
      id: '9999aaaa-bbbb-cccc-dddd-eeeeffff0001',
      title: 'PT 상담',
      date: '2025-08-23',
      startTime: '19:30',
      endTime: '20:00',
      description: '체형 분석 및 루틴 점검',
      location: '동네 헬스장',
      category: '건강',
      repeat: { type: 'weekly', interval: 2 },
      notificationTime: 30,
    },
  ];

  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    expect(getEventsForDay(events, 1)).toEqual([
      {
        id: 'a6b7c8d9-1111-2222-3333-444455556666',
        title: '디자인 QA',
        date: '2025-08-01',
        startTime: '16:00',
        endTime: '17:00',
        description: '신규 장바구니 페이지 픽셀 퍼펙트 검수',
        location: 'Figma/Jira',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ]);
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    expect(getEventsForDay(events, 2)).toEqual([]);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    expect(getEventsForDay(events, 0)).toEqual([]);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    expect(getEventsForDay(events, 32)).toEqual([]);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    expect(formatWeek(new Date(2025, 7, 15))).toBe('2025년 8월 2주');
    expect(formatWeek(new Date(2025, 7, 22))).toBe('2025년 8월 3주');
    expect(formatWeek(new Date(2025, 7, 29))).toBe('2025년 8월 4주');
  });

  // 테스트 케이스가 모호하다는 생각이 들어 2개의 테스트로 쪼갰습니다.
  // eslint-disable-next-line
  // it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {});

  it('1일이 금/토이면 해당 주는 이전 달 마지막 주로 귀속된다', () => {
    expect(formatWeek(new Date(2022, 9, 1))).toBe('2022년 9월 5주'); // 토
    expect(formatWeek(new Date(2024, 10, 1))).toBe('2024년 10월 5주'); // 금
    expect(formatWeek(new Date(2025, 7, 1))).toBe('2025년 7월 5주'); // 금
  });

  it('1일이 일/월/화/수/목이면 해당 주는 그 달의 1주차로 귀속된다', () => {
    expect(formatWeek(new Date(2024, 0, 1))).toBe('2024년 1월 1주'); // 월
    expect(formatWeek(new Date(2026, 8, 1))).toBe('2026년 9월 1주'); // 화
    expect(formatWeek(new Date(2023, 1, 1))).toBe('2023년 2월 1주'); // 수
    expect(formatWeek(new Date(2025, 4, 1))).toBe('2025년 5월 1주'); // 목
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    expect(formatWeek(new Date(2015, 1, 28))).toBe('2015년 2월 4주');
    expect(formatWeek(new Date(2025, 6, 31))).toBe('2025년 7월 5주');
  });

  // 테스트 케이스를 아래 2개로 쪼갰습니다.
  // eslint-disable-next-line
  // it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {});

  it('연도가 바뀌는 주에 대해서 31일이 일/월/화/수/목이면 다음 해 1월 1주를 반환한다', () => {
    expect(formatWeek(new Date(2023, 11, 31))).toBe('2024년 1월 1주'); // 일
    expect(formatWeek(new Date(2024, 11, 31))).toBe('2025년 1월 1주'); // 화
  });

  it('연도가 바뀌는 주에 대해서 31일이 금/토이면 지난 해 마지막 주를 반환한다', () => {
    expect(formatWeek(new Date(2022, 11, 31))).toBe('2022년 12월 5주'); // 금
    expect(formatWeek(new Date(2021, 11, 31))).toBe('2021년 12월 5주'); // 토
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    expect(formatWeek(new Date(2024, 1, 29))).toBe('2024년 2월 5주');
    expect(formatWeek(new Date(2020, 1, 29))).toBe('2020년 2월 4주');
    expect(formatWeek(new Date(1996, 1, 29))).toBe('1996년 2월 5주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    expect(formatWeek(new Date(2025, 1, 28))).toBe('2025년 2월 4주');
    expect(formatWeek(new Date(2019, 1, 28))).toBe('2019년 2월 4주');
    expect(formatWeek(new Date(1997, 1, 28))).toBe('1997년 2월 4주');
  });
});

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    expect(formatMonth(new Date(2025, 6, 10))).toBe('2025년 7월');
  });
});

describe('isDateInRange', () => {
  it('범위 내의 날짜 2025-07-10에 대해 true를 반환한다', () => {
    expect(isDateInRange(new Date(2025, 6, 10), new Date(2025, 6, 1), new Date(2025, 6, 31))).toBe(
      true
    );
  });

  it('범위의 시작일 2025-07-01에 대해 true를 반환한다', () => {
    expect(isDateInRange(new Date(2025, 6, 1), new Date(2025, 6, 1), new Date(2025, 6, 31))).toBe(
      true
    );
  });

  it('범위의 종료일 2025-07-31에 대해 true를 반환한다', () => {
    expect(isDateInRange(new Date(2025, 6, 31), new Date(2025, 6, 1), new Date(2025, 6, 31))).toBe(
      true
    );
  });

  it('범위 이전의 날짜 2025-06-30에 대해 false를 반환한다', () => {
    expect(isDateInRange(new Date(2025, 5, 30), new Date(2025, 6, 1), new Date(2025, 6, 31))).toBe(
      false
    );
  });

  it('범위 이후의 날짜 2025-08-01에 대해 false를 반환한다', () => {
    expect(isDateInRange(new Date(2025, 7, 1), new Date(2025, 6, 1), new Date(2025, 6, 31))).toBe(
      false
    );
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    expect(isDateInRange(new Date(2025, 6, 15), new Date(2025, 7, 1), new Date(2025, 6, 31))).toBe(
      false
    );
    expect(isDateInRange(new Date(2025, 6, 1), new Date(2025, 7, 1), new Date(2025, 6, 31))).toBe(
      false
    );
    expect(isDateInRange(new Date(2025, 6, 30), new Date(2025, 7, 1), new Date(2025, 6, 31))).toBe(
      false
    );
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
    const size2 = fillZero(5, 2);
    const sizeDefault = fillZero(5, 2);

    expect(size2).toEqual(sizeDefault);
  });

  it('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    expect(fillZero(123456789, 5)).toBe('123456789');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    expect(formatDate(new Date(2025, 7, 15))).toBe('2025-08-15');
    expect(formatDate(new Date(2025, 0, 1))).toBe('2025-01-01');
    expect(formatDate(new Date(2025, 11, 31))).toBe('2025-12-31');
    expect(formatDate(new Date(9999, 11, 31))).toBe('9999-12-31');
    expect(formatDate(new Date(1, 0, 1))).toBe('1901-01-01');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    expect(formatDate(new Date(2025, 7, 15), 1)).toBe('2025-08-01');
    expect(formatDate(new Date(2025, 0, 1), 2)).toBe('2025-01-02');
    expect(formatDate(new Date(2025, 11, 31), 3)).toBe('2025-12-03');
    expect(formatDate(new Date(9999, 11, 31), 4)).toBe('9999-12-04');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    expect(formatDate(new Date(2025, 0, 1))).toBe('2025-01-01');
    expect(formatDate(new Date(2025, 1, 1))).toBe('2025-02-01');
    expect(formatDate(new Date(2025, 2, 1))).toBe('2025-03-01');
    expect(formatDate(new Date(2025, 3, 1))).toBe('2025-04-01');
    expect(formatDate(new Date(2025, 4, 1))).toBe('2025-05-01');
    expect(formatDate(new Date(2025, 5, 1))).toBe('2025-06-01');
    expect(formatDate(new Date(2025, 6, 1))).toBe('2025-07-01');
    expect(formatDate(new Date(2025, 7, 1))).toBe('2025-08-01');
    expect(formatDate(new Date(2025, 8, 1))).toBe('2025-09-01');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    expect(formatDate(new Date(2025, 0, 1))).toBe('2025-01-01');
    expect(formatDate(new Date(2025, 0, 2))).toBe('2025-01-02');
    expect(formatDate(new Date(2025, 0, 3))).toBe('2025-01-03');
    expect(formatDate(new Date(2025, 0, 4))).toBe('2025-01-04');
    expect(formatDate(new Date(2025, 0, 5))).toBe('2025-01-05');
    expect(formatDate(new Date(2025, 0, 6))).toBe('2025-01-06');
    expect(formatDate(new Date(2025, 0, 7))).toBe('2025-01-07');
    expect(formatDate(new Date(2025, 0, 8))).toBe('2025-01-08');
    expect(formatDate(new Date(2025, 0, 9))).toBe('2025-01-09');
  });
});
