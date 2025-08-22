export interface EventValidationInput {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  startTimeError: string | null;
  endTimeError: string | null;
}

export interface EventValidationResult {
  ok: boolean;
  errorMessage?: string;
}

export function validateEvent({
  title,
  date,
  startTime,
  endTime,
  startTimeError,
  endTimeError,
}: EventValidationInput): EventValidationResult {
  if (!title || !date || !startTime || !endTime) {
    return { ok: false, errorMessage: '필수 정보를 모두 입력해주세요.' };
  }

  if (startTimeError || endTimeError) {
    return { ok: false, errorMessage: '시간 설정을 확인해주세요.' };
  }

  return { ok: true };
}
