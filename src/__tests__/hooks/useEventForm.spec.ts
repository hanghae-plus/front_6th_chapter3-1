import { act, renderHook } from '@testing-library/react';
import { ChangeEvent } from 'react';

import { useEventForm } from '../../hooks/useEventForm';
import type { Event } from '../../types';

describe('useEventForm', () => {
  const mockEvent: Event = {
    id: '1',
    title: '팀 회의',
    date: '2025-08-20',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  };

  describe('초기 상태', () => {
    it('initialEvent 없이 초기화되면 기본값으로 설정된다', () => {
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
      expect(result.current.editingEvent).toBe(null);
      expect(result.current.startTimeError).toBe(null);
      expect(result.current.endTimeError).toBe(null);
    });

    it('initialEvent와 함께 초기화되면 해당 값들로 설정된다', () => {
      const { result } = renderHook(() => useEventForm(mockEvent));

      expect(result.current.title).toBe('팀 회의');
      expect(result.current.date).toBe('2025-08-20');
      expect(result.current.startTime).toBe('10:00');
      expect(result.current.endTime).toBe('11:00');
      expect(result.current.description).toBe('주간 팀 미팅');
      expect(result.current.location).toBe('회의실 A');
      expect(result.current.category).toBe('업무');
      expect(result.current.isRepeating).toBe(false);
      expect(result.current.repeatType).toBe('none');
      expect(result.current.repeatInterval).toBe(1);
      expect(result.current.notificationTime).toBe(1);
    });
  });

  describe('상태 업데이트', () => {
    it('setTitle을 호출하면 title이 업데이트된다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => result.current.setTitle('새 제목'));
      expect(result.current.title).toBe('새 제목');
    });

    it('setDate를 호출하면 date가 업데이트된다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => result.current.setDate('2025-12-25'));
      expect(result.current.date).toBe('2025-12-25');
    });

    it('setDescription을 호출하면 description이 업데이트된다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => result.current.setDescription('새로운 설명'));
      expect(result.current.description).toBe('새로운 설명');
    });

    it('setLocation을 호출하면 location이 업데이트된다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => result.current.setLocation('새로운 위치'));
      expect(result.current.location).toBe('새로운 위치');
    });

    it('setCategory를 호출하면 category가 업데이트된다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => result.current.setCategory('개인'));
      expect(result.current.category).toBe('개인');
    });

    it('setIsRepeating을 호출하면 isRepeating이 업데이트된다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => result.current.setIsRepeating(true));
      expect(result.current.isRepeating).toBe(true);
    });

    it('setNotificationTime을 호출하면 notificationTime이 업데이트된다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => result.current.setNotificationTime(60));
      expect(result.current.notificationTime).toBe(60);
    });
  });

  describe('시간 핸들러', () => {
    it('handleStartTimeChange를 호출하면 startTime이 업데이트된다', () => {
      const { result } = renderHook(() => useEventForm());

      const mockEvent = {
        target: { value: '09:00' },
      } as ChangeEvent<HTMLInputElement>;

      act(() => result.current.handleStartTimeChange(mockEvent));
      expect(result.current.startTime).toBe('09:00');
    });

    it('handleEndTimeChange를 호출하면 endTime이 업데이트된다', () => {
      const { result } = renderHook(() => useEventForm());

      const mockEvent = {
        target: { value: '18:00' },
      } as ChangeEvent<HTMLInputElement>;

      act(() => result.current.handleEndTimeChange(mockEvent));
      expect(result.current.endTime).toBe('18:00');
    });

    it('시작 시간이 종료 시간보다 늦으면 에러가 설정된다', () => {
      const { result } = renderHook(() => useEventForm());

      const startTimeEvent = {
        target: { value: '18:00' },
      } as ChangeEvent<HTMLInputElement>;

      const endTimeEvent = {
        target: { value: '09:00' },
      } as ChangeEvent<HTMLInputElement>;

      act(() => result.current.handleStartTimeChange(startTimeEvent));
      act(() => result.current.handleEndTimeChange(endTimeEvent));

      expect(result.current.startTimeError).toBe('시작 시간은 종료 시간보다 빨라야 합니다.');
      expect(result.current.endTimeError).toBe('종료 시간은 시작 시간보다 늦어야 합니다.');
    });
  });

  describe('폼 리셋', () => {
    it('resetForm을 호출하면 모든 필드가 초기값으로 리셋된다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setTitle('테스트 제목');
        result.current.setDate('2025-12-25');
        result.current.setDescription('테스트 설명');
        result.current.setLocation('테스트 위치');
        result.current.setCategory('개인');
        result.current.setIsRepeating(true);
        result.current.setNotificationTime(60);
      });
      act(() => result.current.resetForm());

      expect(result.current.title).toBe('');
      expect(result.current.date).toBe('');
      expect(result.current.startTime).toBe('');
      expect(result.current.endTime).toBe('');
      expect(result.current.description).toBe('');
      expect(result.current.location).toBe('');
      expect(result.current.category).toBe('업무');
      expect(result.current.isRepeating).toBe(false);
      expect(result.current.repeatType).toBe('none');
      expect(result.current.repeatInterval).toBe(1);
      expect(result.current.repeatEndDate).toBe('');
      expect(result.current.notificationTime).toBe(10);
    });
  });

  describe('이벤트 편집', () => {
    it('editEvent를 호출하면 해당 이벤트의 값으로 폼이 설정된다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => result.current.editEvent(mockEvent));

      expect(result.current.editingEvent).toEqual(mockEvent);
      expect(result.current.title).toBe('팀 회의');
      expect(result.current.date).toBe('2025-08-20');
      expect(result.current.startTime).toBe('10:00');
      expect(result.current.endTime).toBe('11:00');
      expect(result.current.description).toBe('주간 팀 미팅');
      expect(result.current.location).toBe('회의실 A');
      expect(result.current.category).toBe('업무');
      expect(result.current.isRepeating).toBe(false);
      expect(result.current.repeatType).toBe('none');
      expect(result.current.repeatInterval).toBe(0);
      expect(result.current.notificationTime).toBe(1);
    });

    it('반복 이벤트를 편집할 때 isRepeating이 true로 설정된다', () => {
      const repeatingEvent: Event = {
        ...mockEvent,
        repeat: { type: 'daily', interval: 1 },
      };

      const { result } = renderHook(() => useEventForm());

      act(() => result.current.editEvent(repeatingEvent));

      expect(result.current.isRepeating).toBe(true);
      expect(result.current.repeatType).toBe('daily');
      expect(result.current.repeatInterval).toBe(1);
    });
  });
});
