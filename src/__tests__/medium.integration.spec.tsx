import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { vi } from 'vitest';

import App from '../App';
import { createDefaultEvents, setupMockHandler } from '../__mocks__/handlersUtils';

function renderWithProviders() {
  const theme = createTheme();
  return render(
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <CssBaseline />
        <App />
      </SnackbarProvider>
    </ThemeProvider>
  );
}

describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    const user = userEvent.setup();
    renderWithProviders();

    await expect(screen.findByText('일정 로딩 완료!')).resolves.toBeInTheDocument();

    const titleInput = screen.getByLabelText('제목');
    const dateInput = screen.getByLabelText('날짜');
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');
    const submitButton = screen.getByTestId('event-submit-button');

    await user.type(titleInput, '과제 하기');
    await user.type(dateInput, '2025-08-21');
    await user.type(startTimeInput, '10:00');
    await user.type(endTimeInput, '14:00');

    await user.click(submitButton);

    await expect(screen.findByText('일정이 추가되었습니다.')).resolves.toBeInTheDocument();

    const eventList = screen.getByTestId('event-list');

    expect(within(eventList).getByText('과제 하기')).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    setupMockHandler(createDefaultEvents(new Date('2025-08-15')));

    const user = userEvent.setup();
    renderWithProviders();

    await expect(screen.findByText('일정 로딩 완료!')).resolves.toBeInTheDocument();

    const editButton = screen.getAllByLabelText('Edit event');
    await user.click(editButton[0]);

    const submitButton = screen.getByTestId('event-submit-button');

    expect(within(submitButton).getByText('일정 수정')).toBeInTheDocument();

    const titleInput = screen.getByLabelText('제목');
    const dateInput = screen.getByLabelText('날짜');
    const descriptionInput = screen.getByLabelText('설명');

    await user.clear(titleInput);
    await user.type(titleInput, '수정한 제목');
    await user.clear(dateInput);
    await user.type(dateInput, '2025-08-21');
    await user.clear(descriptionInput);
    await user.type(descriptionInput, '이것은 수정한 내용이니라.');

    await user.click(submitButton);

    await expect(screen.findByText('일정이 수정되었습니다.')).resolves.toBeInTheDocument();

    const eventList = screen.getByTestId('event-list');

    expect(within(eventList).getByText('수정한 제목')).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandler(createDefaultEvents(new Date('2025-08-15')));

    const user = userEvent.setup();
    renderWithProviders();

    await expect(screen.findByText('일정 로딩 완료!')).resolves.toBeInTheDocument();

    const eventList = screen.getByTestId('event-list');

    const firstEventTitle = within(eventList).getByText('회의');
    expect(firstEventTitle).toBeInTheDocument();

    const deletedButton = screen.getAllByLabelText('Delete event');
    const initialItemCount = deletedButton.length;

    await user.click(deletedButton[0]);

    await expect(screen.findByText('일정이 삭제되었습니다.')).resolves.toBeInTheDocument();

    expect(screen.getAllByLabelText('Delete event').length).toBe(initialItemCount - 1);
    expect(eventList.textContent).not.toContain('회의');
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    setupMockHandler(createDefaultEvents(new Date('2025-08-01')));

    const user = userEvent.setup();
    renderWithProviders();

    const selectViewType = screen.getByLabelText('뷰 타입 선택');
    const selectElement = within(selectViewType).getByRole('combobox');
    await user.click(selectElement);
    await user.click(screen.getByRole('option', { name: /week/i }));

    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    const mockData = createDefaultEvents(new Date());
    setupMockHandler(mockData);

    const user = userEvent.setup();
    renderWithProviders();

    const selectViewType = screen.getByLabelText('뷰 타입 선택');
    const selectElement = within(selectViewType).getByRole('combobox');
    await user.click(selectElement);
    await user.click(screen.getByRole('option', { name: /week/i }));

    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).getByText(mockData[0].title)).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    setupMockHandler(createDefaultEvents(new Date('2024-08-15')));

    const user = userEvent.setup();
    renderWithProviders();

    const selectViewType = screen.getByLabelText('뷰 타입 선택');
    const selectElement = within(selectViewType).getByRole('combobox');
    await user.click(selectElement);
    await user.click(screen.getByRole('option', { name: /month/i }));

    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    const mockData = createDefaultEvents(new Date());
    setupMockHandler(mockData);

    const user = userEvent.setup();
    renderWithProviders();

    const selectViewType = screen.getByLabelText('뷰 타입 선택');
    const selectElement = within(selectViewType).getByRole('combobox');
    await user.click(selectElement);
    await user.click(screen.getByRole('option', { name: /month/i }));

    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).getByText(mockData[0].title)).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime(new Date('2025-01-01'));

    renderWithProviders();

    const day = screen.getByText('신정');
    expect(day).toHaveStyle({ color: '#d32f2f' });
  });
});

