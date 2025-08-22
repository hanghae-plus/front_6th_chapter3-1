import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { EventForm } from '../../components/EventForm';
import { useEventForm } from '../../hooks/useEventForm';

// useEventForm 훅의 반환값을 모킹합니다.
vi.mock('../../hooks/useEventForm', () => ({
  useEventForm: vi.fn(),
}));

describe('EventForm', () => {
  it('컴포넌트가 "일정 추가" 모드로 올바르게 렌더링된다', () => {
    // 모킹된 훅이 반환할 기본 상태를 설정합니다.
    (useEventForm as ReturnType<typeof vi.fn>).mockReturnValue({
      title: '',
      setTitle: vi.fn(),
      date: '',
      setDate: vi.fn(),
      startTime: '',
      endTime: '',
      description: '',
      setDescription: vi.fn(),
      location: '',
      setLocation: vi.fn(),
      category: '업무',
      setCategory: vi.fn(),
      isRepeating: false,
      setIsRepeating: vi.fn(),
      notificationTime: 10,
      setNotificationTime: vi.fn(),
      startTimeError: null,
      endTimeError: null,
      editingEvent: null, // '일정 추가' 모드를 위해 null로 설정
      handleStartTimeChange: vi.fn(),
      handleEndTimeChange: vi.fn(),
    });

    render(<EventForm formState={useEventForm()} onSubmit={vi.fn()} />);

    // "일정 추가" 텍스트를 가진 heading이 있는지 확인합니다.
    expect(screen.getByRole('heading', { name: '일정 추가' })).toBeInTheDocument();
  });
});
