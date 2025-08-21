import { act, renderHook } from '@testing-library/react';

import { useEventForm } from '../../hooks/useEventForm';
import { Event } from '../../types';

describe('초기 상태', () => {
  it('initialEvent가 없을 때 기본 값으로 초기화된다', () => {
    const { result } = renderHook(() => useEventForm());

    expect(result.current.eventForm).toEqual({
      title: '',
      date: '',
      startTime: '',
      endTime: '',
      description: '',
      location: '',
      category: '업무',
      isRepeating: true,
      repeatType: 'none',
      repeatInterval: 1,
      repeatEndDate: '',
      notificationTime: 10,
    });
  });

  it('initialEvent가 있을 때 해당 이벤트의 값으로 초기화된다', () => {
    const initialEvent: Event = {
      id: '1',
      title: '기존 회의',
      date: '2025-10-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '기존 회의 설명',
      location: '기존 회의 위치',
      category: '업무',
      repeat: {
        type: 'none',
        interval: 1,
        endDate: '',
      },
      notificationTime: 10,
    };
    const { result } = renderHook(() => useEventForm(initialEvent));

    expect(result.current.eventForm).toEqual({
      title: initialEvent.title,
      date: initialEvent.date,
      startTime: initialEvent.startTime,
      endTime: initialEvent.endTime,
      description: initialEvent.description,
      location: initialEvent.location,
      category: initialEvent.category,
      isRepeating: initialEvent.repeat.type !== 'none',
      repeatType: initialEvent.repeat.type,
      repeatInterval: initialEvent.repeat.interval,
      repeatEndDate: initialEvent.repeat.endDate,
      notificationTime: initialEvent.notificationTime,
    });
  });
});

describe('상태 변경', () => {
  it('setEventForm으로 폼 데이터를 업데이트할 수 있다', () => {
    const { result } = renderHook(() => useEventForm());

    act(() => {
      result.current.setEventForm({
        ...result.current.eventForm,
        title: '새로운 제목',
        date: '2025-10-16',
      });
    });

    expect(result.current.eventForm.title).toBe('새로운 제목');
    expect(result.current.eventForm.date).toBe('2025-10-16');
  });

  it('resetForm으로 폼 데이터를 초기화할 수 있다', () => {
    const initialEvent: Event = {
      id: '1',
      title: '기존 회의',
      date: '2025-10-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '기존 회의 설명',
      location: '기존 회의 위치',
      category: '업무',
      repeat: {
        type: 'none',
        interval: 1,
        endDate: '',
      },
      notificationTime: 10,
    };
    const { result } = renderHook(() => useEventForm(initialEvent));

    expect(result.current.eventForm).toEqual({
      title: initialEvent.title,
      date: initialEvent.date,
      startTime: initialEvent.startTime,
      endTime: initialEvent.endTime,
      description: initialEvent.description,
      location: initialEvent.location,
      category: initialEvent.category,
      isRepeating: initialEvent.repeat.type !== 'none',
      repeatType: initialEvent.repeat.type,
      repeatInterval: initialEvent.repeat.interval,
      repeatEndDate: initialEvent.repeat.endDate,
      notificationTime: initialEvent.notificationTime,
    });

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.eventForm).toEqual({
      title: '',
      date: '',
      startTime: '',
      endTime: '',
      description: '',
      location: '',
      category: '업무',
      isRepeating: true,
      repeatType: 'none',
      repeatInterval: 1,
      repeatEndDate: '',
      notificationTime: 10,
    });
  });

  it('editEvent를 실행하면 editingEvent가 설정되고 eventForm이 해당 이벤트의 값으로 변경된다', () => {
    const mockEvent: Event = {
      id: '1',
      title: '기존 회의',
      date: '2025-10-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '기존 회의 설명',
      location: '기존 회의 위치',
      category: '업무',
      repeat: {
        type: 'none',
        interval: 1,
        endDate: '',
      },
      notificationTime: 10,
    };

    const { result } = renderHook(() => useEventForm());

    act(() => {
      result.current.editEvent(mockEvent);
    });

    expect(result.current.editingEvent).toEqual(mockEvent);
    expect(result.current.eventForm).toEqual({
      title: mockEvent.title,
      date: mockEvent.date,
      startTime: mockEvent.startTime,
      endTime: mockEvent.endTime,
      description: mockEvent.description,
      location: mockEvent.location,
      category: mockEvent.category,
      isRepeating: mockEvent.repeat.type !== 'none',
      repeatType: mockEvent.repeat.type,
      repeatInterval: mockEvent.repeat.interval,
      repeatEndDate: mockEvent.repeat.endDate,
      notificationTime: mockEvent.notificationTime,
    });
  });
});
