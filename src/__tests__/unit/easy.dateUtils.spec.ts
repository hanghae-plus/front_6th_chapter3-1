import { setupMockHandlerUpdating } from '../../__mocks__/handlersUtils';
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
    expect(getDaysInMonth(2025, 1)).toEqual(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    expect(getDaysInMonth(2025, 4)).toEqual(30);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    expect(getDaysInMonth(2024, 2)).toEqual(29);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    expect(getDaysInMonth(2025, 2)).toEqual(28);
  });

  // 적절하지 않은 테스트 케이스라고 판단되어 주석 처리
  // Why : JS의 date객체가 스스로 보정함, 즉 이 함수에 대한 테스트가 아니라 JS의 내부 동작에 대한 테스트이기 때문에 주석 처리
  // it('유효하지 않은 월에 대해 적절히 처리한다', () => {
  //   const unValidMonth = [0, 13, -1];
  //   // 0월은 이전 해의 12월로 처리 (31일)
  //   // 13월은 다음 해의 1월로 처리 (31일)
  //   // -1월은 이전 해의 11월로 처리 (30일)
  //   const result = unValidMonth.map((month) => getDaysInMonth(2025, month));
  //   expect(result).toEqual([31, 31, 30]);
  // });
});

describe('getWeekDates', () => {
  describe('주중 날짜에 대한 올바른 처리', () => {
    // 수요일
    const wed = new Date('2025-08-20');

    // 월요일
    const mon = new Date('2025-08-18');

    // 일요일
    const sun = new Date('2025-08-17');

    // 이번주
    const baseWeeks = [
      '2025-08-17', // 일
      '2025-08-18', // 월
      '2025-08-19', // 화
      '2025-08-20', // 수
      '2025-08-21', // 목
      '2025-08-22', // 금
      '2025-08-23', // 토
    ];

    it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
      const result = getWeekDates(wed);
      expect(result.map((date) => date.toISOString().split('T')[0])).toEqual(baseWeeks);
    });

    it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
      const result = getWeekDates(mon);
      expect(result.map((date) => date.toISOString().split('T')[0])).toEqual(baseWeeks);
    });

    it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
      const result = getWeekDates(sun);
      expect(result.map((date) => date.toISOString().split('T')[0])).toEqual(baseWeeks);
    });
  });
  describe('연도를 넘어가는 날짜 처리', () => {
    //연말
    const yearLastDay = new Date('2025-12-31');
    //연초
    const yearFirstDay = new Date('2026-01-01');
    // 연말 마지막 주 이면서 연초 첫 번째 주
    const yearLastWeek = [
      '2025-12-28',
      '2025-12-29',
      '2025-12-30',
      '2025-12-31',
      '2026-01-01',
      '2026-01-02',
      '2026-01-03',
    ];

    it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
      const result = getWeekDates(yearLastDay);
      expect(result.map((date) => date.toISOString().split('T')[0])).toEqual(yearLastWeek);
    });

    it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
      const result = getWeekDates(yearFirstDay);
      expect(result.map((date) => date.toISOString().split('T')[0])).toEqual(yearLastWeek);
    });
  });

  describe('특수한 달 처리', () => {
    it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
      // 윤년의 2월 29일
      const leapDay = new Date('2024-02-29');
      // 윤년의 2월 29일이 속한 주
      const leapWeek = [
        '2024-02-25',
        '2024-02-26',
        '2024-02-27',
        '2024-02-28',
        '2024-02-29',
        '2024-03-01',
        '2024-03-02',
      ];

      const result = getWeekDates(leapDay);
      expect(result.map((date) => date.toISOString().split('T')[0])).toEqual(leapWeek);
    });

    it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
      const monthLastDay = new Date('2025-08-31');
      const monthLastWeek = [
        '2025-08-31',
        '2025-09-01',
        '2025-09-02',
        '2025-09-03',
        '2025-09-04',
        '2025-09-05',
        '2025-09-06',
      ];
      const result = getWeekDates(monthLastDay);
      expect(result.map((date) => date.toISOString().split('T')[0])).toEqual(monthLastWeek);
    });
  });
});

