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
 * 주어진 날짜가 속한 월의 모든 공휴일 정보를 반환합니다.
 *
 * @param date - 공휴일을 조회할 날짜
 * @returns 해당 월의 공휴일 정보를 담은 객체. 키는 'YYYY-MM-DD' 형식의 날짜, 값은 공휴일 이름
 *
 * @description
 * 2025년 공휴일 데이터를 기반으로 해당 월의 공휴일들을 필터링하여 반환합니다.
 * 입력된 날짜의 연도와 월을 기준으로 해당 월에 속하는 모든 공휴일을 찾습니다.
 *
 * @example
 * fetchHolidays(new Date('2025-05-15'))
 * // { '2025-05-05': '어린이날' }
 *
 * fetchHolidays(new Date('2025-10-15'))
 * // { '2025-10-03': '개천절', '2025-10-05': '추석', '2025-10-06': '추석', '2025-10-07': '추석', '2025-10-09': '한글날' }
 *
 * fetchHolidays(new Date('2025-04-20'))
 * // {} (공휴일이 없는 월)
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
