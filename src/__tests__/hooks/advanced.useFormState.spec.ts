import { renderHook, act } from '@testing-library/react';

import { useFormState } from '../../hooks/useFormState';
import { Event } from '../../types';

const mockEvent: Event = {
  id: '1',
  title: '테스트 회의',
  date: '2025-10-15',
  startTime: '09:00',
  endTime: '10:00',
  description: '테스트 설명',
  location: '회의실 A',
  category: '업무',
  repeat: { type: 'weekly', interval: 2, endDate: '2025-12-31' },
  notificationTime: 15,
};

describe('초기 상태 설정', () => {
  it('initialEvent가 없으면 기본값으로 초기화되어야 한다', () => {
    // Given & When: initialEvent 없이 훅을 초기화하면
    const { result } = renderHook(() => useFormState());

    // Then: 기본값으로 폼 상태가 설정되어야 한다
    expect(result.current.formState.title).toBe('');
    expect(result.current.formState.category).toBe('업무');
    expect(result.current.formState.isRepeating).toBe(true);
    expect(result.current.formState.repeatType).toBe('none');
    expect(result.current.formState.notificationTime).toBe(10);
  });

  it('initialEvent가 있으면 해당 값으로 초기화되어야 한다', () => {
    // Given & When: initialEvent와 함께 훅을 초기화하면
    const { result } = renderHook(() => useFormState(mockEvent));

    // Then: initialEvent 값으로 폼 상태가 설정되어야 한다
    expect(result.current.formState.title).toBe('테스트 회의');
    expect(result.current.formState.date).toBe('2025-10-15');
    expect(result.current.formState.isRepeating).toBe(true);
    expect(result.current.formState.repeatType).toBe('weekly');
    expect(result.current.formState.repeatInterval).toBe(2);
  });
});

describe('필드 업데이트', () => {
  it('updateField 호출 시 해당 필드만 업데이트되어야 한다', () => {
    // Given: 초기화된 훅이 있고
    const { result } = renderHook(() => useFormState());

    // When: title 필드를 업데이트하면
    act(() => {
      result.current.updateField('title', '새로운 제목');
    });

    // Then: title만 변경되고 다른 필드는 유지되어야 한다
    expect(result.current.formState.title).toBe('새로운 제목');
    expect(result.current.formState.category).toBe('업무');
  });
});

describe('폼 리셋', () => {
  it('initialEvent 없이 resetForm 호출 시 기본값으로 리셋되어야 한다', () => {
    // Given: 필드가 수정된 상태의 훅이 있고
    const { result } = renderHook(() => useFormState());

    act(() => {
      result.current.updateField('title', '수정된 제목');
      result.current.updateField('category', '개인');
    });

    // When: resetForm을 호출하면
    act(() => {
      result.current.resetForm();
    });

    // Then: 기본값으로 리셋되어야 한다
    expect(result.current.formState.title).toBe('');
    expect(result.current.formState.category).toBe('업무');
  });

  it('initialEvent가 있을 때 resetForm 호출 시 initialEvent 값으로 리셋되어야 한다', () => {
    // Given: initialEvent가 있고 필드가 수정된 상태의 훅이 있고
    const { result } = renderHook(() => useFormState(mockEvent));

    act(() => {
      result.current.updateField('title', '수정된 제목');
      result.current.updateField('category', '개인');
    });

    // When: resetForm을 호출하면
    act(() => {
      result.current.resetForm();
    });

    // Then: initialEvent 값으로 리셋되어야 한다
    expect(result.current.formState.title).toBe('테스트 회의');
    expect(result.current.formState.category).toBe('업무');
  });
});

describe('이벤트 로드', () => {
  it('loadEvent 호출 시 새로운 이벤트 데이터로 폼 상태가 변경되어야 한다', () => {
    // Given: 초기화된 훅이 있고
    const { result } = renderHook(() => useFormState());

    const newEvent: Event = {
      ...mockEvent,
      id: '2',
      title: '새로운 이벤트',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
    };

    // When: loadEvent를 호출하면
    act(() => {
      result.current.loadEvent(newEvent);
    });

    // Then: 새로운 이벤트 데이터로 폼 상태가 변경되어야 한다
    expect(result.current.formState.title).toBe('새로운 이벤트');
    expect(result.current.formState.category).toBe('개인');
    expect(result.current.formState.isRepeating).toBe(false);
  });
});
