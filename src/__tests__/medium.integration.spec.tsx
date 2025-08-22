import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { ReactElement, useState, useEffect } from 'react';

import { events as mockEventsData } from '../__mocks__/response/events.json';
import * as holidayApi from '../apis/fetchHolidays';
import App from '../App';
import * as useCalendarViewHook from '../hooks/useCalendarView';
import * as useNotificationsHook from '../hooks/useNotifications';
import { server } from '../setupTests';

const theme = createTheme();

const renderWithProviders = (component: ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider>{component}</SnackbarProvider>
    </ThemeProvider>
  );
};

// `useCalendarView` 훅을 모킹하여 테스트 환경에서 일관된 `currentDate`를 반환하도록 한다.
vi.spyOn(useCalendarViewHook, 'useCalendarView').mockImplementation(() => {
  const [view, setView] = useState<'week' | 'month'>('month');
  // `events.json`에 데이터가 있는 2025-10-15로 날짜를 고정한다.
  const [currentDate, setCurrentDate] = useState(new Date('2025-10-15'));
  const [holidays, setHolidays] = useState({});

  const navigate = (direction: 'prev' | 'next') => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      if (view === 'week') {
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
      } else {
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1), 1);
      }
      return newDate;
    });
  };

  // 실제 훅의 useEffect 로직을 모방하여 공휴일 데이터를 가져온다.
  useEffect(() => {
    setHolidays(holidayApi.fetchHolidays(currentDate));
  }, [currentDate]);

  return { view, setView, currentDate, setCurrentDate, holidays, navigate };
});

describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />);
    const eventList = screen.getByTestId('event-list');
    await within(eventList).findByText(mockEventsData[0].title);

    await user.type(screen.getByLabelText('제목'), '새로운 일정');
    await user.type(screen.getByLabelText('날짜'), '2025-10-16');
    await user.type(screen.getByLabelText('시작 시간'), '14:00');
    await user.type(screen.getByLabelText('종료 시간'), '15:00');
    await user.click(screen.getByTestId('event-submit-button'));

    await waitFor(() => {
      expect(within(eventList).getByText('새로운 일정')).toBeInTheDocument();
    });
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />);
    const eventList = screen.getByTestId('event-list');
    const eventToEdit = await within(eventList).findByText(mockEventsData[0].title);
    const eventContainer = eventToEdit.closest('div[class*="MuiBox-root"]');
    await user.click(
      within(eventContainer as HTMLElement).getByRole('button', { name: /Edit event/i })
    );

    const titleInput = screen.getByLabelText('제목');
    await user.clear(titleInput);
    await user.type(titleInput, '수정된 회의');
    await user.click(screen.getByTestId('event-submit-button'));

    await waitFor(() => {
      expect(within(eventList).queryByText(mockEventsData[0].title)).not.toBeInTheDocument();
      expect(within(eventList).getByText('수정된 회의')).toBeInTheDocument();
    });
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />);
    const eventList = screen.getByTestId('event-list');
    const eventToDelete = await within(eventList).findByText(mockEventsData[0].title);
    const eventContainer = eventToDelete.closest('div[class*="MuiBox-root"]');
    await user.click(
      within(eventContainer as HTMLElement).getByRole('button', { name: /Delete event/i })
    );

    await waitFor(() => {
      expect(within(eventList).queryByText(mockEventsData[0].title)).not.toBeInTheDocument();
    });
  });
});

