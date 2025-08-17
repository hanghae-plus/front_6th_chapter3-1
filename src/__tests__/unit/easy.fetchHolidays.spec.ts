import { fetchHolidays } from '../../apis/fetchHolidays';

describe('fetchHolidays', () => {
  describe('기본 동작', () => {
    it('공휴일이 있는 월에 대해 해당 월의 모든 공휴일을 반환한다', () => {
      // Given: 2025년 5월 어린이날이 포함된 달의 날짜
      const childrensMonthDate = new Date('2025-05-15');

      // When: fetchHolidays 함수를 호출하면
      const mayHolidays = fetchHolidays(childrensMonthDate);

      // Then: 2025년 5월의 어린이날을 반환한다
      expect(mayHolidays).toEqual({
        '2025-05-05': '어린이날',
      });
    });

    it('공휴일이 없는 월에 대해 빈 객체를 반환한다', () => {
      // Given: 2025년 4월 공휴일이 없는 달의 날짜
      const noHolidayMonthDate = new Date('2025-04-20');

      // When: fetchHolidays 함수를 호출하면
      const aprilHolidays = fetchHolidays(noHolidayMonthDate);

      // Then: 빈 객체를 반환한다
      expect(aprilHolidays).toEqual({});
    });

    it('여러 공휴일이 연속으로 있는 월의 모든 공휴일을 반환한다', () => {
      // Given: 2025년 10월 추석 연휴와 개천절, 한글날이 포함된 달의 날짜
      const multipleHolidaysMonthDate = new Date('2025-10-15');

      // When: fetchHolidays 함수를 호출하면
      const octoberHolidays = fetchHolidays(multipleHolidaysMonthDate);

      // When: 반환된 공휴일 데이터를 날짜순으로 정렬하면
      const sortedOctoberHolidays = Object.fromEntries(
        Object.entries(octoberHolidays).sort(
          ([firstDate], [secondDate]) =>
            new Date(firstDate).getTime() - new Date(secondDate).getTime()
        )
      );

      // Then: 2025년 10월의 모든 공휴일을 날짜순으로 반환한다
      expect(sortedOctoberHolidays).toEqual({
        '2025-10-03': '개천절',
        '2025-10-05': '추석',
        '2025-10-06': '추석',
        '2025-10-07': '추석',
        '2025-10-09': '한글날',
      });
    });
  });

  describe('고급 동작 및 경계값 테스트', () => {
    it('월의 첫째 날이 공휴일인 경우 올바르게 반환한다', () => {
      // Given: 2025년 1월 신정과 설날 연휴가 포함된 달의 날짜
      const newYearMonthDate = new Date('2025-01-20');

      // When: fetchHolidays 함수를 호출하면
      const januaryHolidays = fetchHolidays(newYearMonthDate);

      // Then: 1월의 모든 공휴일(신정과 설날 연휴)을 반환한다
      expect(januaryHolidays).toEqual({
        '2025-01-01': '신정',
        '2025-01-29': '설날',
        '2025-01-30': '설날',
        '2025-01-31': '설날',
      });
    });

    it('월의 마지막 날이 공휴일인 경우 올바르게 반환한다', () => {
      // Given: 2025년 12월 크리스마스가 포함된 달의 날짜
      const christmasMonthDate = new Date('2025-12-10');

      // When: fetchHolidays 함수를 호출하면
      const decemberHolidays = fetchHolidays(christmasMonthDate);

      // Then: 12월 25일 크리스마스를 반환한다
      expect(decemberHolidays).toEqual({
        '2025-12-25': '크리스마스',
      });
    });

    it('윤년의 2월에 대해서도 올바르게 공휴일을 반환한다', () => {
      // Given: 윤년인 2024년 2월의 날짜
      const leapYearFebruaryDate = new Date('2024-02-15');

      // When: fetchHolidays 함수를 호출하면
      const februaryHolidays = fetchHolidays(leapYearFebruaryDate);

      // Then: 2월의 공휴일이 있다면 반환하고, 없다면 빈 객체를 반환한다
      expect(februaryHolidays).toEqual({});
    });

    it('공휴일 데이터가 없는 연도에 대해서는 빈 객체를 반환한다', () => {
      // Given: 공휴일 데이터가 정의되지 않은 2026년 1월의 날짜
      const differentYearDate = new Date('2026-01-15');

      // When: fetchHolidays 함수를 호출하면
      const differentYearHolidays = fetchHolidays(differentYearDate);

      // Then: 해당 연도의 공휴일 데이터가 없으므로 빈 객체를 반환한다
      expect(differentYearHolidays).toEqual({});
    });

    it('월의 중간 날짜를 입력해도 해당 월 전체의 공휴일을 반환한다', () => {
      // Given: 2025년 3월 중간 날짜
      const midMonthDate = new Date('2025-03-15');

      // When: fetchHolidays 함수를 호출하면
      const marchHolidays = fetchHolidays(midMonthDate);

      // Then: 3월 전체의 공휴일을 반환한다 (3월 1일 삼일절)
      expect(marchHolidays).toEqual({
        '2025-03-01': '삼일절',
      });
    });

    it('여름철 공휴일이 포함된 월의 데이터를 올바르게 반환한다', () => {
      // Given: 2025년 6월 현충일이 포함된 달의 날짜
      const summerHolidayMonthDate = new Date('2025-06-20');

      // When: fetchHolidays 함수를 호출하면
      const juneHolidays = fetchHolidays(summerHolidayMonthDate);

      // Then: 6월 6일 현충일을 반환한다
      expect(juneHolidays).toEqual({
        '2025-06-06': '현충일',
      });
    });

    it('광복절이 포함된 8월의 공휴일을 올바르게 반환한다', () => {
      // Given: 2025년 8월 광복절이 포함된 달의 날짜
      const liberationMonthDate = new Date('2025-08-01');

      // When: fetchHolidays 함수를 호출하면
      const augustHolidays = fetchHolidays(liberationMonthDate);

      // Then: 8월 15일 광복절을 반환한다
      expect(augustHolidays).toEqual({
        '2025-08-15': '광복절',
      });
    });
  });
});
