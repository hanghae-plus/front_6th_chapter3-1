import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';

import { createEvents } from './eventFactory';
import { setupMockHandler } from '../__mocks__/handlersUtils';
import App from '../App';
import { EventForm } from '../types';
import { getDateString } from './utils';

const RenderApp = () => {
  const theme = createTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider>
        <App />
      </SnackbarProvider>
    </ThemeProvider>
  );
};

const todayDate = getDateString(new Date());

const inputEvent = async (user: UserEvent, event: Partial<EventForm>) => {
  if (event.title) {
    await user.type(screen.getByLabelText('제목'), event.title);
  }

  if (event.date) {
    const dateInput = screen.getByLabelText('날짜');
    fireEvent.change(dateInput, { target: { value: event.date } });
  }

  if (event.startTime) {
    const startHourInput = screen.getByLabelText('시작 시간');
    fireEvent.change(startHourInput, { target: { value: event.startTime } });
  }

  if (event.endTime) {
    const endHourInput = screen.getByLabelText('종료 시간');
    fireEvent.change(endHourInput, { target: { value: event.endTime } });
  }

  if (event.description) {
    await user.type(screen.getByLabelText('설명'), event.description);
  }

  if (event.location) {
    await user.type(screen.getByLabelText('위치'), event.location);
  }

  if (event.category) {
    const selectCategory = screen.getByLabelText('카테고리');
    await user.click(within(selectCategory).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: `${event.category}-option` }));
  }

  if (event.repeat && event.repeat.type !== 'none') {
    const repeatCheckbox = within(screen.getByLabelText('반복 일정')).getByRole('checkbox');
    fireEvent.change(repeatCheckbox, { target: { checked: true } });
  }

  if (event.notificationTime) {
    const notificationSelect = screen.getByLabelText('알림 설정');
    await user.click(within(notificationSelect).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: event.notificationTime.toString() }));
  }
};

