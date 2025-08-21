import { describe, it, expect } from 'vitest';

import { RepeatType } from '../../types';
import { getEventDisplayInfo, getEventCellStyle } from '../../utils/eventDisplayUtils';
import { createMockEvent } from '../utils';

describe('eventDisplayUtils', () => {
  describe('getEventDisplayInfo 함수', () => {
    it('알림이 없는 이벤트의 정보를 올바르게 반환한다', () => {
      const event = createMockEvent(1, {
        title: '테스트 이벤트',
        notificationTime: 0,
      });
      const notifiedEvents: string[] = [];

      const result = getEventDisplayInfo(event, notifiedEvents);

      expect(result.isNotified).toBe(false);
      expect(result.notificationLabel).toBe('알림 없음');
      expect(result.repeatText).toBe('');
    });

    it('알림이 있는 이벤트의 정보를 올바르게 반환한다', () => {
      const event = createMockEvent(1, {
        title: '테스트 이벤트',
        notificationTime: 10,
      });
      const notifiedEvents: string[] = [];

      const result = getEventDisplayInfo(event, notifiedEvents);

      expect(result.isNotified).toBe(false);
      expect(result.notificationLabel).toBe('10분 전');
      expect(result.repeatText).toBe('');
    });

    it('알림이 도래한 이벤트를 올바르게 감지한다', () => {
      const event = createMockEvent(1, {
        title: '테스트 이벤트',
        notificationTime: 10,
      });
      const notifiedEvents = ['1'];

      const result = getEventDisplayInfo(event, notifiedEvents);

      expect(result.isNotified).toBe(true);
      expect(result.notificationLabel).toBe('10분 전');
    });

    it('다양한 알림 시간 옵션을 올바르게 처리한다', () => {
      const testCases = [
        { notificationTime: 1, expectedLabel: '1분 전' },
        { notificationTime: 10, expectedLabel: '10분 전' },
        { notificationTime: 60, expectedLabel: '1시간 전' },
        { notificationTime: 120, expectedLabel: '2시간 전' },
        { notificationTime: 1440, expectedLabel: '1일 전' },
      ];

      testCases.forEach(({ notificationTime, expectedLabel }) => {
        const event = createMockEvent(1, { notificationTime });
        const result = getEventDisplayInfo(event, []);
        expect(result.notificationLabel).toBe(expectedLabel);
      });
    });

    it('반복 일정 정보를 올바르게 생성한다', () => {
      const event = createMockEvent(1, {
        title: '반복 이벤트',
        repeat: {
          type: 'weekly',
          interval: 2,
          endDate: '2025-12-31',
        },
      });

      const result = getEventDisplayInfo(event, []);

      expect(result.repeatText).toBe('반복: 2주마다 (종료: 2025-12-31)');
    });

    it('다양한 반복 유형을 올바르게 처리한다', () => {
      const testCases = [
        { type: 'daily', interval: 1, expected: '반복: 1일마다' },
        { type: 'weekly', interval: 2, expected: '반복: 2주마다' },
        { type: 'monthly', interval: 3, expected: '반복: 3월마다' },
        { type: 'yearly', interval: 1, expected: '반복: 1년마다' },
      ];

      testCases.forEach(({ type, interval, expected }) => {
        const event = createMockEvent(1, {
          repeat: { type: type as RepeatType, interval, endDate: undefined },
        });
        const result = getEventDisplayInfo(event, []);
        expect(result.repeatText).toBe(expected);
      });
    });

    it('종료일이 없는 반복 일정을 올바르게 처리한다', () => {
      const event = createMockEvent(1, {
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: undefined,
        },
      });

      const result = getEventDisplayInfo(event, []);

      expect(result.repeatText).toBe('반복: 1주마다');
    });

    it('반복이 없는 이벤트는 빈 반복 텍스트를 반환한다', () => {
      const event = createMockEvent(1, {
        repeat: { type: 'none', interval: 1, endDate: undefined },
      });

      const result = getEventDisplayInfo(event, []);

      expect(result.repeatText).toBe('');
    });
  });

  describe('getEventCellStyle 함수', () => {
    it('알림이 없는 이벤트의 스타일을 올바르게 반환한다', () => {
      const style = getEventCellStyle(false);

      expect(style.backgroundColor).toBe('#f5f5f5');
      expect(style.fontWeight).toBe('normal');
      expect(style.color).toBe('inherit');
    });

    it('알림이 있는 이벤트의 스타일을 올바르게 반환한다', () => {
      const style = getEventCellStyle(true);

      expect(style.backgroundColor).toBe('#ffebee');
      expect(style.fontWeight).toBe('bold');
      expect(style.color).toBe('#d32f2f');
    });

    it('공통 스타일 속성이 올바르게 설정된다', () => {
      const style = getEventCellStyle(false);

      expect(style.p).toBe(0.5);
      expect(style.my).toBe(0.5);
      expect(style.borderRadius).toBe(1);
      expect(style.minHeight).toBe('18px');
      expect(style.width).toBe('100%');
      expect(style.overflow).toBe('hidden');
    });

    it('알림 상태에 관계없이 공통 스타일은 동일하다', () => {
      const styleWithoutNotification = getEventCellStyle(false);
      const styleWithNotification = getEventCellStyle(true);

      expect(styleWithoutNotification.p).toBe(styleWithNotification.p);
      expect(styleWithoutNotification.my).toBe(styleWithNotification.my);
      expect(styleWithoutNotification.borderRadius).toBe(styleWithNotification.borderRadius);
      expect(styleWithoutNotification.minHeight).toBe(styleWithNotification.minHeight);
      expect(styleWithoutNotification.width).toBe(styleWithNotification.width);
      expect(styleWithoutNotification.overflow).toBe(styleWithNotification.overflow);
    });
  });
});
