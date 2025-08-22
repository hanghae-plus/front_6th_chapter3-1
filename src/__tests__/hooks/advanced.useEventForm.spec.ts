import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect } from 'vitest';

import { useEventForm } from '../../hooks/useEventForm';

describe('useEventForm 훅', () => {
  describe('초기 상태', () => {
    it('모든 필드가 기본값으로 초기화된다', () => {
      const { result } = renderHook(() => useEventForm());

      expect(result.current.title).toBe('');
      expect(result.current.date).toBe('');
      expect(result.current.startTime).toBe('');
      expect(result.current.endTime).toBe('');
      expect(result.current.description).toBe('');
      expect(result.current.location).toBe('');
      expect(result.current.category).toBe('업무');
      expect(result.current.isRepeating).toBe(true);
      expect(result.current.repeatType).toBe('none');
      expect(result.current.repeatInterval).toBe(1);
      expect(result.current.repeatEndDate).toBe('');
      expect(result.current.notificationTime).toBe(10);
      expect(result.current.editingEvent).toBeNull();
    });

    it('에러 상태가 초기에는 비어있다', () => {
      const { result } = renderHook(() => useEventForm());

      expect(result.current.startTimeError).toBeNull();
      expect(result.current.endTimeError).toBeNull();
    });
  });

  describe('필드 업데이트', () => {
    it('제목을 설정할 수 있다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setTitle('새로운 일정');
      });

      expect(result.current.title).toBe('새로운 일정');
    });

    it('날짜를 설정할 수 있다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setDate('2024-07-15');
      });

      expect(result.current.date).toBe('2024-07-15');
    });

    it('설명을 설정할 수 있다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setDescription('테스트 설명');
      });

      expect(result.current.description).toBe('테스트 설명');
    });

    it('위치를 설정할 수 있다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setLocation('회의실 A');
      });

      expect(result.current.location).toBe('회의실 A');
    });

    it('카테고리를 설정할 수 있다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setCategory('개인');
      });

      expect(result.current.category).toBe('개인');
    });

    it('반복 설정을 변경할 수 있다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setIsRepeating(true);
      });

      expect(result.current.isRepeating).toBe(true);
    });

    it('알림 시간을 설정할 수 있다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setNotificationTime(60);
      });

      expect(result.current.notificationTime).toBe(60);
    });
  });

  describe('시간 처리', () => {
    it('시작 시간을 설정할 수 있다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.handleStartTimeChange({
          target: { value: '09:00' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.startTime).toBe('09:00');
    });

    it('종료 시간을 설정할 수 있다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.handleEndTimeChange({
          target: { value: '10:00' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.endTime).toBe('10:00');
    });

    it('시작 시간이 종료 시간보다 늦으면 에러가 설정된다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.handleStartTimeChange({
          target: { value: '10:00' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        result.current.handleEndTimeChange({
          target: { value: '09:00' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.startTimeError).toBeTruthy();
      expect(result.current.endTimeError).toBeTruthy();
    });

    it('올바른 시간 순서일 때 에러가 클리어된다', () => {
      const { result } = renderHook(() => useEventForm());

      // 먼저 잘못된 시간 설정
      act(() => {
        result.current.handleStartTimeChange({
          target: { value: '10:00' },
        } as React.ChangeEvent<HTMLInputElement>);
        result.current.handleEndTimeChange({
          target: { value: '09:00' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      // 올바른 시간으로 수정
      act(() => {
        result.current.handleEndTimeChange({
          target: { value: '11:00' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.startTimeError).toBeNull();
      expect(result.current.endTimeError).toBeNull();
    });
  });

  describe('이벤트 편집', () => {
    const mockEvent = {
      id: '1',
      title: '테스트 이벤트',
      date: '2024-07-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '업무',
      repeat: { type: 'none' as const, interval: 1 },
      notificationTime: 30,
    };

    it('기존 이벤트 편집 시 모든 필드가 설정된다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.editEvent(mockEvent);
      });

      expect(result.current.editingEvent).toEqual(mockEvent);
      expect(result.current.title).toBe('테스트 이벤트');
      expect(result.current.date).toBe('2024-07-15');
      expect(result.current.startTime).toBe('09:00');
      expect(result.current.endTime).toBe('10:00');
      expect(result.current.description).toBe('테스트 설명');
      expect(result.current.location).toBe('테스트 장소');
      expect(result.current.category).toBe('업무');
      expect(result.current.notificationTime).toBe(30);
    });

    it('반복 일정 편집 시 반복 설정이 올바르게 설정된다', () => {
      const repeatingEvent = {
        ...mockEvent,
        repeat: { type: 'weekly' as const, interval: 2, endDate: '2024-12-31' },
      };

      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.editEvent(repeatingEvent);
      });

      expect(result.current.isRepeating).toBe(true);
      expect(result.current.repeatType).toBe('weekly');
      expect(result.current.repeatInterval).toBe(2);
      expect(result.current.repeatEndDate).toBe('2024-12-31');
    });
  });

  describe('폼 초기화', () => {
    it('resetForm 호출 시 모든 필드가 초기값으로 돌아간다', () => {
      const { result } = renderHook(() => useEventForm());

      // 필드들을 수정
      act(() => {
        result.current.setTitle('테스트');
        result.current.setDate('2024-07-15');
        result.current.setDescription('설명');
        result.current.setLocation('장소');
        result.current.setCategory('개인');
        result.current.setIsRepeating(true);
        result.current.setNotificationTime(60);
      });

      // 초기화
      act(() => {
        result.current.resetForm();
      });

      expect(result.current.title).toBe('');
      expect(result.current.date).toBe('');
      expect(result.current.description).toBe('');
      expect(result.current.location).toBe('');
      expect(result.current.category).toBe('업무');
      expect(result.current.isRepeating).toBe(false);
      expect(result.current.notificationTime).toBe(10);
      expect(result.current.editingEvent).toBeNull();
    });

    it('resetForm 호출 시 에러도 클리어된다', () => {
      const { result } = renderHook(() => useEventForm());

      // 에러 상태 만들기
      act(() => {
        result.current.handleStartTimeChange({
          target: { value: '10:00' },
        } as React.ChangeEvent<HTMLInputElement>);
        result.current.handleEndTimeChange({
          target: { value: '09:00' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      // 초기화
      act(() => {
        result.current.resetForm();
      });

      expect(result.current.startTimeError).toBeNull();
      expect(result.current.endTimeError).toBeNull();
      expect(result.current.startTime).toBe('');
      expect(result.current.endTime).toBe('');
    });
  });

  describe('경계값 테스트', () => {
    it('빈 문자열들을 설정할 수 있다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setTitle('');
        result.current.setDescription('');
        result.current.setLocation('');
      });

      expect(result.current.title).toBe('');
      expect(result.current.description).toBe('');
      expect(result.current.location).toBe('');
    });

    it('동일한 시작/종료 시간을 설정할 수 있다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.handleStartTimeChange({
          target: { value: '10:00' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        result.current.handleEndTimeChange({
          target: { value: '10:00' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.startTime).toBe('10:00');
      expect(result.current.endTime).toBe('10:00');
      expect(result.current.startTimeError).toBeTruthy();
    });
  });
});
