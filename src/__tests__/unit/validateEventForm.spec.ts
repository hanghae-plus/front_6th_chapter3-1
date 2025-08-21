import { validateEventForm } from '../../utils/eventValidation';

describe('validateEventForm', () => {
  it('필수 정보를 모두 입력하지 않았을 때 유효하지 않은 결과를 반환한다', () => {
    // 필수 정보를 모두 입력하지 않음
    const result = validateEventForm('', '', '', '', null, null);

    // 유효하지 않은 결과를 반환한다.
    expect(result.isValid).toEqual(false);

    // 에러 메시지를 반환한다.
    expect(result.message).toEqual('필수 정보를 모두 입력해주세요.');
  });

  it('시간 설정이 잘못되었을 때 유효하지 않은 결과를 반환한다', () => {
    // 시간 설정이 잘못됨
    const result = validateEventForm(
      'Meeting',
      '2023-10-10',
      '10:00',
      '11:00',
      'Invalid start time',
      null
    );

    // 유효하지 않은 결과를 반환한다.
    expect(result.isValid).toEqual(false);

    // 에러 메시지를 반환한다.
    expect(result.message).toEqual('시간 설정을 확인해주세요.');
  });

  it('모든 필드가 올바르게 입력되었을 때 유효한 결과를 반환한다', () => {
    // 모든 필드가 올바르게 입력됨
    const result = validateEventForm('Meeting', '2023-10-10', '10:00', '11:00', null, null);

    // 유효한 결과를 반환한다.
    expect(result.isValid).toEqual(true);

    // 에러 메시지를 반환하지 않는다.
    expect(result.message).toEqual(undefined);
  });
});
