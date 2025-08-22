import { act, renderHook } from '@testing-library/react';
import React from 'react';

import { useEventForm } from '../../hooks/useEventForm.ts';
import { Event } from '../../types.ts';

describe('useEventForm Integration', () => {
  const mockEvent: Event = {
    id: '1',
    title: '팀 회의',
    date: '2025-10-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  it('이벤트 편집 시 편집한 데이터가 모든 서브 훅에 정확히 반영된다', () => {
    const editEvent = { ...mockEvent, title: '주간 회의', location: '회의실 C' };

    const { result } = renderHook(() => useEventForm(mockEvent));

    act(() => {
      result.current.editEvent(editEvent);
    });

    expect(result.current.title).toBe('주간 회의');
    expect(result.current.location).toBe('회의실 C');
  });

  it('resetForm 호출 시 useEventFormData, useEventTimeManagement, useEventRepeatSettings, useEventEditor의 모든 상태가 초기값으로 돌아간다', () => {
    const resetEvent = {
      ...mockEvent,
      category: '개인',
      title: '점심 약속',
      description: '친구와 점심 약속',
      location: '성수',
    };

    const { result } = renderHook(() => useEventForm(resetEvent));
    act(() => {
      result.current.resetForm();
    });

    expect(result.current.title).toBe('');
    expect(result.current.location).toBe('');
    expect(result.current.description).toBe('');
  });

  it('startTime 변경 시 useEventTimeManagement의 handleStartTimeChange가 실행되고 startTime의 검증 에러가 즉시 업데이트된다', () => {
    const editEvent = { ...mockEvent, title: '전체 회의', location: '회의실 A' };

    const { result } = renderHook(() => useEventForm(editEvent));

    act(() => {
      const startTimeEvent = {
        target: { value: '10:00' }, // endTime(09:00)보다 늦음
      } as React.ChangeEvent<HTMLInputElement>;
      result.current.handleStartTimeChange(startTimeEvent);
    });

    expect(result.current.startTime).toBe('10:00');
    expect(result.current.startTimeError).toBe('시작 시간은 종료 시간보다 빨라야 합니다.');
    expect(result.current.endTimeError).toBe('종료 시간은 시작 시간보다 늦어야 합니다.');
  });

  it('기존 이벤트 편집 후 resetForm 호출 시 모든 폼 상태는 초기화된다', () => {
    const { result } = renderHook(() => useEventForm({ ...mockEvent }));

    // 1. 기존 이벤트 편집 모드 진입
    act(() => {
      result.current.editEvent(mockEvent);
    });

    // 편집 상태 확인
    expect(result.current.editingEvent).toBe(mockEvent);
    expect(result.current.title).toBe('팀 회의');
    expect(result.current.date).toBe('2025-10-15');

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.title).toBe('');
    expect(result.current.date).toBe('');
    expect(result.current.startTime).toBe('');
    expect(result.current.endTime).toBe('');
    expect(result.current.description).toBe('');
    expect(result.current.location).toBe('');
    expect(result.current.category).toBe('업무');
    expect(result.current.isRepeating).toBe(false);
    expect(result.current.notificationTime).toBe(10);
  });
});
