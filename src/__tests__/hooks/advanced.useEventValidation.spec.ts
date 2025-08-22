import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useEventValidation } from '../../hooks/useEventValidation';

// notistack 모킹
const mockEnqueueSnackbar = vi.fn();
vi.mock('notistack', () => ({
  useSnackbar: () => ({
    enqueueSnackbar: mockEnqueueSnackbar,
  }),
}));

describe('useEventValidation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validateEventForm이 올바른 폼 데이터를 검증해야 한다', () => {
    const { result } = renderHook(() => useEventValidation());

    const validFormData = {
      title: '테스트 이벤트',
      date: '2025-01-01',
      startTime: '09:00',
      endTime: '10:00',
      startTimeError: null,
      endTimeError: null,
    };

    const isValid = result.current.validateEventForm(validFormData);
    expect(isValid).toBe(true);
    expect(mockEnqueueSnackbar).not.toHaveBeenCalled();
  });

  it('제목이 누락된 경우 false를 반환하고 에러 메시지를 표시해야 한다', () => {
    const { result } = renderHook(() => useEventValidation());

    const invalidFormData = {
      title: '',
      date: '2025-01-01',
      startTime: '09:00',
      endTime: '10:00',
      startTimeError: null,
      endTimeError: null,
    };

    const isValid = result.current.validateEventForm(invalidFormData);
    expect(isValid).toBe(false);
    expect(mockEnqueueSnackbar).toHaveBeenCalledWith('필수 정보를 모두 입력해주세요.', {
      variant: 'error',
    });
  });

  it('날짜가 누락된 경우 false를 반환하고 에러 메시지를 표시해야 한다', () => {
    const { result } = renderHook(() => useEventValidation());

    const invalidFormData = {
      title: '테스트 이벤트',
      date: '',
      startTime: '09:00',
      endTime: '10:00',
      startTimeError: null,
      endTimeError: null,
    };

    const isValid = result.current.validateEventForm(invalidFormData);
    expect(isValid).toBe(false);
    expect(mockEnqueueSnackbar).toHaveBeenCalledWith('필수 정보를 모두 입력해주세요.', {
      variant: 'error',
    });
  });

  it('시작 시간이 누락된 경우 false를 반환하고 에러 메시지를 표시해야 한다', () => {
    const { result } = renderHook(() => useEventValidation());

    const invalidFormData = {
      title: '테스트 이벤트',
      date: '2025-01-01',
      startTime: '',
      endTime: '10:00',
      startTimeError: null,
      endTimeError: null,
    };

    const isValid = result.current.validateEventForm(invalidFormData);
    expect(isValid).toBe(false);
    expect(mockEnqueueSnackbar).toHaveBeenCalledWith('필수 정보를 모두 입력해주세요.', {
      variant: 'error',
    });
  });

  it('종료 시간이 누락된 경우 false를 반환하고 에러 메시지를 표시해야 한다', () => {
    const { result } = renderHook(() => useEventValidation());

    const invalidFormData = {
      title: '테스트 이벤트',
      date: '2025-01-01',
      startTime: '09:00',
      endTime: '',
      startTimeError: null,
      endTimeError: null,
    };

    const isValid = result.current.validateEventForm(invalidFormData);
    expect(isValid).toBe(false);
    expect(mockEnqueueSnackbar).toHaveBeenCalledWith('필수 정보를 모두 입력해주세요.', {
      variant: 'error',
    });
  });

  it('시작 시간 에러가 있는 경우 false를 반환하고 에러 메시지를 표시해야 한다', () => {
    const { result } = renderHook(() => useEventValidation());

    const invalidFormData = {
      title: '테스트 이벤트',
      date: '2025-01-01',
      startTime: '09:00',
      endTime: '10:00',
      startTimeError: '시작 시간이 종료 시간보다 늦습니다',
      endTimeError: null,
    };

    const isValid = result.current.validateEventForm(invalidFormData);
    expect(isValid).toBe(false);
    expect(mockEnqueueSnackbar).toHaveBeenCalledWith('시간 설정을 확인해주세요.', {
      variant: 'error',
    });
  });

  it('종료 시간 에러가 있는 경우 false를 반환하고 에러 메시지를 표시해야 한다', () => {
    const { result } = renderHook(() => useEventValidation());

    const invalidFormData = {
      title: '테스트 이벤트',
      date: '2025-01-01',
      startTime: '09:00',
      endTime: '10:00',
      startTimeError: null,
      endTimeError: '종료 시간이 시작 시간보다 빠릅니다',
    };

    const isValid = result.current.validateEventForm(invalidFormData);
    expect(isValid).toBe(false);
    expect(mockEnqueueSnackbar).toHaveBeenCalledWith('시간 설정을 확인해주세요.', {
      variant: 'error',
    });
  });

  it('모든 필수 필드가 누락된 경우 false를 반환하고 에러 메시지를 표시해야 한다', () => {
    const { result } = renderHook(() => useEventValidation());

    const invalidFormData = {
      title: '',
      date: '',
      startTime: '',
      endTime: '',
      startTimeError: null,
      endTimeError: null,
    };

    const isValid = result.current.validateEventForm(invalidFormData);
    expect(isValid).toBe(false);
    expect(mockEnqueueSnackbar).toHaveBeenCalledWith('필수 정보를 모두 입력해주세요.', {
      variant: 'error',
    });
  });
});
