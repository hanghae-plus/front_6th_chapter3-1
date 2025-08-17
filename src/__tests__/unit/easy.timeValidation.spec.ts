import { getTimeErrorMessage } from '../../utils/timeValidation';

describe('getTimeErrorMessage >', () => {
  it('시작 시간이 종료 시간보다 늦을 때 에러 메시지를 반환한다', () => {
    // Given: 시작 시간이 종료 시간보다 늦은 이벤트
    const event = {
      startTime: '10:00',
      endTime: '09:00',
    };

    // When: getTimeErrorMessage 함수를 호출하면
    const errorMessage = getTimeErrorMessage(event.startTime, event.endTime);

    // Then: 시작 시간이 종료 시간보다 늦을 때 에러 메시지를 반환한다
    expect(errorMessage).toEqual({
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
    });
  });

  it('시작 시간과 종료 시간이 같을 때 에러 메시지를 반환한다', () => {
    // Given: 시작 시간과 종료 시간이 같은 이벤트
    const event = {
      startTime: '10:00',
      endTime: '10:00',
    };

    // When: getTimeErrorMessage 함수를 호출하면
    const errorMessage = getTimeErrorMessage(event.startTime, event.endTime);

    // Then: 시작 시간과 종료 시간이 같을 때 에러 메시지를 반환한다
    expect(errorMessage).toEqual({
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
    });
  });

  it('시작 시간이 종료 시간보다 빠를 때 null을 반환한다', () => {
    // Given: 시작 시간이 종료 시간보다 빠른 이벤트
    const event = {
      startTime: '09:00',
      endTime: '10:00',
    };

    // When: getTimeErrorMessage 함수를 호출하면
    const errorMessage = getTimeErrorMessage(event.startTime, event.endTime);

    // Then: 시작 시간이 종료 시간보다 빠를 때 null을 반환한다
    expect(errorMessage).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  it('시작 시간이 비어있을 때 null을 반환한다', () => {
    // Given: 시작 시간이 비어있는 이벤트
    const event = {
      startTime: '',
      endTime: '10:00',
    };

    // When: getTimeErrorMessage 함수를 호출하면
    const errorMessage = getTimeErrorMessage(event.startTime, event.endTime);

    // Then: 시작 시간이 비어있을 때 null을 반환한다
    expect(errorMessage).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  it('종료 시간이 비어있을 때 null을 반환한다', () => {
    // Given: 종료 시간이 비어있는 이벤트
    const event = {
      startTime: '10:00',
      endTime: '',
    };

    // When: getTimeErrorMessage 함수를 호출하면
    const errorMessage = getTimeErrorMessage(event.startTime, event.endTime);

    // Then: 종료 시간이 비어있을 때 null을 반환한다
    expect(errorMessage).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  it('시작 시간과 종료 시간이 모두 비어있을 때 null을 반환한다', () => {
    // Given: 시작 시간과 종료 시간이 모두 비어있는 이벤트
    const event = {
      startTime: '',
      endTime: '',
    };

    // When: getTimeErrorMessage 함수를 호출하면
    const errorMessage = getTimeErrorMessage(event.startTime, event.endTime);

    // Then: 시작 시간과 종료 시간이 모두 비어있을 때 null을 반환한다
    expect(errorMessage).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });
});
