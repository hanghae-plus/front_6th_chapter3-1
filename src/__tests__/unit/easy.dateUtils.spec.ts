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
    // Arrange: 2025년 1월을 테스트하려고 함
    const year = 2025;
    const month = 1;

    // Act: getDaysInMonth 함수를 실행
    const result = getDaysInMonth(year, month);

    // Assert: 결과가 31인지 확인
    expect(result).toBe(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    // Arrange: 2025년 4월을 테스트하려고 함
    const year = 2025;
    const month = 4;

    // Act: getDaysInMonth 함수를 실행
    const result = getDaysInMonth(year, month);

    // Assert: 결과가 31인지 확인
    expect(result).toBe(30);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    // Arrange: 2024년 2월을 테스트하려고 함
    const year = 2024;
    const month = 2;

    // Act: getDaysInMonth 함수를 실행
    const result = getDaysInMonth(year, month);

    // Assert: 결과가 29인지 확인
    expect(result).toBe(29);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    const year = 2020;
    const month = 2;

    // Act: getDaysInMonth 함수를 실행
    const result = getDaysInMonth(year, month);

    // Assert: 결과가 31인지 확인
    expect(result).toBe(29);
  });

  it('유효하지 않은 월에 대해 적절히 처리한다', () => {
    const year = 2025;
    const thirteendMonth = 13;
    const zero = 0;
    const miusOne = -1;

    // Act: getDaysInMonth 함수를 실행
    const result1 = getDaysInMonth(year, thirteendMonth);
    const result2 = getDaysInMonth(year, zero);
    const result3 = getDaysInMonth(year, miusOne);

    expect(result1).toBe(31);
    expect(result2).toBe(31);
    expect(result3).toBe(30);
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    // Arrange: 2025-10-01은 수요일
    const inputDate = new Date('2025-10-01'); // 수요일

    // Act: 이 날이 속한 주의 모든 날짜를 구함
    const result = getWeekDates(inputDate);

    // 1. 배열의 길이는 7개여야 함
    expect(result).toHaveLength(7);

    // 2. 첫 번째는 일요일이어야 함 (2025-09-28)
    expect(result[0]).toEqual(new Date('2025-09-28'));

    // 3. 마지막은 토요일이어야 함 (2025-10-04)
    expect(result[6]).toEqual(new Date('2025-10-04'));
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const inputDate = new Date('2025-08-18'); // 월요일
    // Act: 이 날이 속한 주의 모든 날짜를 구함
    const result = getWeekDates(inputDate);

    expect(result).toHaveLength(7);
    expect(result[3]).toEqual(new Date('2025-08-20'));
    expect(result[6]).toEqual(new Date('2025-08-23'));
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const inputDate = new Date('2025-08-24'); // 일요일
    const result = getWeekDates(inputDate);

    expect(result).toHaveLength(7);
    expect(result[3]).toEqual(new Date('2025-08-27'));
    expect(result[6]).toEqual(new Date('2025-08-30'));
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const inputDate = new Date('2024-12-31'); // 연말
    const result = getWeekDates(inputDate);

    expect(result).toHaveLength(7);
    expect(result[0]).toEqual(new Date('2024-12-29'));
    expect(result[6]).toEqual(new Date('2025-01-04'));
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const inputDate = new Date('2026-01-02'); // 연초
    const result = getWeekDates(inputDate);

    expect(result).toHaveLength(7);
    expect(result[0]).toEqual(new Date('2025-12-28'));
    expect(result[6]).toEqual(new Date('2026-01-03'));
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const inputDate = new Date('2024-02-29'); // 윤년
    const result = getWeekDates(inputDate);

    expect(result).toHaveLength(7);
    expect(result[0]).toEqual(new Date('2024-02-25'));
    expect(result[6]).toEqual(new Date('2024-03-02'));
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const inputDate = new Date('2025-08-31'); // 마지막 날짜
    const result = getWeekDates(inputDate);

    expect(result).toHaveLength(7);
    expect(result[0]).toEqual(new Date('2025-08-31'));
    expect(result[6]).toEqual(new Date('2025-09-06'));
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const inputDate = new Date('2025-07-01');
    const result = getWeeksAtMonth(inputDate);
    const [first, second, third, forth, fifth] = result;

    expect(result).toHaveLength(5);
    expect(first).toHaveLength(7);
    expect(first[0]).toEqual(null);
    expect(second[0]).toEqual(6);
    expect(third[0]).toEqual(13);
    expect(forth[0]).toEqual(20);
    expect(fifth[0]).toEqual(27);
  });
});

