import { getNotificationLabel } from '../../lib/notification';

describe('lib/notification', () => {
  it('getNotificationLabel: 분 값에 맞는 라벨을 반환한다', () => {
    expect(getNotificationLabel(1)).toBe('1분 전');
    expect(getNotificationLabel(10)).toBe('10분 전');
    expect(getNotificationLabel(60)).toBe('1시간 전');
    expect(getNotificationLabel(9999)).toBeUndefined();
  });
});
