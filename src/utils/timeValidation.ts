export interface TimeValidationResult {
  startTimeError: string | null;
  endTimeError: string | null;
}

/**
 * 시작 시간 / 종료 시간에 대한 에러 메세지를 생성해 반환한다.
 * 에러가 없을 경우 { startTimeError: null, endTimeError: null}을 반환
 *
 * startDate가 endDate와 같은 시간이거나, 그 이후일 경우 에러메세지를 반환한다.
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
