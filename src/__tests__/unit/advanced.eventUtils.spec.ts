import { describe, it, expect } from 'vitest';

import { getNotificationLabel, formatRepeatInfo } from '../../utils/eventUtils';

describe('eventUtils - Advanced Functions', () => {
  describe('getNotificationLabel', () => {
    it('1분 전 알림 시간에 대해 올바른 라벨을 반환해야 한다', () => {
      const result = getNotificationLabel(1);
      expect(result).toBe('1분 전');
    });

    it('10분 전 알림 시간에 대해 올바른 라벨을 반환해야 한다', () => {
      const result = getNotificationLabel(10);
      expect(result).toBe('10분 전');
    });

    it('1시간 전 알림 시간에 대해 올바른 라벨을 반환해야 한다', () => {
      const result = getNotificationLabel(60);
      expect(result).toBe('1시간 전');
    });

    it('2시간 전 알림 시간에 대해 올바른 라벨을 반환해야 한다', () => {
      const result = getNotificationLabel(120);
      expect(result).toBe('2시간 전');
    });

    it('1일 전 알림 시간에 대해 올바른 라벨을 반환해야 한다', () => {
      const result = getNotificationLabel(1440);
      expect(result).toBe('1일 전');
    });

    it('존재하지 않는 알림 시간에 대해 undefined를 반환해야 한다', () => {
      const result = getNotificationLabel(999);
      expect(result).toBeUndefined();
    });

    it('0분 알림 시간에 대해 undefined를 반환해야 한다', () => {
      const result = getNotificationLabel(0);
      expect(result).toBeUndefined();
    });

    it('음수 알림 시간에 대해 undefined를 반환해야 한다', () => {
      const result = getNotificationLabel(-10);
      expect(result).toBeUndefined();
    });
  });

  describe('formatRepeatInfo', () => {
    it('반복 없음 타입에 대해 빈 문자열을 반환해야 한다', () => {
      const repeat = { type: 'none', interval: 1 };
      const result = formatRepeatInfo(repeat);
      expect(result).toBe('');
    });

    it('일간 반복에 대해 올바른 형식을 반환해야 한다', () => {
      const repeat = { type: 'daily', interval: 2 };
      const result = formatRepeatInfo(repeat);
      expect(result).toBe('2일마다');
    });

    it('주간 반복에 대해 올바른 형식을 반환해야 한다', () => {
      const repeat = { type: 'weekly', interval: 1 };
      const result = formatRepeatInfo(repeat);
      expect(result).toBe('1주마다');
    });

    it('월간 반복에 대해 올바른 형식을 반환해야 한다', () => {
      const repeat = { type: 'monthly', interval: 3 };
      const result = formatRepeatInfo(repeat);
      expect(result).toBe('3월마다');
    });

    it('년간 반복에 대해 올바른 형식을 반환해야 한다', () => {
      const repeat = { type: 'yearly', interval: 1 };
      const result = formatRepeatInfo(repeat);
      expect(result).toBe('1년마다');
    });

    it('종료 날짜가 있는 경우 종료 정보를 포함해야 한다', () => {
      const repeat = {
        type: 'weekly',
        interval: 2,
        endDate: '2025-12-31',
      };
      const result = formatRepeatInfo(repeat);
      expect(result).toBe('2주마다 (종료: 2025-12-31)');
    });

    it('종료 날짜가 없는 경우 종료 정보를 포함하지 않아야 한다', () => {
      const repeat = { type: 'monthly', interval: 1 };
      const result = formatRepeatInfo(repeat);
      expect(result).toBe('1월마다');
    });

    it('존재하지 않는 반복 타입에 대해 기본 형식을 반환해야 한다', () => {
      const repeat = { type: 'unknown', interval: 5 };
      const result = formatRepeatInfo(repeat);
      expect(result).toBe('5마다');
    });

    it('0 간격에 대해 올바른 형식을 반환해야 한다', () => {
      const repeat = { type: 'daily', interval: 0 };
      const result = formatRepeatInfo(repeat);
      expect(result).toBe('0일마다');
    });

    it('복잡한 반복 정보에 대해 올바른 형식을 반환해야 한다', () => {
      const repeat = {
        type: 'monthly',
        interval: 6,
        endDate: '2026-06-30',
      };
      const result = formatRepeatInfo(repeat);
      expect(result).toBe('6월마다 (종료: 2026-06-30)');
    });
  });
});
