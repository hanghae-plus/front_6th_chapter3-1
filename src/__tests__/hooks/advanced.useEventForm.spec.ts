import { act, renderHook } from '@testing-library/react';
import { ChangeEvent } from 'react';
import { describe, it, expect } from 'vitest';

import { useEventForm } from '../../hooks/useEventForm.ts';
import { createEventMock } from '../utils.ts';

describe('useEventForm', () => {
  it('일정 추가 최초 화면은 입력칸은 비어 있고 기본 설정이 적용되어 있어야 한다.', () => {
    const { result } = renderHook(() => useEventForm());

    expect(result.current.title).toBe('');
    expect(result.current.date).toBe('');
    expect(result.current.startTime).toBe('');
    expect(result.current.endTime).toBe('');
    expect(result.current.description).toBe('');
    expect(result.current.location).toBe('');
    expect(result.current.category).toBe('업무');

    // TODO isRepeating 기본값에 대해 확인 필요
    expect(result.current.isRepeating).toBe(true);
    expect(result.current.repeatType).toBe('none');
    expect(result.current.repeatInterval).toBe(1);
    expect(result.current.repeatEndDate).toBe('');
    expect(result.current.notificationTime).toBe(10);

    expect(result.current.editingEvent).toBeNull();
    expect(result.current.startTimeError).toBeNull();
    expect(result.current.endTimeError).toBeNull();
  });

  it('사용자가 기존 일정을 편집으로 열면 모든 입력값이 해당 일정 내용으로 바뀌어야 한다', () => {
    const { result } = renderHook(() => useEventForm());
    const ev = createEventMock({
      id: '1',
      title: '편집 일정',
      date: '2025-10-10',
      startTime: '08:00',
      endTime: '09:00',
      category: '업무',
      repeat: { type: 'weekly', interval: 3, endDate: '2025-11-01' },
      notificationTime: 5,
    });

    act(() => {
      result.current.editEvent(ev);
    });

    expect(result.current.editingEvent?.id).toBe('1');
    expect(result.current.title).toBe('편집 일정');
    expect(result.current.date).toBe('2025-10-10');
    expect(result.current.startTime).toBe('08:00');
    expect(result.current.endTime).toBe('09:00');
    expect(result.current.category).toBe('업무');
    expect(result.current.isRepeating).toBe(true);
    expect(result.current.repeatType).toBe('weekly');
    expect(result.current.repeatInterval).toBe(3);
    expect(result.current.repeatEndDate).toBe('2025-11-01');
    expect(result.current.notificationTime).toBe(5);
  });

  it('사용자가 종료시간을 정해둔 상태에서 시작시간을 더 늦게 입력하면 오류가 보였다가, 정상값으로 고치면 사라져야 한다', () => {
    const { result } = renderHook(() => useEventForm());

    act(() => {
      result.current.setEndTime('10:00');
    });
    act(() => {
      result.current.handleStartTimeChange({
        target: { value: '11:00' },
      } as ChangeEvent<HTMLInputElement>);
    });
    expect(Boolean(result.current.startTimeError || result.current.endTimeError)).toBe(true);

    act(() => {
      result.current.handleStartTimeChange({
        target: { value: '09:00' },
      } as ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.startTimeError).toBeNull();
    expect(result.current.endTimeError).toBeNull();
  });

  it('사용자가 시작시간을 정해둔 상태에서 종료시간을 더 이르게 입력하면 오류가 보였다가, 정상값으로 고치면 사라져야 한다', () => {
    const { result } = renderHook(() => useEventForm());

    act(() => {
      result.current.setStartTime('12:00');
    });
    act(() => {
      result.current.handleEndTimeChange({
        target: { value: '11:00' },
      } as ChangeEvent<HTMLInputElement>);
    });
    expect(Boolean(result.current.startTimeError || result.current.endTimeError)).toBe(true);

    act(() => {
      result.current.handleEndTimeChange({
        target: { value: '13:00' },
      } as ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.startTimeError).toBeNull();
    expect(result.current.endTimeError).toBeNull();
  });

  it('시작과 종료를 같은 시간으로 입력하면 시간 오류가 표시되어야 한다', () => {
    const { result } = renderHook(() => useEventForm());

    act(() => {
      result.current.setStartTime('10:00');
    });
    act(() => {
      result.current.handleEndTimeChange({
        target: { value: '10:00' },
      } as ChangeEvent<HTMLInputElement>);
    });
    expect(Boolean(result.current.startTimeError || result.current.endTimeError)).toBe(true);
  });
});
