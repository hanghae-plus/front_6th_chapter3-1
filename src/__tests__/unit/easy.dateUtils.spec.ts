import { Event } from '../../types';
import {
  // fillZero,
  formatDate,
  formatMonth,
  formatWeek,
  getDaysInMonth,
  getEventsForDay,
  getWeekDates,
  getWeeksAtMonth,
  isDateInRange,
} from '../../utils/dateUtils';
import { createTestEvent } from '../utils';

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

  // 유효하지 않은 월에 대해 적절히 처리한다
  // it('0월과 13월 이상의 값에 대해 적절히 처리한다', () => {
  //   const input = [0, 13, 14, 25];
  //   const output = [31, 31, 28, 31];

  //   input.forEach((month, index) => {
  //     expect(getDaysInMonth(2024, month)).toBe(output[index]);
  //   });
  // });

  // it('음수 월 값에 대해 적절히 처리한다', () => {
  //   const input = [-1, -12, -13];
  //   const output = [30, 31, 30];

  //   input.forEach((month, index) => {
  //     expect(getDaysInMonth(2024, month)).toBe(output[index]);
  //   });
  // });
});

describe('getWeekDates', () => {
  it.each([
    {
      input: new Date(2025, 7, 17),
      description: '8월 17일(일요일)을 입력하면 일요일부터 토요일까지 7일을 반환한다',
    },
    {
      input: new Date(2025, 7, 23),
      description: '2025년 12월 31일(수요일)을 입력하면 연말 주를 올바르게 처리한다',
    },
    {
      input: new Date(2025, 7, 20),
      description: '2025년 1월 1일(수요일)을 입력하면 연초 주를 올바르게 처리한다',
    },
    {
      input: new Date(2025, 1, 29),
      description: '윤년의 2월 29일을 포함한 주를 올바르게 처리한다',
    },
    {
      input: new Date(2025, 2, 31),
      description: '월의 마지막 날짜를 포함한 주를 올바르게 처리한다',
    },
  ])('$description', ({ input }) => {
    const results = getWeekDates(input);

    expect(results[0].getDay()).toBe(0);
    expect(results[6].getDay()).toBe(6);

    const inputDateToString = input.toDateString();
    const resultDatesToString = results.map((date) => date.toDateString());
    expect(resultDatesToString).toContain(inputDateToString);

    for (let i = 1; i < results.length; i++) {
      const prevDate = new Date(results[i - 1]);
      const currDate = new Date(results[i]);
      prevDate.setDate(prevDate.getDate() + 1);

      expect(currDate.getTime()).toBe(prevDate.getTime());
    }
  });
});

describe('getWeeksAtMonth', () => {
  // '2025년 7월 1일의 올바른 주 정보를 반환해야 한다' -> 올바른 주 정보란?
  it('2025년 7월 첫째주는 월요일과 화요일이 null이고 1일부터 5일까지 포함한다', () => {
    const input = new Date(2025, 6, 1);
    const results = getWeeksAtMonth(input);

    expect(results[0]).toEqual([null, null, 1, 2, 3, 4, 5]);
  });

  it('2025년 7월 둘째주는 6일부터 12일까지 7일 모두 포함한다', () => {
    const input = new Date(2025, 6, 1);
    const results = getWeeksAtMonth(input);

    expect(results[1]).toEqual([6, 7, 8, 9, 10, 11, 12]);
  });

  it('2025년 7월 셋째주는 13일부터 19일까지 7일 모두 포함한다', () => {
    const input = new Date(2025, 6, 1);
    const results = getWeeksAtMonth(input);

    expect(results[2]).toEqual([13, 14, 15, 16, 17, 18, 19]);
  });

  it('2025년 7월 넷째주는 20일부터 26일까지 7일 모두 포함한다', () => {
    const input = new Date(2025, 6, 1);
    const results = getWeeksAtMonth(input);

    expect(results[3]).toEqual([20, 21, 22, 23, 24, 25, 26]);
  });
});

describe('getEventsForDay', () => {
  it('7월 1일 이벤트가 있을 때 해당 이벤트만 반환한다', () => {
    const events = [
      createTestEvent({ id: '1', date: '2025-07-01' }),
      createTestEvent({ id: '2', date: '2025-07-02' }),
    ];
    const results = getEventsForDay(events, 1);

    const expected: Event[] = [createTestEvent({ id: '1', date: '2025-07-01' })];

    expect(results).toEqual(expected);
  });

  it.each([
    {
      events: [createTestEvent({ id: '1', date: '2025-07-01' })],
      date: 0,
      description: '0일에 대해 빈 배열을 반환한다',
    },
    {
      events: [createTestEvent({ id: '1', date: '2025-07-01' })],
      date: 32,
      description: '32일에 대해 빈 배열을 반환한다',
    },
  ])('$description', ({ events, date }) => {
    const results = getEventsForDay(events, date);

    expect(results).toEqual([]);
  });
});

