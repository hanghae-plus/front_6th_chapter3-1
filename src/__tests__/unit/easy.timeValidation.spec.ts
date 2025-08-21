import { getTimeErrorMessage } from '../../utils/timeValidation';

describe('getTimeErrorMessage >', () => {
  const ERROR_MESSAGE = {
    startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
    endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
  };

  const SUCCESS_RESULT = {
    startTimeError: null,
    endTimeError: null,
  };

  it('시작 시간이 종료 시간보다 늦을 때 에러 메시지를 반환한다', () => {
    const startTime = '10:00';
    const endTime = '09:00';

    const result = getTimeErrorMessage(startTime, endTime);
    expect(result).toEqual(ERROR_MESSAGE);
  });

  it('시작 시간과 종료 시간이 같을 때 에러 메시지를 반환한다', () => {
    const startTime = '10:00';
    const endTime = '10:00';

    const result = getTimeErrorMessage(startTime, endTime);
    expect(result).toEqual(ERROR_MESSAGE);
  });

  it('시작 시간이 종료 시간보다 빠를 때 null을 반환한다', () => {
    const startTime = '09:00';
    const endTime = '10:00';

    const result = getTimeErrorMessage(startTime, endTime);
    expect(result).toEqual(SUCCESS_RESULT);
  });

  it('시작 시간이 비어있을 때 null을 반환한다', () => {
    const startTime = '';
    const endTime = '10:00';

    const result = getTimeErrorMessage(startTime, endTime);
    expect(result).toEqual(SUCCESS_RESULT);
  });

  it('종료 시간이 비어있을 때 null을 반환한다', () => {
    const startTime = '10:00';
    const endTime = '';

    const result = getTimeErrorMessage(startTime, endTime);
    expect(result).toEqual(SUCCESS_RESULT);
  });

  it('시작 시간과 종료 시간이 모두 비어있을 때 null을 반환한다', () => {
    const startTime = '';
    const endTime = '';

    const result = getTimeErrorMessage(startTime, endTime);
    expect(result).toEqual(SUCCESS_RESULT);
  });
});
