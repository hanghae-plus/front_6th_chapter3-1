import { getTimeErrorMessage } from '../../utils/timeValidation';

describe('getTimeErrorMessage >', () => {
  it('시작 시간이 종료 시간보다 늦을 때 에러 메시지를 반환한다', () => {
    const start = '19:00:00';
    const end = '12:00:00';
    const errorMessage = getTimeErrorMessage(start, end);

    expect(errorMessage.startTimeError).not.toBeNull();
    expect(errorMessage.endTimeError).not.toBeNull();
  });

  it('시작 시간과 종료 시간이 같을 때 에러 메시지를 반환한다', () => {
    const start = '19:00:00';
    const end = '19:00:00';
    const errorMessage = getTimeErrorMessage(start, end);

    expect(errorMessage.startTimeError).not.toBeNull();
    expect(errorMessage.endTimeError).not.toBeNull();
  });

  it('시작 시간이 종료 시간보다 빠를 때 null을 반환한다', () => {
    const start = '12:00:00';
    const end = '19:00:00';
    const errorMessage = getTimeErrorMessage(start, end);

    expect(errorMessage.startTimeError).toBeNull();
    expect(errorMessage.endTimeError).toBeNull();
  });

  it('시작 시간이 비어있을 때 null을 반환한다', () => {
    const start = '';
    const end = '19:00:00';
    const errorMessage = getTimeErrorMessage(start, end);

    expect(errorMessage.startTimeError).toBeNull();
    expect(errorMessage.endTimeError).toBeNull();
  });

  it('종료 시간이 비어있을 때 null을 반환한다', () => {
    const start = '12:00:00';
    const end = '';
    const errorMessage = getTimeErrorMessage(start, end);

    expect(errorMessage.startTimeError).toBeNull();
    expect(errorMessage.endTimeError).toBeNull();
  });

  /** 불필요한 테스트, 위의 두 테스트를 통해 이것은 이미 검증되었음 */
  it('시작 시간과 종료 시간이 모두 비어있을 때 null을 반환한다', () => {
    const start = '';
    const end = '';
    const errorMessage = getTimeErrorMessage(start, end);

    expect(errorMessage.startTimeError).toBeNull();
    expect(errorMessage.endTimeError).toBeNull();
  });
});
