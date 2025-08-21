import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within, waitFor, act } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';

const theme = createTheme();

// ! HINT. 이 유틸을 사용해 리액트 컴포넌트를 렌더링해보세요.
const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  // ? Medium: 여기서 Provider로 묶어주는 동작은 의미있을까요? 있다면 어떤 의미일까요?
  // ! 테스트 환경에서도 실제 앱 환경과 동일하게 Provider로 감싸주어야 해당 기능들이 정상적으로 동작하며, 의존성으로 인한 오류를 방지할 수 있다!

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

// ! HINT. 이 유틸을 사용해 일정을 저장해보세요.
const saveSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'>
) => {
  const { title, date, startTime, endTime, location, description, category } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  const titleInput = await screen.findByLabelText('제목');
  await user.type(titleInput, title);
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

// ! HINT. "검색 결과가 없습니다"는 초기에 노출되는데요. 그럼 검증하고자 하는 액션이 실행되기 전에 검증해버리지 않을까요? 이 테스트를 신뢰성있게 만드려면 어떻게 할까요?
describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    const newSchedule = {
      title: '새로운 팀 회의',
      date: '2025-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '새로운 회의입니다.',
      location: '회의실 A',
      category: '업무',
    };

    await saveSchedule(user, newSchedule);

    await waitFor(async () => {
      const eventList = await screen.findByTestId('event-list');
      expect(within(eventList).getByText(newSchedule.title)).toBeInTheDocument();
      expect(screen.getByText('2025-10-15')).toBeInTheDocument();
      expect(screen.getByText('14:00 - 15:00')).toBeInTheDocument();
      expect(screen.getByText(newSchedule.description)).toBeInTheDocument();
      expect(screen.getByText(newSchedule.location)).toBeInTheDocument();
    });
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    setupMockHandlerUpdating();
    const { user } = setup(<App />);

    const eventList = await screen.findByTestId('event-list');
    const editButtons = within(eventList).getAllByTestId('EditIcon');
    await user.click(editButtons[0]);

    const titleInput = await screen.findByLabelText('제목');
    await user.clear(titleInput);
    await user.type(titleInput, '수정된 회의');

    await user.click(screen.getByTestId('event-submit-button'));

    await waitFor(async () => {
      const updatedEventList = await screen.findByTestId('event-list');

      expect(within(updatedEventList).getByText('수정된 회의')).toBeInTheDocument();
      expect(within(updatedEventList).queryByText('기존 회의')).not.toBeInTheDocument();
    });
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion();
    const { user } = setup(<App />);

    const eventList = await screen.findByTestId('event-list');
    const deleteButtons = within(eventList).getAllByTestId('DeleteIcon');
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('삭제할 이벤트')).not.toBeInTheDocument();
    });
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    server.use(http.get('/api/events', () => HttpResponse.json({ events: [] })));
    const { user } = setup(<App />);

    await user.click(screen.getByText('Month'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    const mockEvent = {
      id: 'week-test-1',
      title: '주별 뷰 테스트 이벤트',
      date: '2025-10-01',
      startTime: '11:00',
      endTime: '12:00',
      description: '',
      location: '',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };
    server.use(http.get('/api/events', () => HttpResponse.json({ events: [mockEvent] })));
    const { user } = setup(<App />);

    await user.click(screen.getByText('Month'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText(mockEvent.title)).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    server.use(http.get('/api/events', () => HttpResponse.json({ events: [] })));
    setup(<App />);

    expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    const mockEvent = {
      id: 'month-test-1',
      title: '월별 뷰 테스트 이벤트',
      date: '2025-10-01',
      startTime: '15:00',
      endTime: '16:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };
    server.use(http.get('/api/events', () => HttpResponse.json({ events: [mockEvent] })));
    setup(<App />);

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText(mockEvent.title)).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    server.use(http.get('/api/events', () => HttpResponse.json({ events: [] })));
    const { user } = setup(<App />);

    const prevMonthButton = screen.getByTestId('ChevronLeftIcon');
    for (let i = 0; i < 9; i++) {
      await user.click(prevMonthButton);
    }
    expect(await screen.findByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  beforeEach(() => {
    const mockEvents = [
      {
        id: 'search-1',
        title: '팀 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: 'search-2',
        title: '개인 프로젝트 마감',
        date: '2025-10-16',
        startTime: '11:00',
        endTime: '12:00',
        description: '',
        location: '',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];
    server.use(http.get('/api/events', () => HttpResponse.json({ events: mockEvents })));
  });

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '존재하지 않는 일정');

    expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');

    await waitFor(() => {
      const eventList = screen.getByTestId('event-list');
      expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
      expect(within(eventList).queryByText('개인 프로젝트 마감')).not.toBeInTheDocument();
    });
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const { user } = setup(<App />);
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');

    await user.type(searchInput, '팀 회의');
    await waitFor(() => {
      expect(screen.queryByText('개인 프로젝트 마감')).not.toBeInTheDocument();
    });

    await user.clear(searchInput);

    await waitFor(() => {
      const eventList = screen.getByTestId('event-list');
      expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
      expect(within(eventList).getByText('개인 프로젝트 마감')).toBeInTheDocument();
    });
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    const initialEvents = [
      {
        id: 'conflict-1',
        title: '기존 일정',
        date: '2025-10-20',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: '', interval: 0 },
        notificationTime: 10,
      },
    ];
    setupMockHandlerCreation(initialEvents as Event[]);

    const { user } = setup(<App />);

    const conflictingSchedule = {
      title: '겹치는 새 일정',
      date: '2025-10-20',
      startTime: '10:30',
      endTime: '11:30',
      description: '겹치는 일정입니다.',
      location: '회의실',
      category: '기타',
    };

    await saveSchedule(user, conflictingSchedule);

    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    setupMockHandlerUpdating();

    const { user } = setup(<App />);

    const eventList = await screen.findByTestId('event-list');
    const editButtons = within(eventList).getAllByTestId('EditIcon');
    await user.click(editButtons[0]);

    const startTimeInput = await screen.findByLabelText('시작 시간');
    const endTimeInput = await screen.findByLabelText('종료 시간');
    await user.clear(startTimeInput);
    await user.type(startTimeInput, '11:00');
    await user.clear(endTimeInput);
    await user.type(endTimeInput, '12:00');

    await user.click(screen.getByTestId('event-submit-button'));

    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
  });
});

describe('알람 기능', () => {
  it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
    vi.setSystemTime(new Date('2025-10-21T14:00:00'));

    setupMockHandlerCreation();
    const { user } = setup(<App />);

    await user.click(screen.getAllByText('일정 추가')[0]);

    await user.type(await screen.findByLabelText('제목'), '알림 기능 테스트');
    await user.type(screen.getByLabelText('날짜'), '2025-10-21');
    await user.type(screen.getByLabelText('시작 시간'), '15:00');
    await user.type(screen.getByLabelText('종료 시간'), '16:00');

    await user.click(await screen.findByText('1분 전'));
    await user.click(await screen.findByText('10분 전'));

    await user.click(screen.getByTestId('event-submit-button'));

    act(() => {
      vi.advanceTimersByTime(50 * 60 * 1000);
    });
    await waitFor(() => {
      const notification = screen.getAllByTestId('alert');
      expect(
        within(notification[0]).getByText(/10분 후 알림 기능 테스트 일정이 시작됩니다./)
      ).toBeInTheDocument();
    });
  });
});