describe('검색 기능', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2025-08-15'));
    setupMockHandler([
      {
        id: 'mock-1',
        title: '팀 회의',
        date: '2025-08-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: 'mock-2',
        title: '숙면',
        date: '2025-08-16',
        startTime: '09:00',
        endTime: '10:00',
        description: '숙면을 위한 휴가',
        location: '침대',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
  });

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    renderWithProviders();

    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    renderWithProviders();
    const user = userEvent.setup();

    await expect(screen.findByText('일정 로딩 완료!')).resolves.toBeInTheDocument();

    const searchInput = screen.getByLabelText('일정 검색');
    await user.type(searchInput, '팀 회의');

    const eventList = screen.getByTestId('event-list');
    expect(eventList.textContent).toContain('팀 회의');
    expect(eventList.textContent).not.toContain('숙면');
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    renderWithProviders();
    const user = userEvent.setup();

    await expect(screen.findByText('일정 로딩 완료!')).resolves.toBeInTheDocument();

    const searchInput = screen.getByLabelText('일정 검색');
    await user.clear(searchInput);

    const eventList = screen.getByTestId('event-list');
    expect(eventList.textContent).toContain('팀 회의');
    expect(eventList.textContent).toContain('숙면');
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    setupMockHandler(createDefaultEvents(new Date('2025-08-15')));

    const user = userEvent.setup();
    renderWithProviders();

    await expect(screen.findByText('일정 로딩 완료!')).resolves.toBeInTheDocument();

    const titleInput = screen.getByLabelText('제목');
    const dateInput = screen.getByLabelText('날짜');
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');
    const submitButton = screen.getByTestId('event-submit-button');

    await user.type(titleInput, '과제 하고 잠들기');
    await user.type(dateInput, '2025-08-15');
    await user.type(startTimeInput, '09:00');
    await user.type(endTimeInput, '10:00');

    await user.click(submitButton);

    await expect(screen.findByText('일정 겹침 경고')).resolves.toBeInTheDocument();

    const eventList = screen.getByTestId('event-list');
    expect(eventList.textContent).not.toContain('과제 하고 잠들기');
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    setupMockHandler([
      {
        id: 'mock-1',
        title: '팀 회의',
        date: '2025-08-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: 'mock-2',
        title: '숙면',
        date: '2025-08-16',
        startTime: '09:00',
        endTime: '10:00',
        description: '숙면을 위한 휴가',
        location: '침대',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
    const user = userEvent.setup();
    renderWithProviders();

    await expect(screen.findByText('일정 로딩 완료!')).resolves.toBeInTheDocument();

    const editButton = screen.getAllByLabelText('Edit event');
    await user.click(editButton[0]);

    const submitButton = screen.getByTestId('event-submit-button');
    expect(within(submitButton).getByText('일정 수정')).toBeInTheDocument();

    const dateInput = screen.getByLabelText('날짜');
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');

    await user.clear(dateInput);
    await user.type(dateInput, '2025-08-16');
    await user.clear(startTimeInput);
    await user.type(startTimeInput, '09:00');
    await user.clear(endTimeInput);
    await user.type(endTimeInput, '10:00');

    await user.click(submitButton);

    await expect(screen.findByText('일정 겹침 경고')).resolves.toBeInTheDocument();

    const eventList = screen.getByTestId('event-list');
    expect(eventList.textContent).not.toContain('과제 하고 잠들기');
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  const testTime = new Date('2025-10-15T08:50:00');
  vi.setSystemTime(testTime);
  renderWithProviders();

  await expect(screen.findByText('일정 로딩 완료!')).resolves.toBeInTheDocument();

  const eventList = await screen.findByTestId('event-list');
  expect(within(eventList).getByText('기존 회의')).toBeInTheDocument();

  await expect(
    screen.findByText('10분 후 기존 회의 일정이 시작됩니다.')
  ).resolves.toBeInTheDocument();
});
