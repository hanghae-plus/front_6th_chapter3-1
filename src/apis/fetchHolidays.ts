const HOLIDAY_RECORD = {
  '2025-01-01': '신정',
  '2025-01-29': '설날',
  '2025-01-30': '설날',
  '2025-01-31': '설날',
  '2025-03-01': '삼일절',
  '2025-05-05': '어린이날',
  '2025-06-06': '현충일',
  '2025-08-15': '광복절',
  '2025-10-05': '추석',
  '2025-10-06': '추석',
  '2025-10-07': '추석',
  '2025-10-03': '개천절',
  '2025-10-09': '한글날',
  '2025-12-25': '크리스마스',
};

type HolidayRecord = typeof HOLIDAY_RECORD;
type HolidayKeys = keyof HolidayRecord;

/**
 * 주어진 날짜가 속한 월의 모든 공휴일을 반환합니다.
 * @param date - 조회할 월이 포함된 Date 객체
 * @returns 해당 월의 공휴일 객체 (키: YYYY-MM-DD 형식의 날짜, 값: 공휴일명)
 */
export function fetchHolidays(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const holidays = Object.keys(HOLIDAY_RECORD) as HolidayKeys[];
  return holidays
    .filter((date) => date.includes(`${y}-${m}`))
    .reduce(
      (acc: Partial<HolidayRecord>, date) => ({
        ...acc,
        [date]: HOLIDAY_RECORD[date],
      }),
      {}
    );
}