describe('getWeeksAtMonth', () => {
  // AS IS : "2025년 7월 1일의 주 정보를 반환한다" (함수 스펙과 어긋남)
  // TO BE : "2025년 7월 중 임의의 날짜를 입력하면, 7월 전체를 주 단위 배열로 반환한다"
  it('2025년 7월 중 임의의 날짜를 입력하면, 7월 전체를 주 단위 배열로 반환한다', () => {
    const day = new Date('2025-07-01');
    const week = [
      [null, null, 1, 2, 3, 4, 5],
      [6, 7, 8, 9, 10, 11, 12],
      [13, 14, 15, 16, 17, 18, 19],
      [20, 21, 22, 23, 24, 25, 26],
      [27, 28, 29, 30, 31, null, null],
    ];
    const result = getWeeksAtMonth(day);

    expect(result).toEqual(week);
  });
});

describe('getEventsForDay', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '기존 회의',
      date: '2025-08-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '기존 회의2',
      date: '2025-08-01',
      startTime: '11:00',
      endTime: '12:00',
      description: '기존 팀 미팅 2',
      location: '회의실 C',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '3',
      title: '기존 회의3',
      date: '2025-08-02',
      startTime: '11:00',
      endTime: '12:00',
      description: '기존 팀 미팅 3',
      location: '회의실 D',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const result = getEventsForDay(events, 1);
    const filteredEvents = events.filter((event) => event.date === '2025-08-01');
    expect(result).toEqual(filteredEvents);
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    // 3일에 이벤트가 없음
    const noEventDay = 3;
    const result = getEventsForDay(events, noEventDay);
    expect(result).toEqual([]);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(events, 0);
    expect(result).toEqual([]);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(events, 32);
    expect(result).toEqual([]);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const day = new Date('2025-08-15');
    const week = 2; // 2025-08-10 ~ 2025-08-16은 8월의 2주차
    const result = formatWeek(day);
    expect(result).toEqual(`2025년 8월 ${week}주`);
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const day = new Date('2025-08-09');
    const week = 1; // 2025-08-09는 8월의 1주차
    const result = formatWeek(day);
    expect(result).toEqual(`2025년 8월 ${week}주`);
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const day = new Date('2025-08-30');
    const week = 4; // 2025-08-24~2025-08-30은 8월의 4주차 이자 마지막 주차
    const result = formatWeek(day);
    expect(result).toEqual(`2025년 8월 ${week}주`);
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const day = new Date('2026-01-01');
    const week = 1; // 2026-01-01은 2026년 1월의 1주차 (목요일)
    const result = formatWeek(day);
    expect(result).toEqual(`2026년 1월 ${week}주`);
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const day = new Date('2024-02-29'); // 2024년은 윤년, 2/29 존재
    const week = 5; // 2024-02-26~2024-03-03 주의 목요일은 2/29 → 2월 5주차
    const result = formatWeek(day);
    expect(result).toEqual(`2024년 2월 ${week}주`);
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const day = new Date('2025-02-28'); // 2025년은 평년
    const week = 4; // 2025-02-24~2025-03-02 주의 목요일은 2/27 → 2월 4주차
    const result = formatWeek(day);
    expect(result).toEqual(`2025년 2월 ${week}주`);
  });
});

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    const day = new Date('2025-07-10');
    const result = formatMonth(day);
    expect(result).toEqual('2025년 7월');
  });
});