describe('일정 CRUD 및 기본 기능', () => {
  // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해 보세요.
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    const events = createEvents([{ title: '기존 회의', date: todayDate }]);

    setupMockHandler(events);

    render(<RenderApp />);

    // App 렌더링 테스트
    await expect(screen.getByText('일정 보기')).toBeInTheDocument();

    // 일정 추가 전 일정 1건 확인
    expect(await screen.findAllByTestId('event-item')).toHaveLength(1);

    const user = userEvent.setup();

    // 일정 추가 폼 입력
    await inputEvent(user, {
      title: '새로운 회의',
      date: todayDate,
      startTime: '09:30',
      endTime: '11:30',
      description: '회의 설명',
      location: '회의실 A',
      category: '기타',
    });

    // 일정 추가 버튼 클릭
    await user.click(screen.getByTestId('event-submit-button'));

    // 일정 추가 후 일정 목록 확인
    const listItems = await screen.findAllByTestId('event-item');

    expect(listItems).toHaveLength(2);
    expect(listItems[1]).toHaveTextContent('새로운 회의');
  }, 10000);

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    const events = createEvents([{ title: '기존 회의', date: todayDate }]);

    setupMockHandler(events);

    render(<RenderApp />);

    // App 렌더링 테스트
    await expect(screen.getByText('일정 보기')).toBeInTheDocument();

    // 수정 전 일정 1건 확인
    expect(await screen.findAllByTestId('event-item')).toHaveLength(1);

    const editButtons = screen.getAllByRole('button', { name: 'Edit event' });
    expect(editButtons).toHaveLength(1);

    const user = userEvent.setup();

    // 일정 수정 버튼 클릭
    await user.click(editButtons[0]);

    // 수정 폼 변경 확인
    expect(screen.getByRole('button', { name: '일정 수정' })).toBeInTheDocument();
    expect(screen.getByLabelText('제목')).toHaveValue('기존 회의');

    // 일정 수정 폼 입력
    await inputEvent(user, { title: '수정된 회의' });

    // 일정 수정 버튼 클릭
    await user.click(screen.getByRole('button', { name: '일정 수정' }));

    // 수정 후 일정 목록 확인
    const listItems = await screen.findAllByTestId('event-item');
    expect(listItems).toHaveLength(1);
    expect(listItems[0]).toHaveTextContent('수정된 회의');
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    const events = createEvents([{ title: '기존 회의', date: todayDate }]);

    setupMockHandler(events);

    render(<RenderApp />);

    // App 렌더링 테스트
    await expect(screen.getByText('일정 보기')).toBeInTheDocument();

    // 수정 전 일정 1건 확인
    expect(await screen.findAllByTestId('event-item')).toHaveLength(1);

    const deleteButtons = await screen.findAllByRole('button', { name: 'Delete event' });
    expect(deleteButtons).toHaveLength(1);

    const user = userEvent.setup();

    // 일정 삭제 버튼 클릭
    await user.click(deleteButtons[0]);

    // 삭제 후 일정 0건 확인
    await expect(screen.queryByTestId('event-item')).not.toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    vi.setSystemTime(new Date('2025-07-21'));

    const events = createEvents([{ title: '기존 회의', date: '2025-07-16' }]);

    setupMockHandler(events);

    render(<RenderApp />);

    // App 렌더링 테스트
    await expect(screen.getByText('일정 보기')).toBeInTheDocument();

    // 월별 뷰 확인
    const viewSelect = screen.getByLabelText('뷰 타입 선택');
    const viewCombobox = within(viewSelect).getByRole('combobox');

    expect(within(viewCombobox).queryByText('Month')).toBeInTheDocument();
    expect(within(viewCombobox).queryByText('Week')).not.toBeInTheDocument();

    // 일정 확인
    const listItems = await screen.findAllByTestId('event-item');
    expect(listItems).toHaveLength(1);
    expect(listItems[0]).toHaveTextContent('기존 회의');

    // 주별 뷰 선택
    const user = userEvent.setup();

    await user.click(viewCombobox);
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    // 주별 뷰 확인
    expect(within(viewCombobox).queryByText('Week')).toBeInTheDocument();
    expect(within(viewCombobox).queryByText('Month')).not.toBeInTheDocument();

    // 일정 확인
    expect(await screen.queryAllByTestId('event-item')).toHaveLength(0);
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    vi.setSystemTime(new Date('2025-07-21'));

    const events = createEvents([
      { title: '지난 주 회의', date: '2025-07-14' },
      { title: '이번 주 회의', date: '2025-07-21' },
    ]);

    setupMockHandler(events);

    render(<RenderApp />);

    // App 렌더링 테스트
    await expect(screen.getByText('일정 보기')).toBeInTheDocument();

    // 월별 뷰 확인
    const viewSelect = screen.getByLabelText('뷰 타입 선택');
    const viewCombobox = within(viewSelect).getByRole('combobox');

    expect(within(viewCombobox).queryByText('Month')).toBeInTheDocument();
    expect(within(viewCombobox).queryByText('Week')).not.toBeInTheDocument();

    // 일정 확인
    const listItems = await screen.findAllByTestId('event-item');
    expect(listItems).toHaveLength(2);

    // 주별 뷰 선택
    const user = userEvent.setup();

    await user.click(viewCombobox);
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    // 주별 뷰 확인
    expect(within(viewCombobox).queryByText('Week')).toBeInTheDocument();
    expect(within(viewCombobox).queryByText('Month')).not.toBeInTheDocument();

    // 일정 확인
    const newListItems = await screen.findAllByTestId('event-item');
    expect(newListItems).toHaveLength(1);
    expect(newListItems[0]).toHaveTextContent('이번 주 회의');
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    vi.setSystemTime(new Date('2025-07-21'));

    const events = createEvents([{ title: '지난 달 회의', date: '2025-06-21' }]);

    setupMockHandler(events);

    render(<RenderApp />);

    // App 렌더링 테스트
    await expect(screen.getByText('일정 보기')).toBeInTheDocument();

    // 월별 뷰 확인
    const viewSelect = screen.getByLabelText('뷰 타입 선택');
    const viewCombobox = within(viewSelect).getByRole('combobox');

    expect(within(viewCombobox).queryByText('Month')).toBeInTheDocument();
    expect(within(viewCombobox).queryByText('Week')).not.toBeInTheDocument();

    // 일정 확인
    expect(await screen.queryAllByTestId('event-item')).toHaveLength(0);
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    vi.setSystemTime(new Date('2025-07-21'));

    const events = createEvents([
      { title: '지난 달 회의', date: '2025-06-21' },
      { title: '이번 달 회의', date: '2025-07-21' },
    ]);

    setupMockHandler(events);

    render(<RenderApp />);

    // App 렌더링 테스트
    await expect(screen.getByText('일정 보기')).toBeInTheDocument();

    // 월별 뷰 확인
    const viewSelect = screen.getByLabelText('뷰 타입 선택');
    const viewCombobox = within(viewSelect).getByRole('combobox');

    expect(within(viewCombobox).queryByText('Month')).toBeInTheDocument();
    expect(within(viewCombobox).queryByText('Week')).not.toBeInTheDocument();

    // 일정 확인
    const listItems = await screen.findAllByTestId('event-item');
    expect(listItems).toHaveLength(1);
    expect(listItems[0]).toHaveTextContent('이번 달 회의');
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime(new Date('2025-01-01'));

    const events = createEvents([{ title: '일출 보기', date: '2025-01-01' }]);

    setupMockHandler(events);

    render(<RenderApp />);

    // App 렌더링 테스트
    await expect(screen.getByText('일정 보기')).toBeInTheDocument();

    expect(screen.getByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다', async () => {
    const events = createEvents([
      { title: '회의A', date: todayDate },
      { title: '회의B', date: todayDate },
    ]);

    setupMockHandler(events);

    render(<RenderApp />);

    // App 렌더링 테스트
    await expect(screen.getByText('일정 보기')).toBeInTheDocument();

    // 일정 확인
    const listItems = await screen.findAllByTestId('event-item');
    expect(listItems).toHaveLength(2);

    // 일정 검색
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('일정 검색'), 'C');
    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const events = createEvents([
      { title: '팀 회의', date: todayDate },
      { title: '점심식사', date: todayDate },
    ]);

    setupMockHandler(events);

    render(<RenderApp />);

    // App 렌더링 테스트
    await expect(screen.getByText('일정 보기')).toBeInTheDocument();

    // 일정 확인
    const listItems = await screen.findAllByTestId('event-item');
    expect(listItems).toHaveLength(2);

    // 일정 검색
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('일정 검색'), '팀 회의');

    const newListItems = await screen.findAllByTestId('event-item');
    expect(newListItems).toHaveLength(1);
    expect(newListItems[0]).toHaveTextContent('팀 회의');
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const events = createEvents([
      { title: '팀 회의', date: todayDate },
      { title: '점심식사', date: todayDate },
    ]);

    setupMockHandler(events);

    render(<RenderApp />);

    // App 렌더링 테스트
    await expect(screen.getByText('일정 보기')).toBeInTheDocument();

    // 일정 확인
    const listItems = await screen.findAllByTestId('event-item');
    expect(listItems).toHaveLength(2);
    expect(listItems[0]).toHaveTextContent('팀 회의');
    expect(listItems[1]).toHaveTextContent('점심식사');

    const user = userEvent.setup();

    // 일정 검색
    await user.type(screen.getByLabelText('일정 검색'), 'C');
    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();

    // 검색어 지우기
    await user.clear(screen.getByLabelText('일정 검색'));

    const resetListItems = await screen.findAllByTestId('event-item');
    expect(resetListItems).toHaveLength(2);
    expect(resetListItems[0]).toHaveTextContent('팀 회의');
    expect(resetListItems[1]).toHaveTextContent('점심식사');
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가하면면 경고가 표시된다', async () => {
    const events = createEvents([
      { title: '점심 회의', date: todayDate, startTime: '12:00', endTime: '14:00' },
    ]);

    setupMockHandler(events);

    render(<RenderApp />);

    // App 렌더링 테스트
    await expect(screen.getByText('일정 보기')).toBeInTheDocument();

    const user = userEvent.setup();

    // 일정 추가
    await inputEvent(user, {
      title: '점심 식사',
      date: todayDate,
      startTime: '13:00',
      endTime: '14:00',
    });

    // 일정 추가 버튼 클릭
    await user.click(screen.getByTestId('event-submit-button'));

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    const events = createEvents([
      { title: '점심 회의', date: todayDate, startTime: '11:00', endTime: '12:00' },
      { title: '점심 식사', date: todayDate, startTime: '13:00', endTime: '14:00' },
    ]);

    setupMockHandler(events);

    render(<RenderApp />);

    // App 렌더링 테스트
    await expect(screen.getByText('일정 보기')).toBeInTheDocument();

    const user = userEvent.setup();

    // 일정 수정
    const editButtons = await screen.findAllByRole('button', { name: 'Edit event' });
    await user.click(editButtons[0]);

    await inputEvent(user, {
      title: '점심 식사',
      date: todayDate,
      startTime: '12:30',
      endTime: '13:30',
    });

    // 일정 수정 버튼 클릭
    await user.click(screen.getByRole('button', { name: '일정 수정' }));

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date('2025-09-01 08:49:00'));

  const events = createEvents([
    { title: '알림 이벤트', date: '2025-09-01', startTime: '09:00', notificationTime: 10 },
  ]);

  setupMockHandler(events);

  render(<RenderApp />);

  // App 렌더링 테스트
  await expect(screen.getByText('일정 보기')).toBeInTheDocument();

  // 일정 확인
  const listItems = await screen.findAllByTestId('event-item');
  expect(listItems).toHaveLength(1);
  expect(listItems[0]).toHaveTextContent('알림 이벤트');

  // 1분 앞당기기 -> 08:50
  act(() => {
    vi.advanceTimersByTime(60 * 1000);
  });

  expect(screen.getByText('10분 후 알림 이벤트 일정이 시작됩니다.')).toBeInTheDocument();

  vi.clearAllTimers();
  vi.useRealTimers();
});
