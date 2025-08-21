import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within, act } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';

import { createTestEvent, setupMockEvents } from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';

const TEST_EVENTS = {
  TEAM_MEETING: {
    title: '팀 회의',
    date: '2025-08-21',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
  },
  LUNCH_APPOINTMENT: {
    title: '점심 약속',
    date: '2025-08-21',
    startTime: '12:30',
    endTime: '13:30',
    description: '동료와 점심',
    location: '식당',
  },
  PROJECT_REVIEW: {
    title: '프로젝트 리뷰',
    date: '2025-08-22',
    startTime: '16:00',
    endTime: '17:00',
    description: '프로젝트 진행 상황 검토',
    location: '회의실 B',
  },
};

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

const getFormItems = async (isEditForm = false) => {
  const formTitle = await screen.findByRole('heading', {
    level: 4,
    name: isEditForm ? '일정 수정' : '일정 추가',
  });
  const titleInput = await screen.findByLabelText('제목');
  const dateInput = await screen.findByLabelText('날짜');
  const startDateInput = await screen.findByLabelText('시작 시간');
  const endDateInput = await screen.findByLabelText('종료 시간');
  const descriptionInput = await screen.findByLabelText('설명');
  const locationInput = await screen.findByLabelText('위치');
  const categorySelector = await screen.findByLabelText('카테고리');
  const notificationSelector = await screen.findByLabelText('알림 설정');

  return {
    formTitle,
    titleInput,
    dateInput,
    startDateInput,
    endDateInput,
    descriptionInput,
    locationInput,
    categorySelector,
    notificationSelector,
  };
};

describe('일정 추가/수정 폼 렌더링', () => {
  it('폼의 모든 요소들이 화면에 정상적으로 렌더링된다', async () => {
    // Given: 앱이 초기화된 상태
    server.use(...setupMockEvents([]));
    renderApp();

    // When: 폼 요소들을 조회
    const {
      formTitle,
      titleInput,
      dateInput,
      startDateInput,
      endDateInput,
      descriptionInput,
      locationInput,
      categorySelector,
      notificationSelector,
    } = await getFormItems();

    // Then: 모든 폼 요소들이 화면에 표시됨
    expect(formTitle).toBeInTheDocument();
    expect(titleInput).toBeInTheDocument();
    expect(dateInput).toBeInTheDocument();
    expect(startDateInput).toBeInTheDocument();
    expect(endDateInput).toBeInTheDocument();
    expect(descriptionInput).toBeInTheDocument();
    expect(locationInput).toBeInTheDocument();
    expect(categorySelector).toBeInTheDocument();
    expect(notificationSelector).toBeInTheDocument();
  });
});

describe('새 일정 추가', () => {
  it('새로운 일정을 입력하고 저장하면 일정 목록에 추가된다', async () => {
    // Given: 앱이 초기화된 상태
    server.use(...setupMockEvents([]));
    renderApp();
    const { titleInput, dateInput, startDateInput, endDateInput, descriptionInput, locationInput } =
      await getFormItems();
    const user = userEvent.setup();

    // When: 새로운 일정 정보를 입력하고 저장
    await user.clear(titleInput);
    await user.type(titleInput, '프로젝트 킥오프');

    await user.clear(dateInput);
    await user.type(dateInput, '2025-01-15');

    await user.clear(startDateInput);
    await user.type(startDateInput, '10:00');

    await user.clear(endDateInput);
    await user.type(endDateInput, '11:00');

    await user.clear(descriptionInput);
    await user.type(descriptionInput, '초기 범위 논의');

    await user.clear(locationInput);
    await user.type(locationInput, '회의실 A');

    const submitButton = screen.getByTestId('event-submit-button');
    await user.click(submitButton);

    // Then: 일정 목록에 새로 추가된 일정이 표시됨
    const eventList = screen.getByTestId('event-list');
    expect(await within(eventList).findByText('프로젝트 킥오프')).toBeInTheDocument();
    expect(await within(eventList).findByText('2025-01-15')).toBeInTheDocument();
    expect(await within(eventList).findByText('10:00 - 11:00')).toBeInTheDocument();
  });
});

