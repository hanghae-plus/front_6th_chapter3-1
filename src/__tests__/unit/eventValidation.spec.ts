import { describe, it, expect } from 'vitest';

import { validateEvent, EventValidationInput } from '../../utils/eventValidation';

describe('validateEvent', () => {
  it('모든 값이 유효하면 {ok:true} 를 반환한다', () => {
    const validInput: EventValidationInput = {
      title: '회의',
      date: '2025-08-22',
      startTime: '09:00',
      endTime: '10:00',
      startTimeError: null,
      endTimeError: null,
    };

    const result = validateEvent(validInput);
    expect(result).toEqual({ ok: true });
  });

  it('필수값이 비어있으면 에러 메시지를 반환한다', () => {
    const invalidInput: EventValidationInput = {
      title: '',
      date: '2025-08-22',
      startTime: '09:00',
      endTime: '10:00',
      startTimeError: null,
      endTimeError: null,
    };
    const result = validateEvent(invalidInput);
    expect(result.ok).toBe(false);
    expect(result.errorMessage).toBe('필수 정보를 모두 입력해주세요.');
  });

  it('시간 에러가 있으면 에러 메시지를 반환한다', () => {
    const invalidTimeInput: EventValidationInput = {
      title: '회의',
      date: '2025-08-22',
      startTime: '13:00',
      endTime: '12:00',
      startTimeError: '시작 시간이 종료 시간보다 늦습니다.',
      endTimeError: null,
    };

    expect(validateEvent(invalidTimeInput)).toEqual({
      ok: false,
      errorMessage: '시간 설정을 확인해주세요.',
    });
  });
});
