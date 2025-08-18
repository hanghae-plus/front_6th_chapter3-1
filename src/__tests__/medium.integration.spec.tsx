import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  render,
  screen,
  within,
  act,
  fireEvent,
  getByRole,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
// import { debug } from 'vitest-preview';
import App from '../App';
import { EventForm } from '../types';

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

async function createEvent({
  title,
  date,
  description,
  startTime,
  endTime,
  category,
}: Pick<EventForm, 'title' | 'date' | 'description' | 'startTime' | 'endTime' | 'category'>) {
  await userEvent.type(screen.getByLabelText('제목'), title!);
  await userEvent.type(screen.getByLabelText('날짜'), date!);
  await userEvent.type(screen.getByLabelText('설명'), description!);
  await userEvent.type(screen.getByLabelText('시작 시간'), startTime!);
  await userEvent.type(screen.getByLabelText('종료 시간'), endTime!);

  await userEvent.click(getByRole(screen.getByLabelText('카테고리'), 'combobox'));
  await userEvent.click(screen.getByLabelText(`${category}-option`));

  await userEvent.click(screen.getByTestId('event-submit-button'));
}

async function updateFirstEvent(
  { title, date, description, startTime, endTime, notificationTime }: Partial<EventForm>,
) {
  const [button] = screen.queryAllByLabelText('Edit event');
  await userEvent.click(button);

  await userEvent.clear(screen.getByLabelText('제목'));
  await userEvent.type(screen.getByLabelText('제목'), title!);
  if (date != null) {
    await userEvent.clear(screen.getByLabelText('날짜'));
    await userEvent.type(screen.getByLabelText('날짜'), date);
  }

  if (description != null) {
    await userEvent.clear(screen.getByLabelText('설명'));
    await userEvent.type(screen.getByLabelText('설명'), description);
  }

  if (startTime != null) {
    await userEvent.clear(screen.getByLabelText('시작 시간'));
    await userEvent.type(screen.getByLabelText('시작 시간'), startTime);
  }

  if (endTime != null) {
    await userEvent.clear(screen.getByLabelText('종료 시간'));
    await userEvent.type(screen.getByLabelText('종료 시간'), endTime);
  }

  if (notificationTime != null) {
    await userEvent.click(getByRole(screen.getByLabelText('알림 설정'), 'combobox'));
    await userEvent.click(screen.getByLabelText(`${notificationTime}-option`));
  }

  await userEvent.click(screen.getByTestId('event-submit-button'));
}

describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    renderApp();

    // 기존 회의 날짜로 이동
    fireEvent.click(screen.getByLabelText('Next'));
    fireEvent.click(screen.getByLabelText('Next'));

    await createEvent({
      title: '테스트 - 새 회의',
      date: '2025-10-16',
      description: '테스트 - 설명',
      startTime: '17:00',
      endTime: '18:00',
      category: '개인',
    });

    const eventList = within(await screen.findByTestId('event-list'));
    expect(eventList.queryAllByText('테스트 - 새 회의').length).not.toBe(0);
    expect(eventList.getByText('2025-10-16')).toBeInTheDocument();
    expect(eventList.getByText('테스트 - 설명')).toBeInTheDocument();

    // TODO: 구현에 몇가지 validation 을 넣어서 더 안정적으로 바꾸기
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    renderApp();

    // 기존 회의 날짜로 이동
    fireEvent.click(screen.getByLabelText('Next'));
    fireEvent.click(screen.getByLabelText('Next'));

    const eventList = within(await screen.findByTestId('event-list'));
    expect(eventList.getByText('기존 회의')).toBeInTheDocument();

    await updateFirstEvent({ title: '바뀐 회의', startTime: '12:00', endTime: '13:00' });

    const eventListAfterUpdate = within(await screen.findByTestId('event-list'));
    expect(eventListAfterUpdate.getByText('바뀐 회의')).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    renderApp();

    // 기존 회의 날짜로 이동
    await userEvent.click(screen.getByLabelText('Next'));
    await userEvent.click(screen.getByLabelText('Next'));

    const eventList = within(await screen.findByTestId('event-list'));
    expect(eventList.getByText('기존 회의')).toBeInTheDocument();

    await fireEvent.click(screen.getByLabelText('Delete event'));

    const eventListAfterDelete = within(await screen.findByTestId('event-list'));
    expect(await eventListAfterDelete.queryByText('기존 회의')).toBeNull();
    expect(await eventListAfterDelete.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    renderApp();

    // 일정 없는 주차
    await userEvent.click(getByRole(screen.getByLabelText('뷰 타입 선택'), 'combobox'));
    await userEvent.click(await screen.findByLabelText('week-option'));
    const eventListAfterDelete = within(await screen.findByTestId('event-list'));

    expect(eventListAfterDelete.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    renderApp();

    // 일정 있는 주차
    await userEvent.click(getByRole(screen.getByLabelText('뷰 타입 선택'), 'combobox'));
    await userEvent.click(await screen.findByLabelText('week-option'));
    for (let i = 0; i < 7; i++) {
      await userEvent.click(screen.getByLabelText('Next'));
    }

    const eventListAfterDelete = within(await screen.findByTestId('event-list'));
    expect(await eventListAfterDelete.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    renderApp();
    // 일정 없는 월

    const eventList = within(await screen.findByTestId('event-list'));

    expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    renderApp();

    // 일정 있는 10월
    await userEvent.click(screen.getByLabelText('Next'));
    await userEvent.click(screen.getByLabelText('Next'));

    const eventList = within(await screen.findByTestId('event-list'));

    expect(eventList.getByText('기존 회의')).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    renderApp();

    // 25년 1월 1일
    await userEvent.click(screen.getByLabelText('Previous'));
    await userEvent.click(screen.getByLabelText('Previous'));
    await userEvent.click(screen.getByLabelText('Previous'));
    await userEvent.click(screen.getByLabelText('Previous'));
    await userEvent.click(screen.getByLabelText('Previous'));
    await userEvent.click(screen.getByLabelText('Previous'));
    await userEvent.click(screen.getByLabelText('Previous'));

    const monthView = within(await screen.findByTestId('month-view'));

    expect(monthView.getByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    renderApp();

    // 일정 있는 10월
    await userEvent.click(screen.getByLabelText('Next'));
    await userEvent.click(screen.getByLabelText('Next'));

    await userEvent.type(screen.getByLabelText('일정 검색'), '없는 문자열');

    const eventList = within(await screen.findByTestId('event-list'));

    expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    renderApp();

    await createEvent({
      title: '테스트 - 팀 회의',
      date: '2025-10-16',
      description: '테스트 - 설명',
      startTime: '17:00',
      endTime: '18:00',
      category: '개인',
    });

    // 일정 있는 10월
    await userEvent.click(screen.getByLabelText('Next'));
    await userEvent.click(screen.getByLabelText('Next'));

    await userEvent.type(screen.getByLabelText('일정 검색'), '팀 회의');

    const eventList = within(await screen.findByTestId('event-list'));

    expect(eventList.getByText('테스트 - 팀 회의')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    renderApp();

    await createEvent({
      title: '테스트 - 팀 회의',
      date: '2025-10-16',
      description: '테스트 - 설명',
      startTime: '17:00',
      endTime: '18:00',
      category: '개인',
    });

    // 일정 있는 10월
    await userEvent.click(screen.getByLabelText('Next'));
    await userEvent.click(screen.getByLabelText('Next'));

    // 검색 결과 1개만 뜸
    await userEvent.type(screen.getByLabelText('일정 검색'), '팀 회의');
    const eventList = within(await screen.findByTestId('event-list'));
    expect(eventList.getByText('테스트 - 팀 회의')).toBeInTheDocument();
    expect(eventList.queryByText('기존 회의')).toBe(null);

    // 검색 초기화시 2개 다 뜸
    await userEvent.clear(screen.getByLabelText('일정 검색'));
    const newEventList = within(await screen.findByTestId('event-list'));
    expect(newEventList.getByText('테스트 - 팀 회의')).toBeInTheDocument();
    expect(newEventList.getByText('기존 회의')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    renderApp();

    // 일정 있는 10월
    await userEvent.click(screen.getByLabelText('Next'));
    await userEvent.click(screen.getByLabelText('Next'));

    await createEvent({
      title: '테스트 - 팀 회의',
      date: '2025-10-15',
      description: '테스트 - 설명',
      startTime: '09:00',
      endTime: '11:00',
      category: '개인',
    });

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('일정 겹침 경고')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    renderApp();

    // 일정 있는 10월
    await userEvent.click(screen.getByLabelText('Next'));
    await userEvent.click(screen.getByLabelText('Next'));

    await createEvent({
      title: '테스트 - 팀 회의',
      date: '2025-10-16',
      description: '테스트 - 설명',
      startTime: '09:00',
      endTime: '11:00',
      category: '개인',
    });

    // 충돌이 나지 않으므로 dialog 가 뜨지 않음
    expect(screen.queryByRole('dialog')).toBe(null);

    await updateFirstEvent({
      title: '기존 회의 - 업데이트',
      date: '2025-10-16',
    });

    // 추가한 이벤트와 충돌이 남
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('일정 겹침 경고');
    expect(dialog).toHaveTextContent('다음 일정과 겹칩니다:');
    expect(dialog).toHaveTextContent('테스트 - 팀 회의');
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  vi.setSystemTime(new Date('2025-10-14T23:49:59Z'));

  renderApp();

  await act(() => vi.advanceTimersByTime(500));

  await updateFirstEvent(
    {
      title: '기존 회의 - 업데이트',
      notificationTime: 10,
    },
  );

  await act(() => vi.advanceTimersByTime(1_000));

  const [alert] = screen.queryAllByRole('alert');
  expect(within(alert).getByText('10분 후 기존 회의 - 업데이트 일정이 시작됩니다.')).toBeInTheDocument();
});
