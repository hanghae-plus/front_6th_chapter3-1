import { fetchHolidays } from '../../apis/fetchHolidays';

describe('fetchHolidays', () => {
  it.each([
    {
      month: 1,
      expected: {
        '2025-01-01': '신정',
        '2025-01-29': '설날',
        '2025-01-30': '설날',
        '2025-01-31': '설날',
      },
      holidayNames: '신정, 설날',
    },
    { month: 3, expected: { '2025-03-01': '삼일절' }, holidayNames: '삼일절' },
    { month: 5, expected: { '2025-05-05': '어린이날' }, holidayNames: '어린이날' },
    { month: 6, expected: { '2025-06-06': '현충일' }, holidayNames: '현충일' },
    { month: 8, expected: { '2025-08-15': '광복절' }, holidayNames: '광복절' },
    {
      month: 10,
      expected: {
        '2025-10-03': '개천절',
        '2025-10-05': '추석',
        '2025-10-06': '추석',
        '2025-10-07': '추석',
        '2025-10-09': '한글날',
      },
      holidayNames: '개천절, 추석, 한글날',
    },
    { month: 12, expected: { '2025-12-25': '크리스마스' }, holidayNames: '크리스마스' },
  ])('$month월에는 $holidayNames 공휴일이 있다', ({ month, expected }) => {
    const result = fetchHolidays(new Date(`2025-${month}`));
    expect(result).toEqual(expected);
  });

  it.each([
    { month: 2, expected: {} },
    { month: 4, expected: {} },
    { month: 7, expected: {} },
    { month: 9, expected: {} },
    { month: 11, expected: {} },
  ])('$month월에는 공휴일이 없다', ({ month, expected }) => {
    const result = fetchHolidays(new Date(`2025-${month}`));
    expect(result).toEqual(expected);
  });
});
