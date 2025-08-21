import { getTimeErrorMessage } from '../../utils/timeValidation';

describe('getTimeErrorMessage >', () => {
  const cases = [
    { start: '10:00', end: '11:00' },
    { start: '10:00', end: '10:00' },
    { start: '10:00', end: '09:00' },
    { start: '', end: '11:00' },
    { start: '10:00', end: '' },
    { start: '', end: '' },
  ];
  it('시작 시간이 종료 시간보다 늦을 때 에러 메시지를 반환한다', () => {
    const result = getTimeErrorMessage(cases[2].start, cases[2].end);
    expect(result.startTimeError).toBe('시작 시간은 종료 시간보다 빨라야 합니다.');
    expect(result.endTimeError).toBe('종료 시간은 시작 시간보다 늦어야 합니다.');
  });

  it('시작 시간과 종료 시간이 같을 때 에러 메시지를 반환한다', () => {
    const result = getTimeErrorMessage(cases[1].start, cases[1].end);
    expect(result.startTimeError).toBe('시작 시간은 종료 시간보다 빨라야 합니다.');
    expect(result.endTimeError).toBe('종료 시간은 시작 시간보다 늦어야 합니다.');
  });

  it('시작 시간이 종료 시간보다 빠를 때 null을 반환한다', () => {
    const result = getTimeErrorMessage(cases[0].start, cases[0].end);
    expect(result.startTimeError).toBeNull();
    expect(result.endTimeError).toBeNull();
  });

  it('시작 시간이 비어있을 때 null을 반환한다', () => {
    const result = getTimeErrorMessage(cases[3].start, cases[3].end);
    expect(result.startTimeError).toBeNull();
    expect(result.endTimeError).toBeNull();
  });

  it('종료 시간이 비어있을 때 null을 반환한다', () => {
    const result = getTimeErrorMessage(cases[3].start, cases[3].end);
    expect(result.startTimeError).toBeNull();
    expect(result.endTimeError).toBeNull();
  });

  it('시작 시간과 종료 시간이 모두 비어있을 때 null을 반환한다', () => {
    const result = getTimeErrorMessage('', '');
    expect(result.startTimeError).toBeNull();
    expect(result.endTimeError).toBeNull();
  });
});
