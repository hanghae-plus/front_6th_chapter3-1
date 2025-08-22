import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { CalendarView } from '../../components/CalendarView';
import { server } from '../../setupTests';
import { createMockEvent, createMockHolidays, TEST_DATES } from '../fixtures/mockData';

describe('CalendarView MSW API 테스트', () => {
  const mockEvents = [createMockEvent()];

  const defaultProps = {
    currentDate: new Date(TEST_DATES.DEFAULT_DATE),
    events: mockEvents,
    holidays: createMockHolidays(),
    notifiedEvents: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('공휴일 API 성공 시 공휴일이 표시된다', async () => {
    server.use(
      http.get('/api/holidays', () => {
        return HttpResponse.json({
          success: true,
          data: createMockHolidays(),
        });
      })
    );

    render(<CalendarView {...defaultProps} view="month" />);

    expect(screen.getByText('광복절')).toBeInTheDocument();
  });

  it('공휴일 API 실패 시 빈 공휴일로 렌더링된다', async () => {
    server.use(
      http.get('/api/holidays', () => {
        return HttpResponse.json({ error: 'Failed to fetch holidays' }, { status: 500 });
      })
    );

    render(<CalendarView {...defaultProps} view="month" holidays={{}} />);

    expect(screen.queryByText('광복절')).not.toBeInTheDocument();
    expect(screen.getByTestId('month-view')).toBeInTheDocument();
  });

  it('공휴일 API 네트워크 에러 시 적절히 처리된다', async () => {
    server.use(
      http.get('/api/holidays', () => {
        return HttpResponse.json({ error: 'Network Error' }, { status: 503 });
      })
    );

    render(<CalendarView {...defaultProps} view="month" holidays={{}} />);

    expect(screen.getByTestId('month-view')).toBeInTheDocument();
  });

  it('공휴일 API 타임아웃 시 달력이 정상 렌더링된다', async () => {
    server.use(
      http.get('/api/holidays', () => {
        return HttpResponse.json({ error: 'Request timeout' }, { status: 408 });
      })
    );

    render(<CalendarView {...defaultProps} view="month" holidays={{}} />);

    expect(screen.getByTestId('month-view')).toBeInTheDocument();
    expect(screen.getByText('2024년 7월')).toBeInTheDocument();
  });

  it('주간 뷰에서도 이벤트가 정상적으로 표시된다', async () => {
    render(<CalendarView {...defaultProps} view="week" />);

    expect(screen.getByTestId('week-view')).toBeInTheDocument();
    expect(screen.getByText('테스트 이벤트')).toBeInTheDocument();
  });

  it('알림된 이벤트가 주간 뷰에서 표시된다', async () => {
    render(<CalendarView {...defaultProps} view="week" notifiedEvents={['1']} />);

    expect(screen.getByText('테스트 이벤트')).toBeInTheDocument();
  });

  it('빈 이벤트 배열로도 달력이 정상 렌더링된다', async () => {
    render(<CalendarView {...defaultProps} events={[]} view="month" />);

    expect(screen.getByTestId('month-view')).toBeInTheDocument();
    expect(screen.queryByText('테스트 이벤트')).not.toBeInTheDocument();
  });
});