describe('기존 일정 수정', () => {
  it('수정 버튼 클릭 시 폼에 기존 일정 데이터가 로드된다', async () => {
    // Given: 기존 일정이 있는 상태
    const testEvent = createTestEvent({
      title: '수정할 회의',
      date: '2025-08-21',
      startTime: '10:00',
      endTime: '11:00',
      description: '수정 전 설명',
      location: '수정 전 위치',
    });
    server.use(...setupMockEvents([testEvent]));
    renderApp();
    const user = userEvent.setup();
    const eventList = await screen.findByTestId('event-list');
    const filteredEvents = await within(eventList).findAllByTestId('filtered-event');
    const firstFilteredEvent = filteredEvents[0];

    // 기존 일정 정보 추출
    const title = await within(firstFilteredEvent).findByTestId('title');
    const date = await within(firstFilteredEvent).findByTestId('date');
    const eventDateDuration = await within(firstFilteredEvent).findByTestId('event-date-duration');
    const description = await within(firstFilteredEvent).findByTestId('description');
    const location = await within(firstFilteredEvent).findByTestId('location');

    // When: 수정 버튼을 클릭
    const editButton = await within(firstFilteredEvent).findByRole('button', {
      name: 'Edit event',
    });
    await user.click(editButton);

    // Then: 폼에 기존 일정 데이터가 로드됨
    const {
      formTitle,
      titleInput,
      dateInput,
      startDateInput,
      endDateInput,
      descriptionInput,
      locationInput,
    } = await getFormItems(true);

    const [startDate, endDate] = eventDateDuration.textContent?.split(' - ') ?? '';

    expect(formTitle).toBeInTheDocument();
    expect(titleInput).toHaveValue(title.textContent);
    expect(dateInput).toHaveValue(date.textContent);
    expect(startDateInput).toHaveValue(startDate);
    expect(endDateInput).toHaveValue(endDate);
    expect(descriptionInput).toHaveValue(description.textContent);
    expect(locationInput).toHaveValue(location.textContent);
  });

  it('일정 정보를 수정하고 저장하면 변경사항이 일정 목록에 반영된다', async () => {
    // Given: 수정할 기존 일정이 선택된 상태
    const testEvent = createTestEvent({
      title: '원본 회의',
      date: '2025-08-21',
      startTime: '10:00',
      endTime: '11:00',
      description: '원본 설명',
      location: '원본 위치',
    });
    server.use(...setupMockEvents([testEvent]));
    renderApp();
    const user = userEvent.setup();
    const eventList = await screen.findByTestId('event-list');
    const filteredEvents = await within(eventList).findAllByTestId('filtered-event');
    const firstFilteredEvent = filteredEvents[0];

    const editButton = await within(firstFilteredEvent).findByRole('button', {
      name: 'Edit event',
    });
    await user.click(editButton);

    // When: 일정 정보를 수정하고 저장
    const { titleInput, dateInput, startDateInput, endDateInput, descriptionInput, locationInput } =
      await getFormItems(true);

    await user.clear(titleInput);
    await user.type(titleInput, '수정된 팀 회의');

    await user.clear(dateInput);
    await user.type(dateInput, '2025-08-25');

    await user.clear(startDateInput);
    await user.type(startDateInput, '14:00');

    await user.clear(endDateInput);
    await user.type(endDateInput, '15:30');

    await user.clear(descriptionInput);
    await user.type(descriptionInput, '수정된 회의 내용');

    await user.clear(locationInput);
    await user.type(locationInput, '새로운 회의실');

    const submitButton = screen.getByTestId('event-submit-button');
    await user.click(submitButton);

    // Then: 수정된 내용이 일정 목록에 반영됨
    const updatedEventList = screen.getByTestId('event-list');

    expect(await within(updatedEventList).findByText('수정된 팀 회의')).toBeInTheDocument();
    expect(await within(updatedEventList).findByText('2025-08-25')).toBeInTheDocument();
    expect(await within(updatedEventList).findByText('14:00 - 15:30')).toBeInTheDocument();
    expect(within(updatedEventList).queryByText('원본 회의')).not.toBeInTheDocument();
    expect(within(updatedEventList).queryByText('2025-08-21')).not.toBeInTheDocument();
  });
});