describe('일정 뷰', () => {
  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    renderWithProviders(<App />);
    const monthView = screen.getByTestId('month-view');
    const event = await within(monthView).findByText(mockEventsData[0].title);
    expect(event).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />);
    const viewSelectorContainer = screen.getByText('Month').closest('div');
    await user.click(viewSelectorContainer!);
    await user.click(await screen.findByRole('option', { name: 'week-option' }));
    const weekView = screen.getByTestId('week-view');
    const event = await within(weekView).findByText(mockEventsData[0].title);
    expect(event).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />);
    const prevMonthButton = screen.getAllByRole('button', { name: /Previous/i })[0];
    for (let i = 0; i < 9; i++) {
      await user.click(prevMonthButton);
    }
    const monthView = screen.getByTestId('month-view');
    const holiday = await within(monthView).findByText('신정');
    expect(holiday).toBeInTheDocument();
  });

  it('주별/월별 뷰에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    server.use(http.get('/api/events', () => HttpResponse.json({ events: [] })));
    const user = userEvent.setup();
    renderWithProviders(<App />);
    const monthView = screen.getByTestId('month-view');
    expect(within(monthView).queryByText(mockEventsData[0].title)).not.toBeInTheDocument();
    const viewSelectorContainer = screen.getByText('Month').closest('div');
    await user.click(viewSelectorContainer!);
    await user.click(await screen.findByRole('option', { name: 'week-option' }));
    const weekView = screen.getByTestId('week-view');
    expect(within(weekView).queryByText(mockEventsData[0].title)).not.toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  it("'기존 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />);
    const eventList = screen.getByTestId('event-list');
    await within(eventList).findByText(mockEventsData[0].title);
    const searchInput = screen.getByLabelText('일정 검색');
    await user.type(searchInput, '기존 회의');
    await waitFor(() => {
      expect(within(eventList).getByText('기존 회의')).toBeInTheDocument();
    });
  });

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />);
    const eventList = screen.getByTestId('event-list');
    await within(eventList).findByText(mockEventsData[0].title);
    const searchInput = screen.getByLabelText('일정 검색');
    await user.type(searchInput, '없는 검색어');
    await waitFor(() => {
      expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />);
    const eventList = screen.getByTestId('event-list');
    await within(eventList).findByText(mockEventsData[0].title);
    const searchInput = screen.getByLabelText('일정 검색');
    await user.type(searchInput, '기존');
    await user.clear(searchInput);
    await waitFor(() => {
      expect(within(eventList).getByText(mockEventsData[0].title)).toBeInTheDocument();
    });
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />);
    const eventList = screen.getByTestId('event-list');
    await within(eventList).findByText(mockEventsData[0].title);
    await user.type(screen.getByLabelText('제목'), '겹치는 일정');
    await user.type(screen.getByLabelText('날짜'), '2025-10-15');
    await user.type(screen.getByLabelText('시작 시간'), '09:30');
    await user.type(screen.getByLabelText('종료 시간'), '10:30');
    await user.click(screen.getByTestId('event-submit-button'));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('일정 겹침 경고')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    server.use(
      http.get('/api/events', () =>
        HttpResponse.json({
          events: [
            {
              id: '1',
              title: '이벤트 1',
              date: '2025-10-15',
              startTime: '09:00',
              endTime: '10:00',
              repeat: { type: 'none', interval: 1 },
            },
            {
              id: '2',
              title: '이벤트 2',
              date: '2025-10-15',
              startTime: '11:00',
              endTime: '12:00',
              repeat: { type: 'none', interval: 1 },
            },
          ],
        })
      )
    );
    const user = userEvent.setup();
    renderWithProviders(<App />);
    const eventList = screen.getByTestId('event-list');
    const eventToEdit = await within(eventList).findByText('이벤트 2');
    const eventContainer = eventToEdit.closest('div[class*="MuiBox-root"]');
    await user.click(
      within(eventContainer as HTMLElement).getByRole('button', { name: /Edit event/i })
    );

    const startTimeInput = screen.getByLabelText('시작 시간');
    await user.clear(startTimeInput);
    await user.type(startTimeInput, '09:30');

    const endTimeInput = screen.getByLabelText('종료 시간');
    await user.clear(endTimeInput);
    await user.type(endTimeInput, '10:30');

    await user.click(screen.getByTestId('event-submit-button'));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('일정 겹침 경고')).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  const setNotifications = vi.fn();
  const mockNotifications = [{ id: '1', message: '10분 후 기존 회의 일정이 시작됩니다.' }];
  vi.spyOn(useNotificationsHook, 'useNotifications').mockReturnValue({
    notifications: mockNotifications,
    notifiedEvents: ['1'],
    setNotifications,
    removeNotification: () => {},
  });

  renderWithProviders(<App />);

  const alert = await screen.findByRole('alert');
  expect(within(alert).getByText(/10분 후 기존 회의/)).toBeInTheDocument();
});