describe('isDateInRange', () => {
  // 범위에 대한 동일한 테스트를 진행하므로 범위에 대한 테스트로 한번 감싸서 테스트 진행
  describe('범위 2025-07-01 ~ 2025-07-31에 대한 테스트', () => {
    const start = new Date('2025-07-01');
    const end = new Date('2025-07-31');

    it('범위 내의 날짜 2025-07-10에 대해 true를 반환한다', () => {
      const day = new Date('2025-07-10');
      const result = isDateInRange(day, start, end);
      expect(result).toEqual(true);
    });

    it('범위의 시작일 2025-07-01에 대해 true를 반환한다', () => {
      const day = new Date('2025-07-01');
      const result = isDateInRange(day, start, end);
      expect(result).toEqual(true);
    });

    it('범위의 종료일 2025-07-31에 대해 true를 반환한다', () => {
      const day = new Date('2025-07-31');
      const result = isDateInRange(day, start, end);
      expect(result).toEqual(true);
    });

    it('범위 이전의 날짜 2025-06-30에 대해 false를 반환한다', () => {
      const day = new Date('2025-06-30');
      const result = isDateInRange(day, start, end);
      expect(result).toEqual(false);
    });

    it('범위 이후의 날짜 2025-08-01에 대해 false를 반환한다', () => {
      const day = new Date('2025-08-01');
      const result = isDateInRange(day, start, end);
      expect(result).toEqual(false);
    });
  });
  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const start = new Date('2025-07-31');
    const end = new Date('2025-07-01');
    const days = [
      new Date('2025-06-30'),
      new Date('2025-07-01'),
      new Date('2025-07-15'),
      new Date('2025-07-31'),
      new Date('2025-08-01'),
    ];
    const result = days.map((day) => isDateInRange(day, start, end));
    expect(result).toEqual([false, false, false, false, false]);
  });
});

describe('fillZero', () => {
  it("5를 2자리로 변환하면 '05'를 반환한다", () => {
    const result = fillZero(5, 2);
    expect(result).toEqual('05');
  });

  it("10을 2자리로 변환하면 '10'을 반환한다", () => {
    const result = fillZero(10, 2);
    expect(result).toEqual('10');
  });

  it("3을 3자리로 변환하면 '003'을 반환한다", () => {
    const result = fillZero(3, 3);
    expect(result).toEqual('003');
  });

  it("100을 2자리로 변환하면 '100'을 반환한다", () => {
    const result = fillZero(100, 2);
    expect(result).toEqual('100');
  });

  it("0을 2자리로 변환하면 '00'을 반환한다", () => {
    const result = fillZero(0, 2);
    expect(result).toEqual('00');
  });

  it("1을 5자리로 변환하면 '00001'을 반환한다", () => {
    const result = fillZero(1, 5);
    expect(result).toEqual('00001');
  });

  it("소수점이 있는 3.14를 5자리로 변환하면 '03.14'를 반환한다", () => {
    const result = fillZero(3.14, 5);
    expect(result).toEqual('03.14');
  });

  it('size 파라미터를 생략하면 기본값 2를 사용한다', () => {
    const result = fillZero(1, 2);
    expect(result).toEqual('01');
  });

  it('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    const result = fillZero(100, 2);
    expect(result).toEqual('100');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    const day = new Date('2025-01-01');
    const result = formatDate(day);
    expect(result).toEqual('2025-01-01');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    const day = new Date('2025-01-01');
    const result = formatDate(day, 10);
    expect(result).toEqual('2025-01-10');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const day = new Date('2025-01-01');
    const result = formatDate(day);
    expect(result).toEqual('2025-01-01');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const day = new Date('2025-01-01');
    const result = formatDate(day, 1);
    expect(result).toEqual('2025-01-01');
  });

  // 테스트 케이스 추가
  it('월이 두 자리 수일 때 그대로 반환한다.', () => {
    const day = new Date('2025-12-01');
    const result = formatDate(day);
    expect(result).toEqual('2025-12-01');
  });

  // 테스트 케이스 추가
  it('일이 두 자리 수일 때 그대로 반환한다.', () => {
    const day = new Date('2025-01-10');
    const result = formatDate(day);
    expect(result).toEqual('2025-01-10');
  });
});
