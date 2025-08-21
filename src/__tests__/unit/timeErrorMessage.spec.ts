import { getTimeErrorMessage } from '../../utils/timeValidation';

describe('getTimeErrorMessage', () => {
  it('시작/종료 둘 다 없으면 에러 없음', () => {
    expect(getTimeErrorMessage('', '')).toEqual({ startTimeError: null, endTimeError: null });
  });

  it('시작이 종료보다 같거나 늦으면 에러 메시지를 반환', () => {
    expect(getTimeErrorMessage('10:00', '10:00')).toEqual({
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
    });
    expect(getTimeErrorMessage('12:00', '11:00')).toEqual({
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
    });
  });

  it('정상 순서면 에러 없음', () => {
    expect(getTimeErrorMessage('09:00', '10:00')).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });
});
