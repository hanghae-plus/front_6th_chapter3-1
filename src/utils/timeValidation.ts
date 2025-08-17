export interface TimeValidationResult {
  startTimeError: string | null;
  endTimeError: string | null;
}

/**
 * 시작 시간과 종료 시간의 유효성을 검사하여 에러 메시지를 반환합니다.
 *
 * @param start - 시작 시간 (HH:MM 형식)
 * @param end - 종료 시간 (HH:MM 형식)
 * @returns 시작 시간과 종료 시간 각각의 에러 메시지를 포함한 객체
 *
 * @description
 * 다음 조건들을 검사합니다:
 * 1. 시작 시간 또는 종료 시간이 비어있으면 에러 없음
 * 2. 시작 시간이 종료 시간보다 늦거나 같으면 양쪽 모두 에러 메시지 반환
 * 3. 시작 시간이 종료 시간보다 빠르면 에러 없음
 *
 * @example
 * getTimeErrorMessage('10:00', '09:00')
 * // { startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.', endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.' }
 *
 * getTimeErrorMessage('09:00', '10:00')
 * // { startTimeError: null, endTimeError: null }
 */
export function getTimeErrorMessage(start: string, end: string): TimeValidationResult {
  if (!start || !end) {
    return { startTimeError: null, endTimeError: null };
  }

  const startDate = new Date(`2000-01-01T${start}`);
  const endDate = new Date(`2000-01-01T${end}`);

  if (startDate >= endDate) {
    return {
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
    };
  }

  return { startTimeError: null, endTimeError: null };
}