describe('getEventsForDay', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '1일 회의',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '15일 점심약속',
      date: '2025-07-15',
      startTime: '12:00',
      endTime: '13:00',
      description: '동료와 점심',
      location: '식당',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '3',
      title: '1일 저녁 운동',
      date: '2025-07-01',
      startTime: '18:00',
      endTime: '19:00',
      description: '헬스장',
      location: '헬스장',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    // Act: 1일에 해당하는 이벤트만 찾기
    const result = getEventsForDay(events, 1);

    // Assert: 1일 이벤트만 반환되어야 함
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('1일 회의');
    expect(result[1].title).toBe('1일 저녁 운동');
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(events, 17);
    expect(result.length).toBe(0);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(events, 0);
    expect(result.length).toBe(0);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(events, 32);
    expect(result.length).toBe(0);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const inputDate = new Date('2025-08-15');
    const result = formatWeek(inputDate);

    expect(result).toEqual('2025년 8월 2주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const inputDate = new Date('2025-07-05');
    const result = formatWeek(inputDate);

    expect(result).toEqual('2025년 7월 1주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const inputDate = new Date('2025-06-28');
    const result = formatWeek(inputDate);

    expect(result).toEqual('2025년 6월 4주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const inputDate = new Date('2024-12-31');
    const result = formatWeek(inputDate);

    expect(result).toEqual('2025년 1월 1주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const inputDate = new Date('2024-02-27');
    const result = formatWeek(inputDate);

    expect(result).toEqual('2024년 2월 5주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const inputDate = new Date('2020-02-27');
    const result = formatWeek(inputDate);

    expect(result).toEqual('2020년 2월 4주');
  });
});

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    const inputDate = new Date('2025-07-10');
    const result = formatMonth(inputDate);

    expect(result).toEqual('2025년 7월');
  });
});

describe('isDateInRange', () => {
  it('범위 내의 날짜 2025-07-10에 대해 true를 반환한다', () => {
    const inputDate = new Date('2025-07-10');
    const startDate = new Date('2025-07-05');
    const endDate = new Date('2025-07-12');

    const result = isDateInRange(inputDate, startDate, endDate);

    expect(result).toBe(true);
  });

  it('범위의 시작일 2025-07-01에 대해 true를 반환한다', () => {
    const inputDate = new Date('2025-07-01');
    const startDate = new Date('2025-07-01');
    const endDate = new Date('2025-07-10');

    const result = isDateInRange(inputDate, startDate, endDate);

    expect(result).toBe(true);
  });

  it('범위의 종료일 2025-07-31에 대해 true를 반환한다', () => {
    const inputDate = new Date('2025-07-31');
    const startDate = new Date('2025-07-15');
    const endDate = new Date('2025-07-31');

    const result = isDateInRange(inputDate, startDate, endDate);

    expect(result).toBe(true);
  });

  it('범위 이전의 날짜 2025-06-30에 대해 false를 반환한다', () => {
    const inputDate = new Date('2025-06-30');
    const startDate = new Date('2025-07-15');
    const endDate = new Date('2025-07-31');

    const result = isDateInRange(inputDate, startDate, endDate);

    expect(result).toBe(false);
  });

  it('범위 이후의 날짜 2025-08-01에 대해 false를 반환한다', () => {
    const inputDate = new Date('2025-08-01');
    const startDate = new Date('2025-07-15');
    const endDate = new Date('2025-07-31');

    const result = isDateInRange(inputDate, startDate, endDate);

    expect(result).toBe(false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const inputDate = new Date('2025-08-01');
    const startDate = new Date('2025-09-15');
    const endDate = new Date('2025-07-31');

    const result = isDateInRange(inputDate, startDate, endDate);

    expect(result).toBe(false);
  });
});

describe('fillZero', () => {
  it("5를 2자리로 변환하면 '05'를 반환한다", () => {
    const inputNumber = 5;
    const result = fillZero(inputNumber);

    expect(result).toEqual('05');
  });

  it("10을 2자리로 변환하면 '10'을 반환한다", () => {
    const inputNumber = 10;
    const result = fillZero(inputNumber);

    expect(result).toEqual('10');
  });

  it("3을 3자리로 변환하면 '003'을 반환한다", () => {
    const inputNumber = 3;
    const result = fillZero(inputNumber, 3);

    expect(result).toEqual('003');
  });

  it("100을 2자리로 변환하면 '100'을 반환한다", () => {
    const inputNumber = 100;
    const result = fillZero(inputNumber, 2);

    expect(result).toEqual('100');
  });

  it("0을 2자리로 변환하면 '00'을 반환한다", () => {
    const inputNumber = 0;
    const result = fillZero(inputNumber, 2);

    expect(result).toEqual('00');
  });

  it("1을 5자리로 변환하면 '00001'을 반환한다", () => {
    const inputNumber = 1;
    const result = fillZero(inputNumber, 5);

    expect(result).toEqual('00001');
  });

  it("소수점이 있는 3.14를 5자리로 변환하면 '03.14'를 반환한다", () => {
    const inputNumber = 3.14;
    const result = fillZero(inputNumber, 5);

    expect(result).toEqual('03.14');
  });

  it('size 파라미터를 생략하면 기본값 2를 사용한다', () => {
    const inputNumber = 3;
    const result = fillZero(inputNumber);

    expect(result).toEqual('03');
  });

  it('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    const inputNumber = 5123;
    const result = fillZero(inputNumber, 3);

    expect(result).toEqual('5123');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    const inputDate = new Date('2025-7-10');
    const result = formatDate(inputDate);

    expect(result).toBe('2025-07-10');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    const inputDate = new Date('2025-06-25');
    const result = formatDate(inputDate, 12);

    expect(result).toBe('2025-06-12');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const inputDate = new Date('2025-3-14');
    const result = formatDate(inputDate);

    expect(result).toBe('2025-03-14');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const inputDate = new Date('2025-05-02');
    const result = formatDate(inputDate);

    expect(result).toBe('2025-05-02');
  });
});
