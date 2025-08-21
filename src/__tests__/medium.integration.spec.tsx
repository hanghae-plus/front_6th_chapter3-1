import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';

import { ReactElement } from 'react';
import { vi } from 'vitest';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';

// 10월로 시간 모킹
beforeAll(() => {
  vi.setSystemTime(new Date('2025-10-15'));
});

afterAll(() => {
  vi.useRealTimers();
});

const setup = (component: ReactElement) => {
  const theme = createTheme();
  const user = userEvent.setup();
  render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider>{component}</SnackbarProvider>
    </ThemeProvider>
  );
  return {
    user,
  };
};

describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);

    await user.type(screen.getByLabelText(/제목/), '이벤트');
    await user.type(screen.getByLabelText(/날짜/), '2025-10-19');
    await user.type(screen.getByLabelText(/시작 시간/), '09:00');
    await user.type(screen.getByLabelText(/종료 시간/), '10:00');
    await user.type(screen.getByLabelText(/설명/), '이벤트 추가');
    await userEvent.type(screen.getByLabelText(/위치/), '회의실');

    await userEvent.click(screen.getByTestId('event-submit-button'));

    const eventList = screen.getByTestId('event-list');
    expect(eventList).toHaveTextContent('이벤트');
    expect(eventList).toHaveTextContent('2025-10-19');
    expect(eventList).toHaveTextContent('09:00');
    expect(eventList).toHaveTextContent('10:00');
    expect(eventList).toHaveTextContent('이벤트 추가');
    expect(eventList).toHaveTextContent('회의실');
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    setupMockHandlerUpdating();
    const { user } = setup(<App />);

    const editButton = await screen.findAllByRole('button', { name: 'Edit event' });
    await user.click(editButton[0]);

    const titleInput = screen.getByLabelText(/제목/);
    await user.clear(titleInput);
    await user.type(titleInput, '이벤트 수정');

    // 수정 버튼 클릭
    await user.click(screen.getByTestId('event-submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('event-list')).toHaveTextContent('이벤트 수정');
    });

    const eventList = screen.getByTestId('event-list');
    expect(eventList).toHaveTextContent('이벤트 수정');
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion();
    const { user } = setup(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('event-list')).toHaveTextContent('테스트 이벤트');
    });

    const deleteButton = screen.getByTestId('DeleteIcon');
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByTestId('event-list')).not.toHaveTextContent('테스트 이벤트');
    });
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);

    const viewSelect = screen.getByLabelText('뷰 타입 선택');
    await user.click(within(viewSelect).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    await waitFor(() => {
      expect(screen.getByTestId('week-view')).toBeInTheDocument();
    });

    expect(screen.getByTestId('event-list')).toHaveTextContent('검색 결과가 없습니다.');
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '테스트 이벤트',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '테스트',
        location: '테스트 장소',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
    const { user } = setup(<App />);

    const viewSelect = screen.getByLabelText('뷰 타입 선택');
    await user.click(within(viewSelect).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    await waitFor(() => {
      expect(screen.getByTestId('week-view')).toBeInTheDocument();
    });

    expect(screen.getByTestId('event-list')).toHaveTextContent('테스트 이벤트');
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    setupMockHandlerCreation([]);
    setup(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('month-view')).toBeInTheDocument();
    });

    expect(screen.getByTestId('event-list')).toHaveTextContent('검색 결과가 없습니다.');
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '테스트 이벤트',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '테스트',
        location: '테스트 장소',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
    setup(<App />);
    await waitFor(() => {
      expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
    });

    expect(screen.getByTestId('month-view')).toBeInTheDocument();
    expect(screen.getByTestId('event-list')).toHaveTextContent('테스트 이벤트');
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime(new Date('2025-01-01'));
    setup(<App />);

    const monthView = screen.getByTestId('month-view');
    expect(within(monthView).getByText('신정')).toBeInTheDocument();

    vi.useRealTimers();
  });
});

describe('검색 기능', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2025-10-15'));
    setupMockHandlerCreation([
      {
        id: '1',
        title: '팀 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '테스트',
        location: '테스트 장소',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '세미나',
        date: '2025-10-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '테스트',
        location: '테스트 장소',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
  });

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const { user } = setup(<App />);

    const searchInput = screen.getByLabelText(/일정 검색/);
    await user.type(searchInput, '없는 이벤트');

    expect(screen.getByTestId('event-list')).toHaveTextContent('검색 결과가 없습니다.');
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const { user } = setup(<App />);

    const searchInput = screen.getByLabelText(/일정 검색/);
    await user.type(searchInput, '팀 회의');

    expect(screen.getByTestId('event-list')).toHaveTextContent('팀 회의');
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const { user } = setup(<App />);

    const searchInput = screen.getByLabelText(/일정 검색/);
    await user.type(searchInput, '팀 회의');

    expect(screen.getByTestId('event-list')).toHaveTextContent('팀 회의');

    await user.clear(searchInput);

    expect(screen.getByTestId('event-list')).toHaveTextContent('팀 회의');
    expect(screen.getByTestId('event-list')).toHaveTextContent('세미나');
  });
});

describe('일정 충돌', () => {
  beforeEach(() => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '팀 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '테스트',
        location: '테스트 장소',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '세미나',
        date: '2025-10-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '테스트',
        location: '테스트 장소',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
  });

  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    const { user } = setup(<App />);

    await user.type(screen.getByLabelText(/제목/), '새 회의');
    await user.type(screen.getByLabelText(/날짜/), '2025-10-15');
    await user.type(screen.getByLabelText(/시작 시간/), '09:30');
    await user.type(screen.getByLabelText(/종료 시간/), '10:30');

    await user.click(screen.getByTestId('event-submit-button'));

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(screen.getByText('팀 회의 (2025-10-15 09:00-10:00)')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    const { user } = setup(<App />);

    const editButton = await screen.findAllByRole('button', { name: 'Edit event' });
    await user.click(editButton[0]);

    const startTimeInput = screen.getByLabelText(/시작 시간/);
    const endTimeInput = screen.getByLabelText(/종료 시간/);

    await user.clear(startTimeInput);
    await user.type(startTimeInput, '09:30');
    await user.clear(endTimeInput);
    await user.type(endTimeInput, '10:30');

    await user.click(screen.getByTestId('event-submit-button'));

    await waitFor(() => {
      expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    });
    expect(screen.getByText('세미나 (2025-10-15 10:00-11:00)')).toBeInTheDocument();
  });
});

describe('알림 기능', () => {
  it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
    vi.setSystemTime(new Date('2025-10-15T08:50'));
    setupMockHandlerCreation([
      {
        id: '1',
        title: '팀 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '테스트',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    setup(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('event-list')).toHaveTextContent('팀 회의');
    });

    await waitFor(
      () => {
        expect(screen.getByText(/10분 후 팀 회의 일정이 시작됩니다./)).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });
});