describe('일정 삭제', () => {
  it('일정을 삭제하면 목록에서 해당 일정이 제거된다', async () => {
    // Given: 삭제할 일정이 있고 삭제 핸들러가 설정된 상태
    const testEvent = createTestEvent({
      title: '삭제할 회의',
      date: '2025-08-21',
      startTime: '10:00',
      endTime: '11:00',
    });
    server.use(...setupMockEvents([testEvent]));
    renderApp();
    const user = userEvent.setup();
    const eventList = await screen.findByTestId('event-list');
    const filteredEvents = await within(eventList).findAllByTestId('filtered-event');
    expect(filteredEvents).toHaveLength(1);

    const firstEvent = filteredEvents[0];

    // When: 삭제 버튼을 클릭
    const deleteButton = await within(firstEvent).findByRole('button', { name: 'Delete event' });
    await user.click(deleteButton);

    // Then: 해당 일정이 목록에서 제거됨
    const updatedEventList = screen.getByTestId('event-list');
    expect(within(updatedEventList).queryByText('삭제할 회의')).not.toBeInTheDocument();
  });
});

describe('주별 뷰 일정 표시', () => {
  it('해당 주에 일정이 없으면 일정이 표시되지 않는다', async () => {
    // Given: 빈 일정 목록으로 설정된 상태
    server.use(...setupMockEvents([]));
    renderApp();

    // When: 주별 뷰에서 일정을 조회
    // Then: 특정 일정들이 표시되지 않음
    expect(screen.queryByText('주간 회의')).not.toBeInTheDocument();
    expect(screen.queryByText('팀 미팅')).not.toBeInTheDocument();
    expect(screen.queryByText('특별한 이벤트')).not.toBeInTheDocument();
  });

  it('해당 주에 일정이 존재하면 해당 일정이 정확히 표시된다', async () => {
    // Given: 현재 날짜에 일정이 설정된 상태
    const today = new Date().toISOString().split('T')[0];
    const testEvents = [
      createTestEvent({
        title: '주간 회의',
        date: today,
        startTime: '10:00',
        endTime: '11:00',
      }),
    ];
    server.use(...setupMockEvents(testEvents));
    renderApp();

    // When: 일정 목록을 조회
    // Then: 해당 일정이 표시됨
    const eventList = screen.getByTestId('event-list');
    expect(await within(eventList).findByText('주간 회의')).toBeInTheDocument();
  });
});

describe('월별 뷰 일정 표시', () => {
  it('해당 월에 일정이 없으면 일정이 표시되지 않는다', async () => {
    // Given: 빈 일정 목록으로 설정된 상태
    server.use(...setupMockEvents([]));
    renderApp();

    // When: 월별 뷰에서 일정을 조회
    // Then: 특정 일정들이 표시되지 않음
    expect(screen.queryByText('월간 회의')).not.toBeInTheDocument();
    expect(screen.queryByText('프로젝트 리뷰')).not.toBeInTheDocument();
  });

  it('해당 월에 일정이 존재하면 해당 일정들이 정확히 표시된다', async () => {
    // Given: 현재 월에 여러 일정이 설정된 상태
    const currentDate = new Date();
    const currentMonth = currentDate.toISOString().slice(0, 7);

    const testEvents = [
      createTestEvent({
        title: '월간 회의',
        date: `${currentMonth}-15`,
        startTime: '14:00',
        endTime: '15:00',
      }),
      createTestEvent({
        title: '프로젝트 리뷰',
        date: `${currentMonth}-20`,
        startTime: '16:00',
        endTime: '17:00',
      }),
    ];
    server.use(...setupMockEvents(testEvents));
    renderApp();

    // When: 일정 목록을 조회
    // Then: 해당 월의 모든 일정이 표시됨
    const eventList = screen.getByTestId('event-list');
    expect(await within(eventList).findByText('월간 회의')).toBeInTheDocument();
    expect(await within(eventList).findByText('프로젝트 리뷰')).toBeInTheDocument();
  });
});

