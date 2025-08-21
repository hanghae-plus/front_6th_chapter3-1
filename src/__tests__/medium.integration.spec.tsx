import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within, act, waitFor } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { Event } from '../types';

const theme = createTheme();

// 테스트용 기본 이벤트 데이터 상수
const TEST_EVENTS = {
  TEAM_MEETING: {
    id: '1',
    title: '팀 회의',
    date: '2025-10-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  EXISTING_MEETING: {
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
  EXISTING_MEETING2: {
    id: '2',
    title: '기존 회의2',
    date: '2025-10-15',
    startTime: '11:00',
    endTime: '12:00',
    description: '기존 팀 미팅 2',
    location: '회의실 C',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  NEW_MEETING: {
    id: '1',
    title: '새로운 회의',
    date: '2025-10-12',
    startTime: '10:00',
    endTime: '11:00',
    description: '새로운 팀 미팅',
    location: '회의실 A',
    category: '기타',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
} as const;

// ! HINT. 이 유틸을 사용해 리액트 컴포넌트를 렌더링해보세요.
const setup = (element: ReactElement) => {
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

// 뷰 타입 선택 유틸리티
const selectViewType = async (user: UserEvent, viewType: 'week' | 'month') => {
  const selectViewTypeElement = screen.getByLabelText('뷰 타입 선택');
  await user.click(within(selectViewTypeElement).getByRole('combobox'));
  await user.click(screen.getByRole('option', { name: `${viewType}-option` }));
};

// 일정 추가 폼 작성 유틸리티
const fillEventForm = async (user: UserEvent, eventData: Partial<Event>) => {
  const {
    title = '',
    date = '',
    startTime = '',
    endTime = '',
    description = '',
    location = '',
    category = '기타',
  } = eventData;

  if (title) await user.type(screen.getByLabelText('제목'), title);
  if (date) await user.type(screen.getByLabelText('날짜'), date);
  if (startTime) await user.type(screen.getByLabelText('시작 시간'), startTime);
  if (endTime) await user.type(screen.getByLabelText('종료 시간'), endTime);
  if (description) await user.type(screen.getByLabelText('설명'), description);
  if (location) await user.type(screen.getByLabelText('위치'), location);

  if (category) {
    await user.click(screen.getByLabelText('카테고리'));
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: `${category}-option` }));
  }
};

// ! HINT. "검색 결과가 없습니다"는 초기에 노출되는데요. 그럼 검증하고자 하는 액션이 실행되기 전에 검증해버리지 않을까요? 이 테스트를 신뢰성있게 만드려면 어떻게 할까요?
describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    setupMockHandlerCreation([TEST_EVENTS.EXISTING_MEETING]);

    const { user } = setup(<App />);

    await fillEventForm(user, {
      title: '새로운 회의',
      date: '2025-10-12',
      startTime: '10:00',
      endTime: '11:00',
      description: '새로운 팀 미팅',
      location: '회의실 A',
      category: '기타',
    });

    await user.click(screen.getByRole('button', { name: '일정 추가' }));

    await screen.findAllByRole('button', { name: 'Edit event' });

    expect(screen.getByText('새로운 팀 미팅')).toBeInTheDocument();
    expect(screen.getByText('2025-10-12')).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    setupMockHandlerUpdating();

    const { user } = setup(<App />);

    const mockEditButtons = await screen.findAllByRole('button', { name: 'Edit event' });
    const [editButton1, editButton2] = mockEditButtons;
    await user.click(editButton1);

    expect(screen.getByRole('button', { name: '일정 수정' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('기존 회의')).toBeInTheDocument();

    const locationInput = screen.getByLabelText('위치');
    await user.type(locationInput, '회의실 C');

    await user.click(screen.getByRole('button', { name: '일정 수정' }));

    await user.click(editButton2);

    expect(screen.getByDisplayValue('기존 회의2')).toBeInTheDocument();
    expect(screen.getByDisplayValue('회의실 C')).toBeInTheDocument();

    const locationInput2 = screen.getByLabelText('위치');
    await user.type(locationInput2, '회의실 D');

    await user.click(screen.getByRole('button', { name: '일정 수정' }));
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion();

    const { user } = setup(<App />);

    const trashButtons = await screen.findAllByRole('button', { name: 'Delete event' });
    const [trashButton] = trashButtons;

    await user.click(trashButton);

    expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    const { user } = setup(<App />);

    await selectViewType(user, 'week');

    expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    setupMockHandlerCreation([TEST_EVENTS.TEAM_MEETING]);

    const { user } = setup(<App />);

    await selectViewType(user, 'week');

    expect(within(screen.getByTestId('week-view')).getByText('팀 회의')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    setupMockHandlerCreation([]);

    const { user } = setup(<App />);

    await selectViewType(user, 'month');

    expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    setupMockHandlerCreation([TEST_EVENTS.EXISTING_MEETING]);

    const { user } = setup(<App />);

    await selectViewType(user, 'month');

    expect(screen.getByText('회의실 B')).toBeInTheDocument();
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
    setup(<App />);
    const searchInput = screen.getByLabelText('일정 검색');
    await userEvent.type(searchInput, 'gd');

    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    setupMockHandlerCreation([TEST_EVENTS.TEAM_MEETING]);

    setup(<App />);
    const searchInput = screen.getByLabelText('일정 검색');
    await userEvent.type(searchInput, '팀 회의');

    expect(within(screen.getByTestId('event-list')).getByText('팀 회의')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    setupMockHandlerCreation([TEST_EVENTS.TEAM_MEETING]);

    setup(<App />);
    const searchInput = screen.getByLabelText('일정 검색');
    await userEvent.type(searchInput, '팀 회의');

    expect(within(screen.getByTestId('event-list')).getByText('팀 회의')).toBeInTheDocument();

    await userEvent.clear(searchInput);

    expect(within(screen.getByTestId('event-list')).getByText('팀 회의')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    setupMockHandlerCreation([TEST_EVENTS.TEAM_MEETING]);

    const { user } = setup(<App />);

    await fillEventForm(user, {
      title: '새로운 회의',
      date: '2025-10-01',
      startTime: '09:30',
      endTime: '10:30',
      description: '새로운 팀 미팅',
      location: '회의실 A',
    });

    await user.click(screen.getByRole('button', { name: '일정 추가' }));

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    setupMockHandlerCreation([TEST_EVENTS.EXISTING_MEETING, TEST_EVENTS.EXISTING_MEETING2]);

    const { user } = setup(<App />);

    const mockEditButtons = await screen.findAllByRole('button', { name: 'Edit event' });
    const [editButton1] = mockEditButtons;

    await user.click(editButton1);

    expect(screen.getByRole('button', { name: '일정 수정' })).toBeInTheDocument();

    await user.clear(screen.getByLabelText('시작 시간'));
    await user.type(screen.getByLabelText('시작 시간'), '11:30');
    await user.clear(screen.getByLabelText('종료 시간'));
    await user.type(screen.getByLabelText('종료 시간'), '12:30');
    await user.click(screen.getByRole('button', { name: '일정 수정' }));

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  // 타이머를 모킹하여 수동으로 제어할 수 있도록 설정
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-10-15T08:50:00'));

  setupMockHandlerCreation([TEST_EVENTS.EXISTING_MEETING, TEST_EVENTS.EXISTING_MEETING2]);

  setup(<App />);

  await act(async () => {
    vi.advanceTimersByTime(1000);
  });

  await waitFor(() => {
    expect(screen.getByText('10분 후 기존 회의 일정이 시작됩니다.')).toBeInTheDocument();
  });

  expect(screen.getByText('10분 후 기존 회의 일정이 시작됩니다.')).toBeInTheDocument();

  vi.useRealTimers();
});
