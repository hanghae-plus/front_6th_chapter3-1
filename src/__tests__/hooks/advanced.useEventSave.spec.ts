import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useEventSave } from '../../hooks/useEventSave';
import { findOverlappingEvents } from '../../utils/eventOverlap';
import { validateEventData } from '../../utils/eventUtils';

// Mock 함수들을 파일 상단에 선언
const mockEnqueueSnackbar = vi.fn();
const mockSaveEvent = vi.fn();
const mockResetForm = vi.fn();
const mockOpenOverlapDialog = vi.fn();

// notistack mock 수정
vi.mock('notistack', () => ({
  useSnackbar: () => ({ enqueueSnackbar: mockEnqueueSnackbar }),
}));

vi.mock('../../utils/eventUtils', () => ({
  validateEventData: vi.fn(() => null),
}));

vi.mock('../../utils/eventOverlap', () => ({
  findOverlappingEvents: vi.fn(() => []),
}));

// 테스트용 기본 데이터
const mock = {
  title: '테스트 회의',
  date: '2025-10-15',
  startTime: '09:00',
  endTime: '10:00',
  description: '테스트 설명',
  location: '회의실 A',
  category: '업무',
  isRepeating: false,
  repeatType: 'none',
  repeatInterval: 0,
  repeatEndDate: '',
  notificationTime: 10,
  startTimeError: null,
  endTimeError: null,
  editingEvent: null,
  events: [],
  saveEvent: mockSaveEvent,
  resetForm: mockResetForm,
  openOverlapDialog: mockOpenOverlapDialog,
};

describe('useEventSave: 이벤트 저장', () => {
  beforeEach(() => {
    // 각 테스트 전에 mock 초기화
    vi.clearAllMocks();
  });

  it('createEventData가 올바른 이벤트 데이터를 만들어야 한다', () => {
    const { result } = renderHook(() => useEventSave(mock));

    const eventData = result.current.createEventData();

    // 입력한 데이터가 제대로 들어갔는지 확인
    expect(eventData.title).toBe('테스트 회의');
    expect(eventData.date).toBe('2025-10-15');
    expect(eventData.startTime).toBe('09:00');
    expect(eventData.endTime).toBe('10:00');
    expect(eventData.description).toBe('테스트 설명');
    expect(eventData.location).toBe('회의실 A');
    expect(eventData.category).toBe('업무');
    expect(eventData.notificationTime).toBe(10);
  });

  it('handleSaveEvent로 데이터를 저장한 후 form을 초기화한다', async () => {
    const { result } = renderHook(() => useEventSave(mock));

    await act(async () => {
      await result.current.handleSaveEvent();
    });

    // 저장, 초기화 함수가 호출되었는지 확인
    expect(mockSaveEvent).toHaveBeenCalled();
    expect(mockResetForm).toHaveBeenCalled();
  });

  it('중복 이벤트가 있으면 오버랩 다이얼로그를 열어야 한다', async () => {
    // 중복 이벤트가 있다고 설정
    const overlappingEvents = [
      {
        id: '1',
        title: '중복 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none' as const, interval: 0 },
        notificationTime: 10,
      },
    ];

    // 중복 이벤트 검사
    vi.mocked(findOverlappingEvents).mockReturnValue(overlappingEvents);

    const { result } = renderHook(() => useEventSave(mock));

    await act(async () => {
      await result.current.handleSaveEvent();
    });

    // 오버랩 다이얼로그가 열렸는지 확인
    expect(mockOpenOverlapDialog).toHaveBeenCalledWith(overlappingEvents);

    // 중복이 있으면 저장하지 않음
    expect(mockSaveEvent).not.toHaveBeenCalled();
    expect(mockResetForm).not.toHaveBeenCalled();
  });

  it('유효성 검사 실패시 에러 스낵바를 표시하고 저장하지 않아야 한다', async () => {
    // 유효성 검사 실패로 설정
    vi.mocked(validateEventData).mockReturnValue('필수 정보를 모두 입력해주세요.');

    const { result } = renderHook(() => useEventSave(mock));

    await act(async () => {
      await result.current.handleSaveEvent();
    });

    // 에러 스낵바가 표시되는지 확인
    expect(mockEnqueueSnackbar).toHaveBeenCalledWith('필수 정보를 모두 입력해주세요.', {
      variant: 'error',
    });

    // 저장하지 않음
    expect(mockSaveEvent).not.toHaveBeenCalled();
    expect(mockResetForm).not.toHaveBeenCalled();
  });
});
