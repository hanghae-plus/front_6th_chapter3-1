import { getTimeErrorMessage } from '../../utils/timeValidation';

describe('getTimeErrorMessage >', () => {
  it('시작 시간이 종료 시간보다 늦을 때 에러 메시지를 반환한다', () => {
    expect(getTimeErrorMessage('14:00', '10:00')).toEqual({
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
    });
  });

  it('시작 시간과 종료 시간이 같을 때 에러 메시지를 반환한다', () => {
    expect(getTimeErrorMessage('10:00', '10:00')).toEqual({
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
    });
  });

  it('시작 시간이 종료 시간보다 빠를 때 null을 반환한다', () => {
    expect(getTimeErrorMessage('10:00', '14:00')).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  it('시작 시간이 비어있을 때 null을 반환한다', () => {
    expect(getTimeErrorMessage('', '14:00')).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  it('종료 시간이 비어있을 때 null을 반환한다', () => {
    expect(getTimeErrorMessage('10:00', '')).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  it('시작 시간과 종료 시간이 모두 비어있을 때 null을 반환한다', () => {
    expect(getTimeErrorMessage('', '')).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  it('자정을 넘어가는 시간에 대해서도 올바르게 검증한다', () => {
    expect(getTimeErrorMessage('23:30', '00:30')).toEqual({
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
    });
  });

  it('분 단위까지 정확히 비교한다', () => {
    expect(getTimeErrorMessage('10:30', '10:29')).toEqual({
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
    });
  });

  it('1분 차이의 유효한 시간을 올바르게 검증한다', () => {
    expect(getTimeErrorMessage('10:00', '10:01')).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  it('빈 문자열과 공백 문자열을 모두 처리한다', () => {
    expect(getTimeErrorMessage('   ', '14:00')).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
    expect(getTimeErrorMessage('10:00', '   ')).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });
});