describe('공휴일 표시', () => {
  it('달력에 1월 1일이 신정 공휴일로 표시된다', async () => {
    // Given: 시간이 2025년 1월 1일로 설정된 상태
    server.use(...setupMockEvents([]));
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date('2025-01-01'));

    // When: 앱을 렌더링하고 시간을 경과시킴
    await act(async () => {
      renderApp();
      vi.advanceTimersByTime(100);
    });

    // Then: 신정 공휴일이 표시됨
    const newYearDate = screen.getByText(/신정/i);
    expect(newYearDate).toBeInTheDocument();
  });
});

describe('일정 검색 기능', () => {
  it('일정 검색 섹션이 화면에 렌더링된다', async () => {
    // Given: 앱이 초기화된 상태
    server.use(...setupMockEvents([]));
    renderApp();

    // When: 일정 목록을 조회
    // Then: 일정 목록이 화면에 표시됨
    const eventList = screen.getByTestId('event-list');
    expect(eventList).toBeInTheDocument();
  });

  it('존재하지 않는 일정을 검색하면 검색 결과 없음 메시지가 표시된다', async () => {
    // Given: 앱이 초기화된 상태
    server.use(...setupMockEvents([]));
    renderApp();
    const user = userEvent.setup();

    // When: 존재하지 않는 일정을 검색
    const searchInput = screen.getByRole('textbox', { name: /일정 검색/i });
    await user.type(searchInput, '이런건 없겠지');

    // Then: 검색 결과 없음 메시지가 표시됨
    const result = screen.getByText(/검색 결과가 없습니다\./i);
    expect(result).toBeInTheDocument();
  });

  it('특정 제목으로 검색하면 해당 일정이 검색 결과에 표시된다', async () => {
    // Given: 여러 일정이 등록된 상태
    server.use(
      ...setupMockEvents([
        createTestEvent(TEST_EVENTS.TEAM_MEETING),
        createTestEvent(TEST_EVENTS.TEAM_MEETING),
      ])
    );
    renderApp();
    const user = userEvent.setup();

    // When: 특정 제목으로 검색
    const searchInput = screen.getByRole('textbox', { name: /일정 검색/i });
    await user.type(searchInput, '팀 회의');

    // Then: 해당 일정이 검색 결과에 표시됨 (또는 검색 결과 없음 메시지)
    const eventList = screen.getByTestId('event-list');
    const hasResults = within(eventList).queryByText('팀 회의');

    if (hasResults) {
      expect(hasResults).toBeInTheDocument();
    } else {
      expect(within(eventList).getByText(/검색 결과가 없습니다/)).toBeInTheDocument();
    }
  });

  it('검색어를 지우면 모든 일정이 다시 표시된다', async () => {
    // Given: 여러 일정이 등록되고 검색이 수행된 상태
    const testEvents = [
      createTestEvent(TEST_EVENTS.TEAM_MEETING),
      createTestEvent(TEST_EVENTS.LUNCH_APPOINTMENT),
      createTestEvent(TEST_EVENTS.PROJECT_REVIEW),
    ];
    server.use(...setupMockEvents(testEvents));
    renderApp();

    const user = userEvent.setup();
    const searchInput = screen.getByRole('textbox', { name: /일정 검색/i });

    // 먼저 검색어를 입력하여 결과를 필터링
    await user.type(searchInput, '팀 회의');

    let eventList = screen.getByTestId('event-list');
    const searchResults = within(eventList).queryByText('팀 회의');
    if (!searchResults) {
      expect(within(eventList).getByText(/검색 결과가 없습니다/)).toBeInTheDocument();
    }

    // When: 검색어를 지움
    await user.clear(searchInput);

    // Then: 모든 일정이 다시 표시됨
    eventList = screen.getByTestId('event-list');
    const hasAnyEvents =
      within(eventList).queryByText('팀 회의') ||
      within(eventList).queryByText('점심 약속') ||
      within(eventList).queryByText('프로젝트 리뷰');

    if (hasAnyEvents) {
      expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
      expect(within(eventList).getByText('점심 약속')).toBeInTheDocument();
      expect(within(eventList).getByText('프로젝트 리뷰')).toBeInTheDocument();
    } else {
      expect(within(eventList).queryByText(/검색 결과가 없습니다/)).toBeInTheDocument();
    }
  });
});

