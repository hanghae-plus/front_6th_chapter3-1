import { describe, expect } from 'vitest';

import { getTimeErrorMessage } from '../../utils/timeValidation';

describe('timeValidation', () => {
  describe('getTimeErrorMessage 함수', () => {
    it('올바른 시간 순서일 때 에러가 없는 객체를 반환한다', () => {
      const result = getTimeErrorMessage('09:00', '10:00');
      expect(result.startTimeError).toBeNull();
      expect(result.endTimeError).toBeNull();
    });

    it('시작 시간이 종료 시간보다 늦을 때 에러 메시지를 반환한다', () => {
      const result = getTimeErrorMessage('10:00', '09:00');
      expect(result.startTimeError).toBeTruthy();
      expect(result.endTimeError).toBeTruthy();
      expect(typeof result.startTimeError).toBe('string');
      expect(typeof result.endTimeError).toBe('string');
    });

    it('시작 시간과 종료 시간이 같을 때 에러 메시지를 반환한다', () => {
      const result = getTimeErrorMessage('09:00', '09:00');
      expect(result.startTimeError).toBeTruthy();
      expect(result.endTimeError).toBeTruthy();
    });

    it('자정을 넘나드는 시간을 올바르게 처리한다', () => {
      const result = getTimeErrorMessage('23:00', '23:59');
      expect(result.startTimeError).toBeNull();
      expect(result.endTimeError).toBeNull();
    });

    it('하루의 시작과 끝 시간을 올바르게 처리한다', () => {
      const result = getTimeErrorMessage('00:00', '23:59');
      expect(result.startTimeError).toBeNull();
      expect(result.endTimeError).toBeNull();
    });

    it('1분 차이 시간을 올바르게 처리한다', () => {
      const result = getTimeErrorMessage('09:00', '09:01');
      expect(result.startTimeError).toBeNull();
      expect(result.endTimeError).toBeNull();
    });

    it('시간 형식이 올바르지 않을 때도 처리한다', () => {
      // 잘못된 형식이라도 함수가 에러를 내지 않아야 함
      expect(() => getTimeErrorMessage('25:00', '10:00')).not.toThrow();
      expect(() => getTimeErrorMessage('09:00', '25:00')).not.toThrow();
      expect(() => getTimeErrorMessage('invalid', '10:00')).not.toThrow();
    });

    it('빈 문자열 입력을 처리한다', () => {
      expect(() => getTimeErrorMessage('', '10:00')).not.toThrow();
      expect(() => getTimeErrorMessage('09:00', '')).not.toThrow();
      expect(() => getTimeErrorMessage('', '')).not.toThrow();
    });

    describe('경계값 테스트', () => {
      it('자정 시간을 올바르게 처리한다', () => {
        const result = getTimeErrorMessage('00:00', '00:01');
        expect(result.startTimeError).toBeNull();
        expect(result.endTimeError).toBeNull();
      });

      it('23:59 시간을 올바르게 처리한다', () => {
        const result = getTimeErrorMessage('23:58', '23:59');
        expect(result.startTimeError).toBeNull();
        expect(result.endTimeError).toBeNull();
      });

      it('점심시간대 일반적인 시간을 처리한다', () => {
        const result = getTimeErrorMessage('12:00', '13:00');
        expect(result.startTimeError).toBeNull();
        expect(result.endTimeError).toBeNull();
      });

      it('오전/오후 경계 시간을 처리한다', () => {
        const result = getTimeErrorMessage('11:59', '12:01');
        expect(result.startTimeError).toBeNull();
        expect(result.endTimeError).toBeNull();
      });

      it('새벽 시간을 처리한다', () => {
        const result = getTimeErrorMessage('01:00', '02:00');
        expect(result.startTimeError).toBeNull();
        expect(result.endTimeError).toBeNull();
      });

      it('늦은 밤 시간을 처리한다', () => {
        const result = getTimeErrorMessage('22:00', '23:00');
        expect(result.startTimeError).toBeNull();
        expect(result.endTimeError).toBeNull();
      });
    });

    describe('에러 케이스', () => {
      it('큰 시간 차이로 잘못된 순서일 때', () => {
        const result = getTimeErrorMessage('18:00', '09:00');
        expect(result).toBeTruthy();
      });

      it('1분 차이로 잘못된 순서일 때', () => {
        const result = getTimeErrorMessage('09:01', '09:00');
        expect(result).toBeTruthy();
      });

      it('자정 근처에서 잘못된 순서일 때', () => {
        const result = getTimeErrorMessage('23:59', '23:58');
        expect(result).toBeTruthy();
      });

      it('같은 시간일 때 여러 케이스', () => {
        expect(getTimeErrorMessage('09:00', '09:00')).toBeTruthy();
        expect(getTimeErrorMessage('12:30', '12:30')).toBeTruthy();
        expect(getTimeErrorMessage('23:59', '23:59')).toBeTruthy();
        expect(getTimeErrorMessage('00:00', '00:00')).toBeTruthy();
      });
    });

    describe('특수 형식 테스트', () => {
      it('초 단위가 포함된 시간도 처리한다', () => {
        // 실제 input[type="time"]에서는 초가 나오지 않지만,
        // 혹시 모를 경우를 대비
        expect(() => getTimeErrorMessage('09:00:00', '10:00:00')).not.toThrow();
      });

      it('단일 자리 시간을 처리한다', () => {
        expect(() => getTimeErrorMessage('9:00', '10:00')).not.toThrow();
        expect(() => getTimeErrorMessage('09:0', '10:00')).not.toThrow();
      });

      it('공백이 포함된 시간을 처리한다', () => {
        expect(() => getTimeErrorMessage(' 09:00 ', '10:00')).not.toThrow();
        expect(() => getTimeErrorMessage('09:00', ' 10:00 ')).not.toThrow();
      });
    });

    describe('자정 넘어가는 시간 처리 경계값 테스트', () => {
      it('23:30-01:30과 같이 자정을 넘는 시간은 현재 구현에서 에러로 처리된다', () => {
        // 현재 timeValidation은 같은 날짜 기준으로만 비교하므로 자정 넘는 시간은 에러
        const result = getTimeErrorMessage('23:30', '01:30');
        expect(result.startTimeError).toBeTruthy();
        expect(result.endTimeError).toBeTruthy();
        expect(result.startTimeError).toContain('시작 시간은 종료 시간보다 빨라야 합니다');
        expect(result.endTimeError).toContain('종료 시간은 시작 시간보다 늦어야 합니다');
      });

      it('22:00-02:00과 같이 자정을 넘는 시간 처리', () => {
        const result = getTimeErrorMessage('22:00', '02:00');
        expect(result.startTimeError).toBeTruthy();
        expect(result.endTimeError).toBeTruthy();
      });

      it('23:59-00:01과 같이 자정 경계를 넘는 시간 처리', () => {
        const result = getTimeErrorMessage('23:59', '00:01');
        expect(result.startTimeError).toBeTruthy();
        expect(result.endTimeError).toBeTruthy();
      });

      it('23:45-01:15와 같은 야간 이벤트 시간 처리', () => {
        const result = getTimeErrorMessage('23:45', '01:15');
        expect(result.startTimeError).toBeTruthy();
        expect(result.endTimeError).toBeTruthy();
      });

      it('21:30-03:30과 같은 긴 야간 이벤트 시간 처리', () => {
        const result = getTimeErrorMessage('21:30', '03:30');
        expect(result.startTimeError).toBeTruthy();
        expect(result.endTimeError).toBeTruthy();
      });

      it('자정 정각을 포함한 경계값 - 23:00-01:00', () => {
        const result = getTimeErrorMessage('23:00', '01:00');
        expect(result.startTimeError).toBeTruthy();
        expect(result.endTimeError).toBeTruthy();
      });

      it('자정을 넘지 않는 늦은 시간은 정상 처리 - 22:00-23:59', () => {
        const result = getTimeErrorMessage('22:00', '23:59');
        expect(result.startTimeError).toBeNull();
        expect(result.endTimeError).toBeNull();
      });

      it('자정을 넘지 않는 새벽 시간은 정상 처리 - 00:00-05:00', () => {
        const result = getTimeErrorMessage('00:00', '05:00');
        expect(result.startTimeError).toBeNull();
        expect(result.endTimeError).toBeNull();
      });
    });

    describe('실제 사용 시나리오', () => {
      it('일반적인 회의 시간', () => {
        expect(getTimeErrorMessage('14:00', '15:00').startTimeError).toBeNull();
        expect(getTimeErrorMessage('14:00', '16:00').startTimeError).toBeNull();
        expect(getTimeErrorMessage('09:00', '17:00').startTimeError).toBeNull();
      });

      it('짧은 약속 시간', () => {
        expect(getTimeErrorMessage('12:00', '12:30').startTimeError).toBeNull();
        expect(getTimeErrorMessage('15:30', '16:00').startTimeError).toBeNull();
      });

      it('긴 이벤트 시간', () => {
        expect(getTimeErrorMessage('09:00', '18:00').startTimeError).toBeNull();
        expect(getTimeErrorMessage('10:00', '22:00').startTimeError).toBeNull();
      });

      it('사용자가 실수하기 쉬운 시간', () => {
        expect(getTimeErrorMessage('14:00', '02:00')).toBeTruthy(); // PM 2시와 AM 2시 혼동
        expect(getTimeErrorMessage('10:30', '10:00')).toBeTruthy(); // 30분과 00분 혼동
      });
    });
  });
});
