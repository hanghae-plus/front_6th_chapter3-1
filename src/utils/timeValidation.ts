export interface TimeValidationResult {
  startTimeError: string | null;
  endTimeError: string | null;
}

/**
 * 시작 시간과 종료 시간의 유효성을 검증하고 에러 메시지를 반환합니다.
 * @param start - 시작 시간 (HH:MM 형식, 예: "09:00")
 * @param end - 종료 시간 (HH:MM 형식, 예: "10:00")
 * @returns 시간 유효성 검증 결과 객체 (각 필드는 에러가 없으면 null, 있으면 에러 메시지)
 */
export function getTimeErrorMessage(start: string, end: string): TimeValidationResult {
  // 1. 시작 시간이나 종료 시간이 비어있으면 검증하지 않음
  if (!start || !end) {
    return { startTimeError: null, endTimeError: null };
  }

  // 2. 시간 문자열을 Date 객체로 변환 (같은 날짜를 기준으로 시간만 비교)
  const startDate = new Date(`2000-01-01T${start}`);
  const endDate = new Date(`2000-01-01T${end}`);

  // 3. 시작 시간이 종료 시간보다 늦거나 같으면 에러
  if (startDate >= endDate) {
    return {
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
    };
  }

  // 4. 모든 검증 통과 시 에러 없음
  return { startTimeError: null, endTimeError: null };
}
