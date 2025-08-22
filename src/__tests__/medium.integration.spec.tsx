import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import App from '../App';
// eslint-disable-next-line import/order
import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import { Event } from '../types';

const theme = createTheme();

const DEFAULT_EVENT = {
  id: '1',
  title: '기존 회의',
  date: '2025-10-15',
  startTime: '09:00',
  endTime: '10:00',
  description: '기존 팀 미팅',
  location: '회의실 B',
  category: '업무',
  repeat: { type: 'none' as const, interval: 0 },
  notificationTime: 10,
};

const setup = (element: ReactElement) => {
  const user = userEvent.setup();

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

const expectEventInList = async (title: string) => {
  const eventList = within(screen.getByTestId('event-list'));
  expect(await eventList.findByText(title)).toBeInTheDocument();
};

const expectNoResults = async () => {
  expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument();
};

const selectView = async (user: UserEvent, viewType: 'week' | 'month') => {
  const viewSelector = screen.getByLabelText('뷰 타입 선택');
  await user.click(within(viewSelector).getByRole('combobox'));
  await user.click(screen.getByRole('option', { name: `${viewType}-option` }));
};

describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: DEFAULT_EVENT.title,
      date: DEFAULT_EVENT.date,
      startTime: DEFAULT_EVENT.startTime,
      endTime: DEFAULT_EVENT.endTime,
      description: DEFAULT_EVENT.description,
      location: DEFAULT_EVENT.location,
      category: DEFAULT_EVENT.category,
    });

    await expectEventInList(DEFAULT_EVENT.title);
  }, 30000);

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    setupMockHandlerUpdating();

    const { user } = setup(<App />);

    const editButtons = await screen.findAllByRole('button', { name: 'Edit event' });
    const titleInput = screen.getByLabelText('제목');

    await user.click(editButtons[0]);

    expect(screen.getByRole('button', { name: '일정 수정' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('기존 회의')).toBeInTheDocument();

    const newTitle = '기존 회의3';
    await user.clear(titleInput);
    await user.type(titleInput, newTitle);
    await user.click(screen.getByRole('button', { name: '일정 수정' }));

    await expectEventInList(newTitle);
  }, 30000);

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion();
    const { user } = setup(<App />);
    await within(screen.getByTestId('event-list')).findByText('삭제할 이벤트');

    const deleteButtons = await screen.findAllByRole('button', { name: 'Delete event' });
    await user.click(deleteButtons[0]);

    await expectNoResults();
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    const { user } = setup(<App />);
    await selectView(user, 'week');
    await expectNoResults();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '기존 회의',
        date: '2025-10-03',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
    const { user } = setup(<App />);

    const viewSelector = screen.getByLabelText('뷰 타입 선택');

    await user.click(within(viewSelector).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('기존 회의')).toBeInTheDocument();
  }, 30000);

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '기존 회의',
        date: '2025-11-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);
    const viewSelector = screen.getByLabelText('뷰 타입 선택');

    await user.click(within(viewSelector).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'month-option' }));

    expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '기존 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    setup(<App />);

    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('기존 회의')).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    const { user } = setup(<App />);
    const previousButtons = await screen.findAllByRole('button', { name: 'Previous' });

    for (let i = 0; i < 9; i++) {
      await user.click(previousButtons[0]);
    }

    expect(await screen.findByText('신정')).toBeInTheDocument();
  }, 30000);
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '기존 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);
    const eventInput = screen.getByLabelText('일정 검색');

    await user.type(eventInput, '항해');
    expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '팀 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '기존 회의',
        date: '2025-10-20',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 C',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);
    const eventInput = screen.getByLabelText('일정 검색');

    await user.type(eventInput, '팀 회의');

    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('팀 회의')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '기존 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);
    const eventInput = screen.getByLabelText('일정 검색');

    await user.type(eventInput, '항해');
    expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument();

    await user.clear(eventInput);

    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('기존 회의')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '기존 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: '기존 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
    });

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
  }, 30000);

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    setupMockHandlerUpdating();
    const { user } = setup(<App />);

    const editButtons = await screen.findAllByRole('button', { name: 'Edit event' });
    const startInput = screen.getByLabelText('시작 시간');
    const endInput = screen.getByLabelText('종료 시간');

    await user.click(editButtons[0]);

    expect(screen.getByRole('button', { name: '일정 수정' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('기존 회의')).toBeInTheDocument();

    await user.clear(startInput);
    await user.type(startInput, '11:00');

    await user.clear(endInput);
    await user.type(endInput, '12:00');
    await user.click(screen.getByRole('button', { name: '일정 수정' }));

    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
  }, 30000);
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  setupMockHandlerCreation([
    {
      id: '1',
      title: '기존 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ]);

  vi.setSystemTime(new Date('2025-10-15T08:50:00'));
  setup(<App />);

  const eventList = within(screen.getByTestId('event-list'));
  expect(await eventList.findByText('기존 회의')).toBeInTheDocument();

  expect(await screen.findByText('10분 후 기존 회의 일정이 시작됩니다.')).toBeInTheDocument();
}, 30000);
