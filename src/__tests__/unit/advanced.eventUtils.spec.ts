import { getNotificationLabel, validateEventData } from '../../utils/eventUtils';

describe('validateEventData: 이벤트 데이터 유효성 검사', () => {
  it('모든 필수 정보가 있고 에러가 없으면 null을 반환해야 한다', () => {
    const result = validateEventData('회의', '2025-10-15', '09:00', '10:00', null, null);
    expect(result).toBeNull();
  });

  it('필수 정보가 누락되어 있으면 에러 메시지를 반환해야 한다', () => {
    const result = validateEventData('', '2025-10-15', '09:00', '10:00', null, null);
    expect(result).toBe('필수 정보를 모두 입력해주세요.');
  });

  it('시간 설정이 잘못되어 있으면 에러 메시지를 반환해야 한다', () => {
    const result = validateEventData(
      '회의',
      '2025-10-15',
      '10:00',
      '09:00',
      '시작 시간은 종료 시간보다 빨라야 합니다.',
      '종료 시간은 시작 시간보다 늦어야 합니다.'
    );
    expect(result).toBe('시간 설정을 확인해주세요.');
  });
});

describe('getNotificationLabel: 알림 텍스트 반환', () => {
  it('정의된 알림 시간에 대해 올바른 레이블을 반환해야 한다', () => {
    expect(getNotificationLabel(1)).toBe('1분 전');
    expect(getNotificationLabel(10)).toBe('10분 전');
    expect(getNotificationLabel(60)).toBe('1시간 전');
    expect(getNotificationLabel(120)).toBe('2시간 전');
    expect(getNotificationLabel(1440)).toBe('1일 전');
  });

  it('존재하지 않는 알림 시간에 대해 빈 문자열을 반환해야 한다', () => {
    const result = getNotificationLabel(999);
    expect(result).toBe('');
  });
});
