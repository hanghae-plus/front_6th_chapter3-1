import { getTimeErrorMessage } from '../../utils/timeValidation';

describe('getTimeErrorMessage - 일정 시간 유효성 검증', () => {
  describe('시간 순서가 잘못된 경우', () => {
    test('시작 시간(15:00)이 종료 시간(14:00)보다 늦을 때 양쪽 모두 에러 메시지를 반환한다', () => {
      const result = getTimeErrorMessage('15:00', '14:00');
      expect(result.startTimeError).toBe('시작 시간은 종료 시간보다 빨라야 합니다.');
      expect(result.endTimeError).toBe('종료 시간은 시작 시간보다 늦어야 합니다.');
    });

    test('시작 시간(14:00)과 종료 시간(14:00)이 같을 때 양쪽 모두 에러 메시지를 반환한다', () => {
      const result = getTimeErrorMessage('14:00', '14:00');
      expect(result.startTimeError).toBe('시작 시간은 종료 시간보다 빨라야 합니다.');
      expect(result.endTimeError).toBe('종료 시간은 시작 시간보다 늦어야 합니다.');
    });
  });

  describe('시간 순서가 올바른 경우', () => {
    test('시작 시간(14:00)이 종료 시간(15:00)보다 빠를 때 에러 메시지를 반환하지 않는다', () => {
      const result = getTimeErrorMessage('14:00', '15:00');
      expect(result.startTimeError).toBeNull();
      expect(result.endTimeError).toBeNull();
    });
  });

  describe('입력값이 비어있는 경우', () => {
    test('시작 시간이 비어있을 때 에러 메시지를 반환하지 않는다', () => {
      const result = getTimeErrorMessage('', '15:00');
      expect(result.startTimeError).toBeNull();
      expect(result.endTimeError).toBeNull();
    });

    test('종료 시간이 비어있을 때 에러 메시지를 반환하지 않는다', () => {
      const result = getTimeErrorMessage('14:00', '');
      expect(result.startTimeError).toBeNull();
      expect(result.endTimeError).toBeNull();
    });
  });
});