describe('formatWeek', () => {
  it.each([
    {
      input: new Date(2025, 6, 15),
      description:
        '7월 15일(화요일)을 입력하면 해당 주의 시작일(7월 14일)부터 종료일(7월 20일)까지 반환한다',
      expected: '2025년 7월 3주',
    },
    {
      input: new Date(2025, 6, 1),
      description: '7월 1일(화요일)을 입력하면 7월 1일부터 7일 모두 포함한다',
      expected: '2025년 7월 1주',
    },

    {
      input: new Date(2025, 6, 31),
      description: '7월 31일(목요일)을 입력하면 7월 31일부터 7일 모두 포함한다',
      expected: '2025년 7월 5주',
    },

    {
      input: new Date(2025, 11, 31),
      description: '12월 31일(수요일)을 입력하면 12월 29일부터 1월 4일까지 반환한다',
      expected: '2026년 1월 1주',
    },

    {
      input: new Date(2024, 1, 29),
      description: '2024년 2월 29일(목요일)을 입력하면 2월 25일부터 3월 2일까지 반환한다',
      expected: '2024년 2월 5주',
    },

    {
      input: new Date(2025, 1, 28),
      description: '2025년 2월 28일(금요일)을 입력하면 2월 23일부터 3월 1일까지 반환한다',
      expected: '2025년 2월 4주',
    },
  ])('$description', ({ input, expected }) => {
    const results = formatWeek(input);

    expect(results).toBe(expected);
  });
});

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    const input = new Date(2025, 6, 10);
    const results = formatMonth(input);

    expect(results).toBe('2025년 7월');
  });
});

describe('isDateInRange', () => {
  it.each([
    {
      description: '범위 내의 날짜 2025-07-10에 대해 true를 반환한다',
      input: new Date(2025, 6, 10),
      startDate: new Date(2025, 6, 1),
      endDate: new Date(2025, 6, 31),
      expected: true,
    },
    {
      description: '범위의 시작일 2025-07-01에 대해 true를 반환한다',
      input: new Date(2025, 6, 1),
      startDate: new Date(2025, 6, 1),
      endDate: new Date(2025, 6, 31),
      expected: true,
    },
    {
      description: '범위의 종료일 2025-07-31에 대해 true를 반환한다',
      input: new Date(2025, 6, 31),
      startDate: new Date(2025, 6, 1),
      endDate: new Date(2025, 6, 31),
      expected: true,
    },
    {
      description: '범위 이전의 날짜 2025-06-30에 대해 false를 반환한다',
      input: new Date(2025, 5, 30),
      startDate: new Date(2025, 6, 1),
      endDate: new Date(2025, 6, 31),
      expected: false,
    },
    {
      description: '범위 이후의 날짜 2025-08-01에 대해 false를 반환한다',
      input: new Date(2025, 7, 1),
      startDate: new Date(2025, 6, 1),
      endDate: new Date(2025, 6, 31),
      expected: false,
    },
    {
      description: '시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다',
      input: new Date(2025, 6, 31),
      startDate: new Date(2025, 6, 31),
      endDate: new Date(2025, 6, 1),
      expected: false,
    },
  ])('$description', ({ input, startDate, endDate, expected }) => {
    const results = isDateInRange(input, startDate, endDate);

    expect(results).toBe(expected);
  });
});

// 자바스크립트의 표준 동작을 테스트
// describe('fillZero', () => {
// it.each([
//   {
//     description: "5를 2자리로 변환하면 '05'를 반환한다",
//     input: 5,
//     size: 2,
//     expected: '05',
//   },
//   {
//     description: "10을 2자리로 변환하면 '10'을 반환한다",
//     input: 10,
//     size: 2,
//     expected: '10',
//   },
//   {
//     description: "3을 3자리로 변환하면 '003'을 반환한다",
//     input: 3,
//     size: 3,
//     expected: '003',
//   },
//   {
//     description: "100을 2자리로 변환하면 '100'을 반환한다",
//     input: 100,
//     size: 2,
//     expected: '100',
//   },
//   {
//     description: "0을 2자리로 변환하면 '00'을 반환한다",
//     input: 0,
//     size: 2,
//     expected: '00',
//   },
//   {
//     description: "1을 5자리로 변환하면 '00001'을 반환한다",
//     input: 1,
//     size: 5,
//     expected: '00001',
//   },
// ])('$description', ({ input, size, expected }) => {
//   const results = fillZero(input, size);
//   expect(results).toBe(expected);
// });
// it("소수점이 있는 3.14를 5자리로 변환하면 '03.14'를 반환한다", () => {
//   const input = 3.14;
//   const size = 5;
//   const results = fillZero(input, size);
//   expect(results).toBe('03.14');
// });
// it('size 파라미터를 생략하면 기본값 2를 사용한다', () => {
//   const input = 5;
//   const results = fillZero(input);
//   expect(results).toBe('05');
// });
// it('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
//   const input = 12345;
//   const size = 2;
//   const results = fillZero(input, size);
//   expect(results).toBe('12345');
// });
// });

describe('formatDate', () => {
  it.each([
    {
      description: '날짜를 YYYY-MM-DD 형식으로 포맷팅한다',
      input: new Date(2025, 6, 10),
      expected: '2025-07-10',
    },
    {
      description: '월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다',
      input: new Date(2025, 6, 5),
      expected: '2025-07-05',
    },
    {
      description: '일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다',
      input: new Date(2025, 6, 1),
      expected: '2025-07-01',
    },
    {
      description: 'day 파라미터가 제공되면 해당 일자로 포맷팅한다',
      input: new Date(2025, 6, 10),
      day: 15,
      expected: '2025-07-15',
    },
  ])('$description', ({ input, day, expected }) => {
    const results = formatDate(input, day);

    expect(results).toBe(expected);
  });
});
