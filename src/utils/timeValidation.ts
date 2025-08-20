export interface TimeValidationResult {
  startTimeError: string | null;
  endTimeError: string | null;
}

const TIME_FORMAT_REGEX = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

export function getTimeErrorMessage(start: string, end: string): TimeValidationResult {
  // 시간 포멧 검증
  if (start && !TIME_FORMAT_REGEX.test(start)) {
    return {
      startTimeError: '올바른 시간 형식을 입력해주세요. (예: 09:30)',
      endTimeError: null,
    };
  }

  if (end && !TIME_FORMAT_REGEX.test(end)) {
    return {
      startTimeError: null,
      endTimeError: '올바른 시간 형식을 입력해주세요. (예: 09:30)',
    };
  }

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