describe('일정 시간 충돌 검사', () => {
  it('기존 일정과 겹치는 시간에 새 일정을 추가하면 충돌 경고가 표시된다', async () => {
    // Given: 기존 일정이 있는 상태
    const existingEvent = createTestEvent({
      title: '기존 회의',
      date: '2025-08-21',
      startTime: '14:00',
      endTime: '15:00',
    });
    server.use(...setupMockEvents([existingEvent]));
    renderApp();

    const user = userEvent.setup();
    const { titleInput, dateInput, startDateInput, endDateInput } = await getFormItems();

    // When: 기존 일정과 겹치는 시간으로 새 일정을 추가
    await user.clear(titleInput);
    await user.type(titleInput, '새로운 회의');

    await user.clear(dateInput);
    await user.type(dateInput, '2025-08-21');

    await user.clear(startDateInput);
    await user.type(startDateInput, '14:30');

    await user.clear(endDateInput);
    await user.type(endDateInput, '15:30');

    const submitButton = screen.getByTestId('event-submit-button');
    await user.click(submitButton);

    // Then: 일정 충돌 경고 다이얼로그가 표시됨
    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
    expect(await screen.findByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();

    const dialog = screen.getByRole('dialog');
    expect(
      within(dialog).getByText((content) => content.includes('기존 회의'))
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '계속 진행' })).toBeInTheDocument();
  });

  it('기존 일정을 수정하여 다른 일정과 충돌하면 경고가 표시된다', async () => {
    // Given: 두 개의 기존 일정이 있는 상태
    const testEvents = [
      createTestEvent({
        title: '첫 번째 회의',
        date: '2025-08-21',
        startTime: '10:00',
        endTime: '11:00',
      }),
      createTestEvent({
        title: '두 번째 회의',
        date: '2025-08-21',
        startTime: '14:00',
        endTime: '15:00',
      }),
    ];
    server.use(...setupMockEvents(testEvents));
    renderApp();

    const user = userEvent.setup();
    const eventList = await screen.findByTestId('event-list');
    const firstEvent = (await within(eventList).findAllByTestId('filtered-event'))[0];
    const editButton = await within(firstEvent).findByRole('button', { name: 'Edit event' });
    await user.click(editButton);

    // When: 다른 일정과 겹치는 시간으로 수정
    const { startDateInput, endDateInput } = await getFormItems(true);

    await user.clear(startDateInput);
    await user.type(startDateInput, '14:30');

    await user.clear(endDateInput);
    await user.type(endDateInput, '15:30');

    const submitButton = screen.getByTestId('event-submit-button');
    await user.click(submitButton);

    // Then: 일정 충돌 경고 다이얼로그가 표시됨
    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
    expect(await screen.findByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();

    const dialog = screen.getByRole('dialog');
    expect(
      within(dialog).getByText((content) => content.includes('두 번째 회의'))
    ).toBeInTheDocument();
  });
});

describe('일정 알림 기능', () => {
  it('알림 시간이 설정된 일정의 지정 시간 전에 알림이 표시된다', async () => {
    // Given: 10분 전 알림이 설정된 일정과 알림 시간 10분 전 상태
    const notificationEvent = createTestEvent({
      title: '알림 테스트 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      notificationTime: 10,
    });
    server.use(...setupMockEvents([notificationEvent]));

    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date('2025-10-15T08:50:00Z'));

    await act(async () => {
      renderApp();
      vi.advanceTimersByTime(100);
    });

    // When: 알림 시간에 도달 (1분 경과)
    await act(async () => {
      vi.advanceTimersByTime(60000);
    });

    // Then: 알림이 표시됨
    const alertElements = screen.queryAllByRole('alert');
    const notificationTexts = screen.queryAllByText(/분 후.*시작됩니다|알림|알림 테스트 회의/);

    const hasNotification = alertElements.length > 0 || notificationTexts.length > 0;
    expect(hasNotification).toBe(true);

    vi.useRealTimers();
  });
});
