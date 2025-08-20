import { getTimeErrorMessage } from '../../utils/timeValidation';

describe('getTimeErrorMessage >', () => {
  const START_TIME_ERROR_MSG = '시작 시간은 종료 시간보다 빨라야 합니다.';
  const END_TIME_ERROR_MSG = '종료 시간은 시작 시간보다 늦어야 합니다.';
  const TIME_FORMAT_ERROR_MSG = '올바른 시간 형식을 입력해주세요. (예: 09:30)';

  it('시작 시간이 종료 시간보다 늦을 때 에러 메시지를 반환한다', () => {
    const startTime = '14:00';
    const endTime = '10:00';

    const result = getTimeErrorMessage(startTime, endTime);

    expect(result.startTimeError).toBe(START_TIME_ERROR_MSG);
    expect(result.endTimeError).toBe(END_TIME_ERROR_MSG);
  });

  it('시작 시간과 종료 시간이 같을 때 에러 메시지를 반환한다', () => {
    const startTime = '10:00';
    const endTime = '10:00';

    const result = getTimeErrorMessage(startTime, endTime);

    expect(result.startTimeError).toBe(START_TIME_ERROR_MSG);
    expect(result.endTimeError).toBe(END_TIME_ERROR_MSG);
  });

  it('시작 시간이 종료 시간보다 빠를 때 에러 메세지가 아닌 null을 반환한다', () => {
    const startTime = '10:00';
    const endTime = '14:00';

    const result = getTimeErrorMessage(startTime, endTime);

    expect(result.startTimeError).toBeNull();
    expect(result.endTimeError).toBeNull();
  });

  it('시작 시간이 비어있을 때 에러 메세지가 아닌 null을 반환한다', () => {
    const startTime = '';
    const endTime = '10:00';

    const result = getTimeErrorMessage(startTime, endTime);

    expect(result.startTimeError).toBeNull();
    expect(result.endTimeError).toBeNull();
  });

  it('종료 시간이 비어있을 때 에러 메세지가 아닌 null을 반환한다', () => {
    const startTime = '10:00';
    const endTime = '';

    const result = getTimeErrorMessage(startTime, endTime);

    expect(result.startTimeError).toBeNull();
    expect(result.endTimeError).toBeNull();
  });

  it('시작 시간과 종료 시간이 모두 비어있을 때 에러 메세지가 아닌 null을 반환한다', () => {
    const startTime = '';
    const endTime = '';

    const result = getTimeErrorMessage(startTime, endTime);

    expect(result.startTimeError).toBeNull();
    expect(result.endTimeError).toBeNull();
  });

  describe('getTimeErrorMessage 엣지 케이스', () => {
    // 엣지 케이스
    it('시작 시간이 잘못된 형식일 때 에러 메시지를 반환한다', () => {
      const result = getTimeErrorMessage('invalid time', '09:00');
      expect(result.startTimeError).toBe(TIME_FORMAT_ERROR_MSG);
      expect(result.endTimeError).toBeNull();
    });

    it('종료 시간이 잘못된 형식일 때 에러 메시지를 반환한다', () => {
      const result = getTimeErrorMessage('09:00', 'invalid time');
      expect(result.startTimeError).toBeNull();
      expect(result.endTimeError).toBe(TIME_FORMAT_ERROR_MSG);
    });

    it('시작 시간과 종료 시간이 모두 잘못된 형식일 때 시작 시간 에러만 반환한다', () => {
      const result = getTimeErrorMessage('invalid time', '아무말');
      expect(result.startTimeError).toBe(TIME_FORMAT_ERROR_MSG);
      expect(result.endTimeError).toBeNull();
    });
  });
});
