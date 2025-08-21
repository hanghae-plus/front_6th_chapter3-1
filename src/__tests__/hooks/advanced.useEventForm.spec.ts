import { act, renderHook } from '@testing-library/react';

import { useEventFormData } from '../../hooks/useEventForm';
import { Event, RepeatType } from '../../types';

describe('useEventForm', () => {
  const mockEvent: Event = {
    id: '1',
    title: '회의',
    date: '2025-01-15',
    startTime: '10:00',
    endTime: '11:00',
    description: '팀 회의',
    location: '회의실 A',
    category: '업무',
    notificationTime: 15,
    repeat: {
      type: 'none',
      interval: 2,
      endDate: '2025-03-15',
    },
  };

  describe('초기화', () => {
    it('파라미터 없이 호출하면 빈 폼으로 초기화된다', () => {
      const { result } = renderHook(() => useEventFormData());

      const expectedValues = {
        title: '',
        date: '',
        startTime: '',
        endTime: '',
        description: '',
        location: '',
        category: '업무',
        notificationTime: 10,
        isRepeating: true,
        repeatType: 'none',
        repeatInterval: 1,
        repeatEndDate: '',
      };

      Object.entries(expectedValues).forEach(([key, expectedValue]) => {
        expect(result.current.formData[key as keyof typeof expectedValues]).toBe(expectedValue);
      });

      expect(result.current.editingEvent).toBeNull();
    });

    // 훅이 초기 이벤트 값을 받을 수는 있지만,이 프로젝트에서 초기 이벤트를 전달하는 케이스가 없으므로 skip 처리함
    it.skip('초기 이벤트를 전달하면 해당 값으로 폼이 채워진다', () => {});
  });

  describe('데이터 변환', () => {
    it('getEventData가 FormData를 Event 형태로 변환한다', () => {
      const { result } = renderHook(() => useEventFormData());

      const testFormData = {
        title: '테스트 이벤트',
        date: '2025-01-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '테스트 설명',
        location: '테스트 장소',
        category: '개인',
        notificationTime: 15,
        isRepeating: false,
        repeatType: 'none' as RepeatType,
        repeatInterval: 2,
        repeatEndDate: '2025-03-15',
      };

      act(() => {
        result.current.setFormData(testFormData);
      });

      const eventData = result.current.getEventData();

      const expectedEvent = {
        title: testFormData.title,
        date: testFormData.date,
        startTime: testFormData.startTime,
        endTime: testFormData.endTime,
        description: testFormData.description,
        location: testFormData.location,
        category: testFormData.category,
        notificationTime: testFormData.notificationTime,
        repeat: {
          type: testFormData.repeatType,
          interval: testFormData.repeatInterval,
          endDate: testFormData.repeatEndDate,
        },
      };

      expect(eventData).toEqual(expectedEvent);
    });

    it('setEventData가 Event를 FormData 형태로 변환한다', () => {
      const { result } = renderHook(() => useEventFormData());

      act(() => {
        result.current.setEventData(mockEvent);
      });

      const expectedFormData = {
        title: '회의',
        date: '2025-01-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '팀 회의',
        location: '회의실 A',
        category: '업무',
        notificationTime: 15,
        isRepeating: false,
        repeatType: 'none',
        repeatInterval: 2,
        repeatEndDate: '2025-03-15',
      };

      Object.entries(expectedFormData).forEach(([key, expectedValue]) => {
        expect(result.current.formData[key as keyof typeof expectedFormData]).toBe(expectedValue);
      });
    });
  });

  describe('편집 상태 관리', () => {
    it('setEditingEvent로 이벤트를 편집 타겟으로 설정한다', () => {
      const { result } = renderHook(() => useEventFormData());

      expect(result.current.editingEvent).toBeNull();

      act(() => {
        // 해당 이벤트를 에디팅 상태로 만든다
        result.current.setEditingEvent(mockEvent);
      });

      // mock event가 에디팅 상태가 되었는지 확인한다
      expect(result.current.editingEvent).toEqual(mockEvent);
    });

    it('resetFormData로 폼과 편집 상태를 초기값으로 리셋한다', () => {
      const { result } = renderHook(() => useEventFormData());

      // 먼저 데이터를 변경
      act(() => {
        result.current.setFormData({
          title: '변경된 이벤트',
          date: '2025-03-01',
          startTime: '16:00',
          endTime: '17:00',
          description: '변경된 설명',
          location: '변경된 장소',
          category: '개인',
          notificationTime: 20,
          isRepeating: false,
          repeatType: 'none',
          repeatInterval: 1,
          repeatEndDate: '',
        });
        result.current.setEditingEvent(mockEvent);
      });

      // 리셋 실행
      act(() => {
        result.current.resetFormData();
      });

      // 초기값으로 돌아갔는지 확인
      const expectedInitialValues = {
        title: '',
        date: '',
        startTime: '',
        endTime: '',
        description: '',
        location: '',
        category: '업무',
        notificationTime: 10,
        isRepeating: true,
        repeatType: 'none',
        repeatInterval: 1,
        repeatEndDate: '',
      };

      Object.entries(expectedInitialValues).forEach(([key, expectedValue]) => {
        expect(result.current.formData[key as keyof typeof expectedInitialValues]).toBe(
          expectedValue
        );
      });

      expect(result.current.editingEvent).toBeNull();
    });
  });
});
