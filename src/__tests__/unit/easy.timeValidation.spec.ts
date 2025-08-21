import { getTimeErrorMessage } from '../../utils/timeValidation';

describe('getTimeErrorMessage', () => {
  it('시작 시간이 종료 시간보다 늦을 때 에러 메시지를 반환한다', () => {
    // Given: 시작 시간이 종료 시간보다 늦음
    // When: getTimeErrorMessage 호출
    const result = getTimeErrorMessage('10:00', '09:00');

    // Then: 에러 메시지 반환
    expect(result).toEqual({
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
    });
  });

  it('시작 시간과 종료 시간이 같을 때 에러 메시지를 반환한다', () => {
    // Given: 시작 시간과 종료 시간이 같음
    // When: getTimeErrorMessage 호출
    const result = getTimeErrorMessage('10:00', '10:00');

    // Then: 에러 메시지 반환
    expect(result).toEqual({
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
    });
  });

  it('시작 시간이 종료 시간보다 빠를 때 null을 반환한다', () => {
    // Given: 정상적인 시간 (시작 < 종료)
    // When: getTimeErrorMessage 호출
    const result = getTimeErrorMessage('09:00', '10:00');

    // Then: null 반환
    expect(result).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  it('시작 시간이 비어있을 때 null을 반환한다', () => {
    // Given: 빈 시작 시간
    // When: getTimeErrorMessage 호출
    const result = getTimeErrorMessage('', '10:00');

    // Then: null 반환
    expect(result).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  it('종료 시간이 비어있을 때 null을 반환한다', () => {
    // Given: 빈 종료 시간
    // When: getTimeErrorMessage 호출
    const result = getTimeErrorMessage('10:00', '');

    // Then: null 반환
    expect(result).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  it('시작 시간과 종료 시간이 모두 비어있을 때 null을 반환한다', () => {
    // Given: 모두 빈 시간
    // When: getTimeErrorMessage 호출
    const result = getTimeErrorMessage('', '');

    // Then: null 반환
    expect(result).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });
});
