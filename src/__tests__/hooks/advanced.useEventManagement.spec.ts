import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useEventManagement } from '../../hooks/useEventManagement';

// notistack의 useSnackbar를 모킹
const mockEnqueueSnackbar = vi.fn();
vi.mock('notistack', () => ({
  useSnackbar: () => ({
    enqueueSnackbar: mockEnqueueSnackbar,
  }),
}));

describe('useEventManagement', () => {
  const mockSaveEvent = vi.fn();
  const mockResetForm = vi.fn();

  const defaultFormData = {
    title: '테스트 일정',
    date: '2024-01-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '테스트 설명',
    location: '테스트 위치',
    category: '업무',
    isRepeating: false,
    repeatType: 'none' as const,
    repeatInterval: 1,
    repeatEndDate: null,
    notificationTime: 10,
    startTimeError: '',
    endTimeError: '',
    editingEvent: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('필수 정보가 누락된 경우 에러 토스트가 표시된다', async () => {
    const { result } = renderHook(() =>
      useEventManagement({
        events: [],
        saveEvent: mockSaveEvent,
        resetForm: mockResetForm,
        formData: {
          ...defaultFormData,
          title: '', // 제목 누락
          date: '', // 날짜 누락
        },
      })
    );

    await act(async () => {
      result.current.addOrUpdateEvent();
    });

    // 에러 토스트 메시지가 표시되어야 함
    expect(mockEnqueueSnackbar).toHaveBeenCalledWith('필수 정보를 모두 입력해주세요.', {
      variant: 'error',
    });

    // saveEvent가 호출되지 않았어야 함
    expect(mockSaveEvent).not.toHaveBeenCalled();
  });

  it('시간 에러가 있는 경우 에러 토스트가 표시된다', async () => {
    const { result } = renderHook(() =>
      useEventManagement({
        events: [],
        saveEvent: mockSaveEvent,
        resetForm: mockResetForm,
        formData: {
          ...defaultFormData,
          startTimeError: '시작 시간이 종료 시간보다 늦습니다',
          endTimeError: '종료 시간이 시작 시간보다 빠릅니다',
        },
      })
    );

    await act(async () => {
      result.current.addOrUpdateEvent();
    });

    // 에러 토스트 메시지가 표시되어야 함
    expect(mockEnqueueSnackbar).toHaveBeenCalledWith('시간 설정을 확인해주세요.', {
      variant: 'error',
    });

    // saveEvent가 호출되지 않았어야 함
    expect(mockSaveEvent).not.toHaveBeenCalled();
  });

  it('모든 필수 정보가 올바르게 입력된 경우 일정이 저장된다', async () => {
    const { result } = renderHook(() =>
      useEventManagement({
        events: [],
        saveEvent: mockSaveEvent,
        resetForm: mockResetForm,
        formData: defaultFormData,
      })
    );

    await act(async () => {
      result.current.addOrUpdateEvent();
    });

    // 에러 토스트가 표시되지 않아야 함
    expect(mockEnqueueSnackbar).not.toHaveBeenCalled();

    // saveEvent가 호출되어야 함
    expect(mockSaveEvent).toHaveBeenCalledWith({
      id: undefined,
      title: '테스트 일정',
      date: '2024-01-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '테스트 설명',
      location: '테스트 위치',
      category: '업무',
      repeat: {
        type: 'none',
        interval: 1,
        endDate: undefined,
      },
      notificationTime: 10,
    });

    // 폼이 리셋되어야 함
    expect(mockResetForm).toHaveBeenCalled();
  });
});
