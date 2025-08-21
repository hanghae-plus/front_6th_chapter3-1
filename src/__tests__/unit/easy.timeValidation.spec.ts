import { getTimeErrorMessage } from '../../utils/timeValidation';

describe('getTimeErrorMessage >', () => {
  it('시작 시간이 종료 시간보다 늦을 때 에러 메시지를 반환한다', () => {
    const lateStartTime = '12:00';
    const earlyEndTime = '10:00';

    expect(getTimeErrorMessage(lateStartTime, earlyEndTime)).toEqual({
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
    });
  });

  it('시작 시간과 종료 시간이 같을 때 에러 메시지를 반환한다', () => {
    const startTime = '12:00';
    const sameEndTime = '12:00';

    expect(getTimeErrorMessage(startTime, sameEndTime)).toEqual({
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
    });
  });

  it('시작 시간이 종료 시간보다 빠를 때 null을 반환한다', () => {
    const earlyStartTime = '10:00';
    const lateEndTime = '12:00';

    expect(getTimeErrorMessage(earlyStartTime, lateEndTime)).toEqual({
      endTimeError: null,
      startTimeError: null,
    });
  });

  it('시작 시간이 비어있을 때 null을 반환한다', () => {
    const emptyStartTime = '';
    const endTime = '12:00';

    expect(getTimeErrorMessage(emptyStartTime, endTime)).toEqual({
      endTimeError: null,
      startTimeError: null,
    });
  });

  it('종료 시간이 비어있을 때 null을 반환한다', () => {
    const startTime = '12:00';
    const emptyEndTime = '';

    expect(getTimeErrorMessage(startTime, emptyEndTime)).toEqual({
      endTimeError: null,
      startTimeError: null,
    });
  });

  it('시작 시간과 종료 시간이 모두 비어있을 때 null을 반환한다', () => {
    const emptyStartTime = '';
    const emptyEndTime = '';

    expect(getTimeErrorMessage(emptyStartTime, emptyEndTime)).toEqual({
      endTimeError: null,
      startTimeError: null,
    });
  });
});
