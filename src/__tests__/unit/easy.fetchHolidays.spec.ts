import { test } from 'vitest';

import { fetchHolidays } from '../../apis/fetchHolidays';

describe('fetchHolidays', () => {
  it('주어진 월의 공휴일만 반환한다', () => {
    const date = '2025-08-01';
    const holidays = fetchHolidays(new Date(date));
    expect(holidays).toEqual({
      '2025-08-15': '광복절',
    });
  });

  describe('공휴일이 없는 월에 대해 빈 객체를 반환한다', () => {
    const date = '2025-07-01';
    const holidays = fetchHolidays(new Date(date));
    expect(holidays).toEqual({});

    test.each([
      {
        date: '2025-02-01',
      },
      {
        date: '2025-04-01',
      },
      {
        date: '2025-07-01',
      },
      {
        date: '2025-09-01',
      },
      {
        date: '2025-11-01',
      },
    ])('공휴일이 없는 월($date)에 대해 빈 객체를 반환한다.', ({ date }) => {
      const holidays = fetchHolidays(new Date(date));
      expect(holidays).toEqual({});
    });
  });

  it('여러 공휴일이 있는 월에 대해 모든 공휴일을 반환한다', () => {
    const date = '2025-01-01';
    const holidays = fetchHolidays(new Date(date));
    expect(holidays).toEqual({
      '2025-01-01': '신정',
      '2025-01-29': '설날',
      '2025-01-30': '설날',
      '2025-01-31': '설날',
    });
  });
});
