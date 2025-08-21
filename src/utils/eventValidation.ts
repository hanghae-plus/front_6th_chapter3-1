interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const validateEventForm = (
  title: string,
  date: string,
  startTime: string,
  endTime: string,
  startTimeError: string | null,
  endTimeError: string | null
): ValidationResult => {
  if (!title || !date || !startTime || !endTime) {
    return { isValid: false, message: '필수 정보를 모두 입력해주세요.' };
  }

  if (startTimeError || endTimeError) {
    return { isValid: false, message: '시간 설정을 확인해주세요.' };
  }

  return { isValid: true };
};
