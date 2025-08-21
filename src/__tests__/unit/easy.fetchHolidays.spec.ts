import { fetchHolidays } from '../../apis/fetchHolidays';

describe('fetchHolidays', () => {
  describe('기본 동작', () => {
    it('공휴일이 있는 월에 대해 해당 월의 모든 공휴일을 반환한다', () => {
      // Given: 5월 날짜 (어린이날 있음)
      // When: fetchHolidays 호출
      const result = fetchHolidays(new Date('2025-05-15'));

      // Then: 어린이날 반환
      expect(result).toEqual({
        '2025-05-05': '어린이날',
      });
    });

    it('공휴일이 없는 월에 대해 빈 객체를 반환한다', () => {
      // Given: 4월 날짜 (공휴일 없음)
      // When: fetchHolidays 호출
      const result = fetchHolidays(new Date('2025-04-20'));

      // Then: 빈 객체 반환
      expect(result).toEqual({});
    });

    it('여러 공휴일이 연속으로 있는 월의 모든 공휴일을 반환한다', () => {
      // Given: 10월 날짜 (추석, 개천절, 한글날)
      // When: fetchHolidays 호출
      const result = fetchHolidays(new Date('2025-10-15'));

      // Then: 10월 모든 공휴일 반환
      expect(result).toEqual({
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
      // Given: 1월 날짜 (신정과 설날 있음)
      // When: fetchHolidays 호출
      const result = fetchHolidays(new Date('2025-01-20'));

      // Then: 1월 모든 공휴일 반환
      expect(result).toEqual({
        '2025-01-01': '신정',
        '2025-01-29': '설날',
        '2025-01-30': '설날',
        '2025-01-31': '설날',
      });
    });

    it('월의 마지막 날이 공휴일인 경우 올바르게 반환한다', () => {
      // Given: 12월 날짜 (크리스마스 있음)
      // When: fetchHolidays 호출
      const result = fetchHolidays(new Date('2025-12-10'));

      // Then: 크리스마스 반환
      expect(result).toEqual({
        '2025-12-25': '크리스마스',
      });
    });

    it('윤년의 2월에 대해서도 올바르게 공휴일을 반환한다', () => {
      // Given: 윤년 2024년 2월
      // When: fetchHolidays 호출
      const result = fetchHolidays(new Date('2024-02-15'));

      // Then: 빈 객체 반환 (2월엔 공휴일 없음)
      expect(result).toEqual({});
    });

    it('공휴일 데이터가 없는 연도에 대해서는 빈 객체를 반환한다', () => {
      // Given: 2026년 날짜 (데이터 없음)
      // When: fetchHolidays 호출
      const result = fetchHolidays(new Date('2026-01-15'));

      // Then: 빈 객체 반환
      expect(result).toEqual({});
    });

    it('월의 중간 날짜를 입력해도 해당 월 전체의 공휴일을 반환한다', () => {
      // Given: 3월 중간 날짜
      // When: fetchHolidays 호출
      const result = fetchHolidays(new Date('2025-03-15'));

      // Then: 삼일절 반환
      expect(result).toEqual({
        '2025-03-01': '삼일절',
      });
    });

    it('여름철 공휴일이 포함된 월의 데이터를 올바르게 반환한다', () => {
      // Given: 6월 날짜 (현충일 있음)
      // When: fetchHolidays 호출
      const result = fetchHolidays(new Date('2025-06-20'));

      // Then: 현충일 반환
      expect(result).toEqual({
        '2025-06-06': '현충일',
      });
    });

    it('광복절이 포함된 8월의 공휴일을 올바르게 반환한다', () => {
      // Given: 8월 날짜 (광복절 있음)
      // When: fetchHolidays 호출
      const result = fetchHolidays(new Date('2025-08-01'));

      // Then: 광복절 반환
      expect(result).toEqual({
        '2025-08-15': '광복절',
      });
    });
  });
});
