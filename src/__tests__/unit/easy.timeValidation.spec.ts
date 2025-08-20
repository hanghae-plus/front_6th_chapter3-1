import { getTimeErrorMessage } from '../../utils/timeValidation';

describe('getTimeErrorMessage >', () => {
  const ERROR_MESSAGE = {
    startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
    endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
  };
  it('시작 시간이 종료 시간보다 늦을 때 에러 메시지를 반환한다', () => {
    const start = '09:00';
    const end = '08:00';
    const result = getTimeErrorMessage(start, end);
    expect(result).toEqual(ERROR_MESSAGE);
  });

  it('시작 시간과 종료 시간이 같을 때 에러 메시지를 반환한다', () => {
    const start = '09:00';
    const end = '09:00';
    const result = getTimeErrorMessage(start, end);
    expect(result).toEqual(ERROR_MESSAGE);
  });

  // AS IS : 시작 시간이 종료 시간보다 빠를 때 null을 반환한다.
  // TO BE : 시작 시간이 종료 시간보다 빠를 때 { startTimeError: null, endTimeError: null }을 반환한다.
  it('시작 시간이 종료 시간보다 빠를 때 { startTimeError: null, endTimeError: null }을 반환한다', () => {
    const start = '08:00';
    const end = '09:00';
    const result = getTimeErrorMessage(start, end);
    expect(result).toEqual({ startTimeError: null, endTimeError: null });
  });

  // AS IS : 시작 시간이 비어있을 때 null을 반환한다.
  // TO BE : 시작 시간이 비어있을 때 { startTimeError: null, endTimeError: null }을 반환한다.
  it('시작 시간이 비어있을 때 { startTimeError: null, endTimeError: null }을 반환한다', () => {
    const start = '';
    const end = '09:00';
    const result = getTimeErrorMessage(start, end);
    expect(result).toEqual({ startTimeError: null, endTimeError: null });
  });

  // AS IS : 종료 시간이 비어있을 때 null을 반환한다.
  // TO BE : 종료 시간이 비어있을 때 { startTimeError: null, endTimeError: null }을 반환한다.
  it('종료 시간이 비어있을 때 { startTimeError: null, endTimeError: null }을 반환한다', () => {
    const start = '09:00';
    const end = '';
    const result = getTimeErrorMessage(start, end);
    expect(result).toEqual({ startTimeError: null, endTimeError: null });
  });

  // AS IS : 시작 시간과 종료 시간이 모두 비어있을 때 null을 반환한다.
  // TO BE : 시작 시간과 종료 시간이 모두 비어있을 때 { startTimeError: null, endTimeError: null }을 반환한다.
  it('시작 시간과 종료 시간이 모두 비어있을 때 { startTimeError: null, endTimeError: null }을 반환한다', () => {
    const start = '';
    const end = '';
    const result = getTimeErrorMessage(start, end);
    expect(result).toEqual({ startTimeError: null, endTimeError: null });
  });
});
