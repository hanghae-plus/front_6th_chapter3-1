import { getTimeErrorMessage } from '../../utils/timeValidation';

describe('getTimeErrorMessage', () => {
  const expectedError = {
    startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
    endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
  };

  const expectedNull = {
    startTimeError: null,
    endTimeError: null,
  };

  it.each([
    {
      startTime: '10:00',
      endTime: '09:00',
      expected: expectedError,
      description: '시작 시간이 종료 시간보다 늦을 때 에러 메시지를 반환한다',
    },
    {
      startTime: '10:00',
      endTime: '10:00',
      expected: expectedError,
      description: '시작 시간과 종료 시간이 같을 때 에러 메시지를 반환한다',
    },
    {
      startTime: '09:00',
      endTime: '10:00',
      expected: expectedNull,
      description: '시작 시간이 종료 시간보다 빠를 때 null을 반환한다',
    },
    {
      startTime: '',
      endTime: '10:00',
      expected: expectedNull,
      description: '시작 시간이 비어있을 때 null을 반환한다',
    },
    {
      startTime: '10:00',
      endTime: '',
      expected: expectedNull,
      description: '종료 시간이 비어있을 때 null을 반환한다',
    },
    {
      startTime: '',
      endTime: '',
      expected: expectedNull,
      description: '시작 시간과 종료 시간이 모두 비어있을 때 null을 반환한다',
    },
  ])('$description', ({ startTime, endTime, expected }) => {
    const result = getTimeErrorMessage(startTime, endTime);
    expect(result).toEqual(expected);
  });
});
