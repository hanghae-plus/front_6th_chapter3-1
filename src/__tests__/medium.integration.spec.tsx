import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';

import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';
import { createMockEventHandler } from '../__mocks__/handlersUtils.ts';

const renderApp = () => {
  const theme = createTheme();
  return render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider>
        <App />
      </SnackbarProvider>
    </ThemeProvider>
  );
};

describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.

    const newEvent: Event = {
      id: 'new-test-event',
      title: '새로운 회의',
      date: '2025-08-21',
      startTime: '14:00',
      endTime: '15:00',
      description: '중요한 회의입니다',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    const mockHandler = createMockEventHandler([]);
    server.use(mockHandler.get(), mockHandler.post());

    const user = userEvent.setup();
    renderApp();

    // 필수 필드만 입력
    await user.type(await screen.findByLabelText('제목'), newEvent.title);
    await user.type(await screen.findByLabelText('날짜'), newEvent.date);
    await user.type(await screen.findByLabelText('시작 시간'), newEvent.startTime);
    await user.type(await screen.findByLabelText('종료 시간'), newEvent.endTime);
    await user.type(await screen.findByLabelText('설명'), newEvent.description);
    await user.type(await screen.findByLabelText('위치'), newEvent.location);
    await user.type(await screen.findByLabelText('카테고리'), newEvent.category);

    const eventSubmitButton = screen.getByTestId('event-submit-button');
    await user.click(eventSubmitButton);

    expect(await screen.findByText('일정이 추가되었습니다.')).toBeInTheDocument();

    const eventList = screen.getByTestId('event-list');
    expect(await within(eventList).findByText(newEvent.title)).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    const existingEvent: Event = {
      id: 'test-event-1',
      title: '기존 회의',
      date: '2025-08-21',
      startTime: '10:00',
      endTime: '11:00',
      description: '기존 설명',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    const updatedEvent: Event = {
      ...existingEvent,
      title: '수정된 회의',
      description: '수정된 설명',
      location: '회의실 C',
    };

    // 기존 이벤트가 있는 상태로 시작
    const mockHandler = createMockEventHandler([existingEvent]);
    server.use(mockHandler.get(), mockHandler.put());

    const user = userEvent.setup();
    renderApp();

    // 기존 이벤트가 표시되는지 확인
    const eventList = screen.getByTestId('event-list');
    expect(await within(eventList).findByText(existingEvent.title)).toBeInTheDocument();

    // 수정 버튼 클릭
    const editButton = await screen.findByLabelText('Edit event');
    await user.click(editButton);

    // 폼이 기존 값으로 채워졌는지 확인
    const titleField = await screen.findByLabelText('제목');
    expect(titleField).toHaveValue(existingEvent.title);

    // 값 수정
    await user.clear(titleField);
    await user.type(titleField, updatedEvent.title);

    const descriptionField = await screen.findByLabelText('설명');
    await user.clear(descriptionField);
    await user.type(descriptionField, updatedEvent.description);

    const locationField = await screen.findByLabelText('위치');
    await user.clear(locationField);
    await user.type(locationField, updatedEvent.location);

    // 수정 버튼 클릭
    const submitButton = screen.getByTestId('event-submit-button');
    expect(submitButton).toHaveTextContent('일정 수정');
    await user.click(submitButton);

    // 수정 완료 메시지 확인
    expect(await screen.findByText('일정이 수정되었습니다.')).toBeInTheDocument();

    // 수정된 내용이 목록에 반영되었는지 확인
    expect(await within(eventList).findByText(updatedEvent.title)).toBeInTheDocument();
    expect(await within(eventList).findByText(updatedEvent.description)).toBeInTheDocument();
    expect(await within(eventList).findByText(updatedEvent.location)).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    const existingEvent: Event = {
      id: 'test-event-1',
      title: '삭제될 회의',
      date: '2025-08-21',
      startTime: '10:00',
      endTime: '11:00',
      description: '삭제될 설명',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    // 기존 이벤트가 있는 상태로 시작
    const mockHandler = createMockEventHandler([existingEvent]);
    server.use(mockHandler.get(), mockHandler.delete());

    const user = userEvent.setup();
    renderApp();

    // 기존 이벤트가 표시되는지 확인
    const eventList = screen.getByTestId('event-list');
    expect(await within(eventList).findByText(existingEvent.title)).toBeInTheDocument();

    // 삭제 버튼 클릭
    const deleteButton = await screen.findByLabelText('Delete event');
    await user.click(deleteButton);

    // 삭제 완료 메시지 확인
    expect(await screen.findByText('일정이 삭제되었습니다.')).toBeInTheDocument();

    // 이벤트가 목록에서 사라졌는지 확인
    expect(within(eventList).queryByText(existingEvent.title)).not.toBeInTheDocument();
    expect(await within(eventList).findByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    const mockHandler = createMockEventHandler([]);
    server.use(mockHandler.get());

    renderApp();

    const monthView = await screen.findByTestId('month-view');
    expect(monthView).toBeInTheDocument();

    const calendarCells = monthView.querySelectorAll('td');
    calendarCells.forEach((cell) => {
      const eventBoxes = cell.querySelectorAll('.MuiBox-root');
      eventBoxes.forEach((box) => {
        expect(box.textContent).not.toMatch(/회의|미팅|약속/);
      });
    });
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    const testEvent: Event = {
      id: 'week-test-event',
      title: '주간 회의',
      date: '2025-08-21',
      startTime: '14:00',
      endTime: '15:00',
      description: '주간 회의입니다',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    const mockHandler = createMockEventHandler([testEvent]);
    server.use(mockHandler.get());

    renderApp();

    const monthView = await screen.findByTestId('month-view');
    expect(monthView).toBeInTheDocument();

    expect(await within(monthView).findByText(testEvent.title)).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    const mockHandler = createMockEventHandler([]);
    server.use(mockHandler.get());

    const user = userEvent.setup();
    renderApp();

    const viewSelect = await screen.findByLabelText('뷰 타입 선택');
    await user.click(viewSelect);

    await waitFor(async () => {
      const monthOption = screen.getByText('Month');
      expect(monthOption).toBeInTheDocument();
    });

    const monthOption = screen.getByText('Month');
    await user.click(monthOption);

    const monthView = await screen.findByTestId('month-view');
    expect(monthView).toBeInTheDocument();

    const calendarCells = monthView.querySelectorAll('td');
    calendarCells.forEach((cell) => {
      const eventBoxes = cell.querySelectorAll('.MuiBox-root');
      eventBoxes.forEach((box) => {
        expect(box.textContent).not.toMatch(/회의|미팅|약속/);
      });
    });
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    const testEvent: Event = {
      id: 'month-test-event',
      title: '월간 회의',
      date: '2025-08-21',
      startTime: '14:00',
      endTime: '15:00',
      description: '월간 회의입니다',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    const mockHandler = createMockEventHandler([testEvent]);
    server.use(mockHandler.get());

    const user = userEvent.setup();
    renderApp();

    const viewSelect = await screen.findByLabelText('뷰 타입 선택');
    await user.click(viewSelect);

    await waitFor(async () => {
      const monthOption = screen.getByText('Month');
      expect(monthOption).toBeInTheDocument();
    });

    const monthOption = screen.getByText('Month');
    await user.click(monthOption);

    const monthView = await screen.findByTestId('month-view');
    expect(monthView).toBeInTheDocument();

    expect(await within(monthView).findByText(testEvent.title)).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    const mockHandler = createMockEventHandler([]);
    server.use(mockHandler.get());

    const user = userEvent.setup();
    renderApp();

    const viewSelect = await screen.findByLabelText('뷰 타입 선택');
    await user.click(viewSelect);

    await waitFor(async () => {
      const monthOption = screen.getByText('Month');
      expect(monthOption).toBeInTheDocument();
    });

    const monthOption = screen.getByText('Month');
    await user.click(monthOption);

    const prevButton = await screen.findByLabelText('Previous');
    for (let i = 0; i < 7; i++) {
      await user.click(prevButton);
    }

    const monthView = await screen.findByTestId('month-view');
    expect(monthView).toBeInTheDocument();

    expect(await within(monthView).findByText('신정')).toBeInTheDocument();

    expect(await within(monthView).findByText('1')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const mockHandler = createMockEventHandler([]);
    server.use(mockHandler.get());

    const user = userEvent.setup();
    renderApp();

    const searchField = await screen.findByLabelText('일정 검색');
    await user.type(searchField, '존재하지 않는 일정');

    const eventList = screen.getByTestId('event-list');
    expect(await within(eventList).findByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const testEvents: Event[] = [
      {
        id: 'search-test-event-1',
        title: '팀 회의',
        date: '2025-08-21',
        startTime: '14:00',
        endTime: '15:00',
        description: '주간 팀 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
      {
        id: 'search-test-event-2',
        title: '개인 일정',
        date: '2025-08-21',
        startTime: '16:00',
        endTime: '17:00',
        description: '개인적인 일정',
        location: '카페',
        category: '개인',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ];

    const mockHandler = createMockEventHandler(testEvents);
    server.use(mockHandler.get());

    const user = userEvent.setup();
    renderApp();

    const searchField = await screen.findByLabelText('일정 검색');
    await user.type(searchField, '팀 회의');

    const eventList = screen.getByTestId('event-list');
    expect(await within(eventList).findByText('팀 회의')).toBeInTheDocument();
    expect(within(eventList).queryByText('개인 일정')).not.toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const testEvents: Event[] = [
      {
        id: 'search-test-event-1',
        title: '팀 회의',
        date: '2025-08-21',
        startTime: '14:00',
        endTime: '15:00',
        description: '주간 팀 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
      {
        id: 'search-test-event-2',
        title: '개인 일정',
        date: '2025-08-21',
        startTime: '16:00',
        endTime: '17:00',
        description: '개인적인 일정',
        location: '카페',
        category: '개인',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ];

    const mockHandler = createMockEventHandler(testEvents);
    server.use(mockHandler.get());

    const user = userEvent.setup();
    renderApp();

    const searchField = await screen.findByLabelText('일정 검색');
    await user.type(searchField, '팀 회의');

    const eventList = screen.getByTestId('event-list');
    expect(await within(eventList).findByText('팀 회의')).toBeInTheDocument();
    expect(within(eventList).queryByText('개인 일정')).not.toBeInTheDocument();

    await user.clear(searchField);

    expect(await within(eventList).findByText('팀 회의')).toBeInTheDocument();
    expect(await within(eventList).findByText('개인 일정')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    const existingEvent: Event = {
      id: 'overlap-test-event',
      title: '기존 회의',
      date: '2025-08-21',
      startTime: '14:00',
      endTime: '15:00',
      description: '기존 회의입니다',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    const mockHandler = createMockEventHandler([existingEvent]);
    server.use(mockHandler.get(), mockHandler.post());

    const user = userEvent.setup();
    renderApp();

    await user.type(await screen.findByLabelText('제목'), '새로운 회의');
    await user.type(await screen.findByLabelText('날짜'), '2025-08-21');
    await user.type(await screen.findByLabelText('시작 시간'), '14:30');
    await user.type(await screen.findByLabelText('종료 시간'), '15:30');
    await user.type(await screen.findByLabelText('설명'), '겹치는 회의');
    await user.type(await screen.findByLabelText('위치'), '회의실 B');
    await user.type(await screen.findByLabelText('카테고리'), '업무');

    const eventSubmitButton = screen.getByTestId('event-submit-button');
    await user.click(eventSubmitButton);

    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
    expect(await screen.findByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
    expect(await screen.findByText(/기존 회의.*2025-08-21 14:00-15:00/)).toBeInTheDocument();

    expect(await screen.findByText('취소')).toBeInTheDocument();
    expect(await screen.findByText('계속 진행')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    const existingEvents: Event[] = [
      {
        id: 'overlap-test-event-1',
        title: '첫 번째 회의',
        date: '2025-08-21',
        startTime: '14:00',
        endTime: '15:00',
        description: '첫 번째 회의입니다',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
      {
        id: 'overlap-test-event-2',
        title: '두 번째 회의',
        date: '2025-08-21',
        startTime: '16:00',
        endTime: '17:00',
        description: '두 번째 회의입니다',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ];

    const mockHandler = createMockEventHandler(existingEvents);
    server.use(mockHandler.get(), mockHandler.put());

    const user = userEvent.setup();
    renderApp();

    const editButtons = await screen.findAllByLabelText('Edit event');
    await user.click(editButtons[0]);

    const startTimeField = await screen.findByLabelText('시작 시간');
    const endTimeField = await screen.findByLabelText('종료 시간');

    await user.clear(startTimeField);
    await user.type(startTimeField, '16:30');
    await user.clear(endTimeField);
    await user.type(endTimeField, '17:30');

    const submitButton = screen.getByTestId('event-submit-button');
    await user.click(submitButton);

    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
    expect(await screen.findByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
    expect(await screen.findByText(/두 번째 회의.*2025-08-21 16:00-17:00/)).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  const now = new Date();
  const eventTime = new Date(now.getTime() + 10 * 60 * 1000);

  const testEvent: Event = {
    id: 'notification-test-event',
    title: '알림 테스트 회의',
    date: eventTime.toISOString().split('T')[0],
    startTime: eventTime.toTimeString().slice(0, 5),
    endTime: new Date(eventTime.getTime() + 60 * 60 * 1000).toTimeString().slice(0, 5),
    description: '알림 테스트용 회의',
    location: '테스트 룸',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  };

  const mockHandler = createMockEventHandler([testEvent]);
  server.use(mockHandler.get());

  renderApp();

  const eventList = screen.getByTestId('event-list');

  await waitFor(
    () => {
      const notificationIcon = within(eventList).queryByTestId('notification-icon');
      const alertMessage = screen.queryByText(/10분 전/);

      expect(notificationIcon || alertMessage).toBeTruthy();
    },
    { timeout: 3000 }
  );

  expect(await within(eventList).findByText('알림 테스트 회의')).toBeInTheDocument();
});
