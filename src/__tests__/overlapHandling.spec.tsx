import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, waitFor, within } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
// import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import { setupMockHandlerCreation, setupMockHandlerUpdating } from '../__mocks__/handlersUtils';
import App from '../App';
// import { server } from '../setupTests';
import { Event } from '../types';

const setup = (element: ReactElement) => {
  const theme = createTheme();
  const user = userEvent.setup();

  // ? Medium: 여기서 Provider로 묶어주는 동작은 의미있을까요? 있다면 어떤 의미일까요?
  return {
    ...render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>{element}</SnackbarProvider>
      </ThemeProvider>
    ),
    user,
  };
};

const saveSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'>
) => {
  const { title, date, startTime, endTime, location, description, category } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.click(screen.getByLabelText('카테고리'));
  await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
  await user.click(screen.getByRole('option', { name: `${category}-option` }));

  await user.click(screen.getByTestId('event-submit-button'));
};

describe('Event Overlap Handling', () => {
  it('동일 시간대 이벤트 생성 시 OverlapDialog가 정확한 충돌 목록을 표시한다', async () => {
    const existingEvent: Event = {
      id: '1',
      title: '기존 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const overlappingNewEvent = {
      title: '새로운 회의',
      date: '2025-10-15',
      startTime: '09:30',
      endTime: '10:30',
      location: '회의실 B',
      description: '새 팀 미팅',
      category: '업무',
    };

    setupMockHandlerCreation([existingEvent]);

    const { user } = setup(<App />);

    await saveSchedule(user, overlappingNewEvent);

    expect(screen.queryByText('일정과 겹칩니다')).not.toBeInTheDocument();
  });

  it('OverlapDialog에서 "취소" 선택 시 새 이벤트가 저장되지 않고 폼 상태가 유지된다', async () => {
    // Arrange
    const existingEvent: Event = {
      id: '1',
      title: '기존 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    setupMockHandlerCreation([existingEvent]);
    const { user } = setup(<App />);

    const overlappingEvent = {
      title: '새로운 회의',
      date: '2025-10-15',
      startTime: '09:30',
      endTime: '10:30',
      location: '회의실 B',
      description: '새 팀 미팅',
      category: '업무',
    };

    await saveSchedule(user, overlappingEvent);

    // Act: "취소" 버튼 클릭
    const cancelButton = screen.getByText('취소');
    await user.click(cancelButton);

    // Assert: 다이얼로그 닫힘
    await waitFor(() => {
      expect(screen.queryByText('일정 겹침 경고')).not.toBeInTheDocument();
    });

    // 이벤트가 저장되지 않음 (여전히 1개)
    await waitFor(() => {
      expect(screen.queryByText('검색 결과가 없습니다')).not.toBeInTheDocument();
    });

    // 기존 이벤트만 존재
    expect(document.body.textContent).toContain('기존 회의');
    expect(document.body.textContent).not.toContain('새로운 회의');

    // 폼 상태가 유지됨
    expect(screen.getByDisplayValue('새로운 회의')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2025-10-15')).toBeInTheDocument();
  });

  it('OverlapDialog에서 "계속 진행" 선택 시 충돌에도 불구하고 이벤트가 저장되고 폼이 리셋된다', async () => {
    // Arrange
    const existingEvent: Event = {
      id: '1',
      title: '기존 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    setupMockHandlerCreation([existingEvent]);
    const { user } = setup(<App />);

    const overlappingEvent = {
      title: '새로운 회의',
      date: '2025-10-15',
      startTime: '09:30',
      endTime: '10:30',
      location: '회의실 B',
      description: '새 팀 미팅',
      category: '업무',
    };

    await saveSchedule(user, overlappingEvent);

    // Act: "계속 진행" 버튼 클릭
    const continueButton = screen.getByText('계속 진행');
    await user.click(continueButton);

    // Assert: 성공 토스트 메시지
    await screen.findByText('일정이 추가되었습니다.');

    // 다이얼로그 닫힘
    await waitFor(() => {
      expect(screen.queryByText('일정 겹침 경고')).not.toBeInTheDocument();
    });

    // 두 이벤트 모두 존재
    expect(document.body.textContent).toContain('기존 회의');
    expect(document.body.textContent).toContain('새로운 회의');

    // 폼이 리셋됨
    expect(screen.getByDisplayValue('')).toBeInTheDocument(); // 제목 필드가 빔
  });

  it('여러 이벤트와 동시 충돌 시 모든 충돌 이벤트가 다이얼로그에 나열된다', async () => {
    // Arrange: 3개의 기존 이벤트 설정
    const existingEvents: Array<Event> = [
      {
        id: '1',
        title: '첫 번째 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '팀 미팅 1',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '두 번째 회의',
        date: '2025-10-15',
        startTime: '09:30',
        endTime: '10:30',
        description: '팀 미팅 2',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '세 번째 회의',
        date: '2025-10-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '팀 미팅 3',
        location: '회의실 C',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    setupMockHandlerCreation(existingEvents);
    const { user } = setup(<App />);

    // Act: 모든 이벤트와 겹치는 새 이벤트 생성 (08:30-11:30)
    const multiOverlappingEvent = {
      title: '대형 회의',
      date: '2025-10-15',
      startTime: '08:30',
      endTime: '11:30',
      location: '대회의실',
      description: '전체 미팅',
      category: '업무',
    };

    await saveSchedule(user, multiOverlappingEvent);

    // Assert: 모든 충돌 이벤트가 표시됨
    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(screen.getByText('첫 번째 회의 (2025-10-15 09:00-10:00)')).toBeInTheDocument();
    expect(screen.getByText('두 번째 회의 (2025-10-15 09:30-10:30)')).toBeInTheDocument();
    expect(screen.getByText('세 번째 회의 (2025-10-15 10:00-11:00)')).toBeInTheDocument();
  });

  it('이벤트 수정 시 다른 이벤트와 충돌하면 적절한 경고가 표시된다', async () => {
    setupMockHandlerUpdating();
    const { user } = setup(<App />);

    await waitFor(() => {
      expect(screen.queryByText('검색 결과가 없습니다')).not.toBeInTheDocument();
    });

    // Act: 첫 번째 이벤트 편집하여 두 번째 이벤트와 겹치게 만들기
    const eventContainer = document.querySelector('[data-testid="event-list"]');
    const editButton = eventContainer?.querySelector('[aria-label="Edit event"]');
    await user.click(editButton as Element);

    // 시간을 10:30-11:30으로 변경 (기존 회의와 겹침)
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');

    await user.clear(startTimeInput);
    await user.type(startTimeInput, '10:30');
    await user.clear(endTimeInput);
    await user.type(endTimeInput, '11:30');

    // 수정 제출
    await user.click(screen.getByTestId('event-submit-button'));

    // Assert: 충돌 경고 표시
    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(screen.getByText('기존 회의2 (2025-10-15 11:00-12:00)')).toBeInTheDocument();
  });
});
