import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { EventForm } from '../types';

const setup = (element: ReactElement) => {
  const theme = createTheme();
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

const fillEventForm = async (user: UserEvent, eventData: Partial<EventForm>) => {
  if (eventData.title) await user.type(screen.getByLabelText('제목'), eventData.title);
  if (eventData.date) await user.type(screen.getByLabelText('날짜'), eventData.date);
  if (eventData.startTime) await user.type(screen.getByLabelText('시작 시간'), eventData.startTime);
  if (eventData.endTime) await user.type(screen.getByLabelText('종료 시간'), eventData.endTime);
  if (eventData.description) await user.type(screen.getByLabelText('설명'), eventData.description);
  if (eventData.location) await user.type(screen.getByLabelText('위치'), eventData.location);

  if (eventData.category) {
    const selectCategory = screen.getByLabelText('카테고리');
    await user.click(within(selectCategory).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: `${eventData.category}-option` }));
  }
};

describe('일정 CRUD 및 기본 기능', () => {
  it('폼 데이터를 입력하고 일정 추가 버튼을 클릭하면 새로운 일정이 리스트에 추가된다.', async () => {
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

    await fillEventForm(user, {
      title: '크리스마스 준비',
      date: '2025-10-25',
      startTime: '12:00',
      endTime: '23:00',
      description: '크리스마스 파티 준비하기',
      location: '회의실 A',
      category: '기타',
    });

    await user.click(screen.getByRole('button', { name: '일정 추가' }));

    const editButtons = await screen.findAllByRole('button', { name: 'Edit event' });
    expect(editButtons).toHaveLength(2);
    expect(screen.getByText('크리스마스 파티 준비하기')).toBeInTheDocument();
  });

  it('일정을 수정하면 수정된 정보가 이벤트 리스트에 반영된다.', async () => {
    setupMockHandlerUpdating();

    const { user } = setup(<App />);

    const editButtons = await screen.findAllByRole('button', { name: 'Edit event' });
    const locationInput = screen.getByLabelText('위치');

    await user.click(editButtons[0]);

    expect(screen.getByRole('button', { name: '일정 수정' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('기존 회의')).toBeInTheDocument();

    await user.clear(locationInput);
    await user.type(locationInput, '회의실 D');
    await user.click(screen.getByRole('button', { name: '일정 수정' }));

    expect(screen.getByText('회의실 D')).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion();

    const { user } = setup(<App />);

    const deleteButton = await screen.findByRole('button', { name: 'Delete event' });

    await user.click(deleteButton);

    expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  it("view를 'week'로 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.", async () => {
    const { user } = setup(<App />);

    const viewSelect = screen.getByLabelText('뷰 타입 선택');

    await user.click(within(viewSelect).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    expect(screen.queryByText('기존 회의')).not.toBeInTheDocument();
    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("view를 'week'로 선택 후 해당 주에 일정이 있다면 리스트, 달력에 표시된다", async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '기존 회의',
        date: '2025-10-01',
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

    const viewSelect = screen.getByLabelText('뷰 타입 선택');
    await user.click(within(viewSelect).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    expect(within(screen.getByTestId('week-view')).getByText('기존 회의')).toBeInTheDocument();
    expect(within(screen.getByTestId('event-list')).getByText('기존 회의')).toBeInTheDocument();
  });

  it("view가 'month'일 때 해당 월에 일정이 없으면, 일정이 표시되지 않는다.", async () => {
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

    setup(<App />);

    expect(screen.queryByText('기존 회의')).not.toBeInTheDocument();
    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("view가 'month'일 때 해당 월에 일정이 있다면 리스트, 달력에 표시된다", async () => {
    setup(<App />);

    expect(
      await within(screen.getByTestId('month-view')).findByText('기존 회의')
    ).toBeInTheDocument();
    expect(within(screen.getByTestId('event-list')).getByText('기존 회의')).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    const { user } = setup(<App />);

    for (let i = 0; i < 9; i++) {
      await user.click(screen.getByLabelText('Previous'));
    }

    expect(screen.getByText('신정')).toBeInTheDocument();
    expect(screen.getByText('신정')).toHaveStyle('color: rgb(211, 47, 47)');
  });
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const { user } = setup(<App />);

    await user.type(screen.getByLabelText('일정 검색'), '식사');

    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
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
      {
        id: '2',
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
    ]);

    const { user } = setup(<App />);

    await user.type(screen.getByLabelText('일정 검색'), '팀 회의');

    expect(
      within(screen.getByTestId('event-list')).queryByText('기존 회의')
    ).not.toBeInTheDocument();
    expect(within(screen.getByTestId('event-list')).getByText('팀 회의')).toBeInTheDocument();
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
      {
        id: '2',
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
    ]);

    const { user } = setup(<App />);

    await user.type(screen.getByLabelText('일정 검색'), '팀 회의');

    expect(
      within(screen.getByTestId('event-list')).queryByText('기존 회의')
    ).not.toBeInTheDocument();
    expect(within(screen.getByTestId('event-list')).getByText('팀 회의')).toBeInTheDocument();

    await user.clear(screen.getByLabelText('일정 검색'));

    expect(within(screen.getByTestId('event-list')).getByText('기존 회의')).toBeInTheDocument();
    expect(within(screen.getByTestId('event-list')).getByText('팀 회의')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    const { user } = setup(<App />);

    await fillEventForm(user, {
      title: '새로운 회의',
      date: '2025-10-15',
      startTime: '09:30',
      endTime: '10:30',
      description: '새로운 팀 미팅',
      location: '회의실 K',
    });

    await user.click(screen.getByRole('button', { name: '일정 추가' }));

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    setupMockHandlerUpdating();

    const { user } = setup(<App />);

    const editButtons = await screen.findAllByRole('button', { name: 'Edit event' });

    await user.click(editButtons[0]);
    await user.clear(screen.getByLabelText('시작 시간'));
    await user.type(screen.getByLabelText('시작 시간'), '11:30');
    await user.clear(screen.getByLabelText('종료 시간'));
    await user.type(screen.getByLabelText('종료 시간'), '12:30');
    await user.click(screen.getByRole('button', { name: '일정 수정' }));

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  vi.setSystemTime(new Date('2025-10-15T08:50:00'));

  setup(<App />);

  await screen.findByText('기존 팀 미팅');

  expect(await screen.findByText('10분 후 기존 회의 일정이 시작됩니다.')).toBeInTheDocument();
});
