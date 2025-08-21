import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { vi } from 'vitest';

import { createMockHandlers } from '../__mocks__/handlersUtils';
import { events } from '../__mocks__/response/events.json' assert { type: 'json' };
import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';

// 테스트용 테마 설정
const theme = createTheme();

// 테스트용 App 컴포넌트 래퍼
const AppWrapper = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <SnackbarProvider>
      <App />
    </SnackbarProvider>
  </ThemeProvider>
);

describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    server.use(...createMockHandlers([])());

    render(<AppWrapper />);

    // 새 일정 추가 폼 작성
    const user = userEvent.setup() as UserEvent;

    // 일정 추가 버튼 클릭
    const addButton = screen.getByRole('button', { name: '일정 추가' });
    await user.click(addButton);

    await user.type(screen.getByLabelText('제목'), '테스트 회의');
    await user.type(screen.getByLabelText('날짜'), '2025-10-01');
    await user.type(screen.getByLabelText('시작 시간'), '14:00');
    await user.type(screen.getByLabelText('종료 시간'), '15:00');
    await user.type(screen.getByLabelText('설명'), '테스트용 회의입니다');
    await user.type(screen.getByLabelText('위치'), '온라인');

    const categorySelect = screen.getByLabelText('카테고리');
    // 카테고리 선택
    await user.click(categorySelect);
    const categoryOption = screen.getByText('업무');
    await user.click(categoryOption);

    // 저장 버튼 클릭
    const saveButton = screen.getByTestId('event-submit-button');
    await user.click(saveButton);

    // 일정이 목록에 추가되었는지 확인
    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText('테스트 회의')).toBeInTheDocument();

    expect(within(eventList).getByText('2025-10-01')).toBeInTheDocument();
    expect(within(eventList).getByText('14:00 - 15:00')).toBeInTheDocument();
    expect(within(eventList).getByText('테스트용 회의입니다')).toBeInTheDocument();
    expect(within(eventList).getByText('온라인')).toBeInTheDocument();
    expect(within(eventList).getByText('카테고리: 업무')).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    server.use(...createMockHandlers(events as Event[])());

    render(<AppWrapper />);

    const user = userEvent.setup();

    // 기존 일정이 표시되는지 확인 (일정 목록 내에서만 검색)

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText('기존 회의')).toBeInTheDocument();

    // 일정 수정 버튼 클릭 (첫 번째 일정의 Edit 버튼)
    const editButton = screen.getByRole('button', { name: 'Edit event' });
    await user.click(editButton); // 첫 번째 Edit 버튼 클릭

    // 제목 수정
    const titleInput = screen.getByDisplayValue('기존 회의');
    await user.clear(titleInput);
    await user.type(titleInput, '수정된 회의');

    // 설명 수정
    const descriptionInput = screen.getByDisplayValue('기존 팀 미팅');
    await user.clear(descriptionInput);
    await user.type(descriptionInput, '수정된 팀 미팅');

    // 저장 버튼 클릭 (data-testid 사용)
    const saveButton = screen.getByTestId('event-submit-button');
    await user.click(saveButton);

    // 수정된 내용이 반영되었는지 확인 (일정 목록 내에서만 검색)
    const eventEditList = await screen.findByTestId('event-list');
    expect(within(eventEditList).getByText('수정된 회의')).toBeInTheDocument();
    expect(within(eventEditList).getByText('수정된 팀 미팅')).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    // MSW Mock Server 설정 (삭제용 - 내장된 mock 데이터 사용)
    const customEvents: Event[] = [
      {
        id: '1',
        title: '삭제할 이벤트',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '삭제 테스트용 이벤트',
        location: '테스트 장소',
        category: '테스트',
        repeat: { type: 'none' as const, interval: 0 },
        notificationTime: 10,
      },
    ];
    server.use(...createMockHandlers(customEvents)());

    render(<AppWrapper />);

    const user = userEvent.setup();

    // 기존 일정이 표시되는지 확인
    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText('삭제할 이벤트')).toBeInTheDocument();

    // 삭제 버튼 클릭 (
    const deleteButton = within(eventList).getByRole('button', { name: /Delete event/i });
    await user.click(deleteButton);

    // 일정이 목록에서 제거되었는지 확인
    expect(within(eventList).queryByText('삭제할 이벤트')).not.toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    vi.setSystemTime('2025-07-01');

    const mockEvents: Event[] = [
      {
        id: '1',
        title: '7월 둘째주 회의',
        date: '2025-07-08',
        startTime: '09:00',
        endTime: '10:00',
        description: '7월 둘째주 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none' as const, interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '7월 둘째주 미팅',
        date: '2025-07-10',
        startTime: '14:00',
        endTime: '15:00',
        description: '7월 둘째주 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none' as const, interval: 0 },
        notificationTime: 10,
      },
    ];
    server.use(...createMockHandlers(mockEvents)());

    render(<AppWrapper />);
    const user = userEvent.setup();

    // 주별 뷰로 변경
    const viewSelector = screen.getByLabelText('뷰 타입 선택');
    await user.click(within(viewSelector).getByRole('combobox'));
    await user.click(screen.getByTestId('week-option'));

    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).queryByText('7월 둘째주 회의')).not.toBeInTheDocument();
    expect(within(eventList).queryByText('7월 둘째주 미팅')).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    vi.setSystemTime('2025-07-01');

    const mockEvents: Event[] = [
      {
        id: '1',
        title: '7월 첫째주 회의',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '미팅미팅미팅~',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none' as const, interval: 0 },
        notificationTime: 10,
      },
    ];
    server.use(...createMockHandlers(mockEvents)());

    render(<AppWrapper />);

    const user = userEvent.setup();

    const viewSelector = screen.getByLabelText('뷰 타입 선택');
    await user.click(within(viewSelector).getByRole('combobox'));
    await user.click(screen.getByTestId('week-option'));

    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).queryByText('7월 첫째주 회의')).toBeInTheDocument();
    expect(within(eventList).queryByText('미팅미팅미팅~')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '5월 첫째주 회의',
        date: '2025-05-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '5월 회의입니당',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none' as const, interval: 0 },
        notificationTime: 10,
      },
    ];
    server.use(...createMockHandlers(mockEvents)());

    render(<AppWrapper />);

    const user = userEvent.setup();

    const viewSelector = screen.getByLabelText('뷰 타입 선택');
    await user.click(within(viewSelector).getByRole('combobox'));
    await user.click(screen.getByTestId('month-option'));

    // 일정이 표시되지 않는지 확인 (일정 목록 컨테이너가 비어있거나 일정 데이터가 없는지 확인)
    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).queryByText('5월 첫째주 회의')).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '10월 첫째주 회의',
        date: '2025-10-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '10월 회의입니당',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none' as const, interval: 0 },
        notificationTime: 10,
      },

      {
        id: '2',
        title: '10월 둘째주 회의',
        date: '2025-10-08',
        startTime: '09:00',
        endTime: '10:00',
        description: '회의 테스트2',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none' as const, interval: 0 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '10월 셋째주 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '회의 테스트333',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none' as const, interval: 0 },
        notificationTime: 10,
      },
    ];
    server.use(...createMockHandlers(mockEvents as Event[])());

    render(<AppWrapper />);

    const user = userEvent.setup();

    const viewSelector = screen.getByLabelText('뷰 타입 선택');
    await user.click(within(viewSelector).getByRole('combobox'));
    await user.click(screen.getByTestId('month-option'));

    // 뷰 변경 후 모든 이벤트가 표시되는지 확인
    const eventList = screen.getByTestId('event-list');

    expect(within(eventList).getByText('10월 첫째주 회의')).toBeInTheDocument();
    expect(within(eventList).getByText('10월 둘째주 회의')).toBeInTheDocument();
    expect(within(eventList).getByText('10월 셋째주 회의')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime('2025-01-01');

    render(<AppWrapper />);

    const newYearHoliday = screen.queryByText('신정');
    expect(newYearHoliday).toBeInTheDocument();

    vi.useRealTimers();
  });
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    server.use(...createMockHandlers([])());

    render(<AppWrapper />);

    const user = userEvent.setup();

    const searchInput = screen.getByPlaceholderText(/검색어를 입력하세요/i);
    await user.type(searchInput, '존재하지 않는 일정');

    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '팀 회의',
        date: '2025-10-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '그냥 회의는 아니겟지',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none' as const, interval: 0 },
        notificationTime: 10,
      },
    ];
    server.use(...createMockHandlers(mockEvents)());

    render(<AppWrapper />);

    const user = userEvent.setup();

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '팀 회의',
        date: '2025-10-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '그냥 회의는 아니겟지',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none' as const, interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '팀 회의2',
        date: '2025-10-29',
        startTime: '09:00',
        endTime: '10:00',
        description: '그냥 회의는 아니겟지2',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none' as const, interval: 0 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '기존 회의1',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 회의는 아니겟지1',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none' as const, interval: 0 },
        notificationTime: 10,
      },
      {
        id: '4',
        title: '기존 회의2',
        date: '2025-10-20',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 회의는 아니겟지2',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none' as const, interval: 0 },
        notificationTime: 10,
      },
    ];
    server.use(...createMockHandlers(mockEvents)());

    render(<AppWrapper />);

    const user = userEvent.setup();

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');

    await user.clear(searchInput);

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText('기존 회의1')).toBeInTheDocument();
    expect(within(eventList).getByText('기존 회의2')).toBeInTheDocument();
    expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
    expect(within(eventList).getByText('팀 회의2')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    server.use(...createMockHandlers(events as Event[])());

    render(<AppWrapper />);

    const user = userEvent.setup();

    const addButton = screen.getByRole('button', { name: '일정 추가' });
    await user.click(addButton);

    await user.type(screen.getByLabelText('제목'), '충돌하는 일정');
    await user.type(screen.getByLabelText('날짜'), '2025-10-15'); // 기존 일정과 같은 날짜
    await user.type(screen.getByLabelText('시작 시간'), '09:30'); // 기존 일정과 겹치는 시간
    await user.type(screen.getByLabelText('종료 시간'), '10:30'); // 기존 일정과 겹치는 시간
    await user.type(screen.getByLabelText('설명'), '충돌 테스트');
    await user.type(screen.getByLabelText('위치'), '회의실 A');

    const categorySelect = screen.getByLabelText('카테고리');
    await user.click(categorySelect);
    const categoryOption = screen.getByText('업무');
    await user.click(categoryOption);

    const saveButton = screen.getByTestId('event-submit-button');
    await user.click(saveButton);

    const submitButton = screen.getByTestId('event-submit-button');
    await user.click(submitButton);

    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    const existingEvents: Event[] = [
      {
        id: '1',
        title: '첫 번째 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '첫 번째 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none' as const, interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '두 번째 회의',
        date: '2025-10-15',
        startTime: '11:00',
        endTime: '12:00',
        description: '두 번째 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none' as const, interval: 0 },
        notificationTime: 10,
      },
    ];

    server.use(...createMockHandlers(existingEvents)());

    render(<AppWrapper />);

    const user = userEvent.setup();

    const editButtons = await screen.findAllByRole('button', { name: 'Edit event' });

    await user.click(editButtons[0]);
    await user.clear(screen.getByLabelText('시작 시간'));
    await user.type(screen.getByLabelText('시작 시간'), '11:30');
    await user.clear(screen.getByLabelText('종료 시간'));
    await user.type(screen.getByLabelText('종료 시간'), '11:40');

    const saveButton = screen.getByTestId('event-submit-button');
    await user.click(saveButton);

    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
  });
});

describe('알림 기능', () => {
  it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
    const newEvent: Event = {
      id: '1',
      title: '새로운 이벤트',
      date: '2025-10-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '마지막 테스트..',
      location: '불꺼진 우리집',
      category: '항플 과제',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    server.use(...createMockHandlers([newEvent])());
    render(<AppWrapper />);

    // 이벤트가 실제로 렌더링될 때까지 기다림
    const eventList = await screen.findByTestId('event-list');

    // 일정 목록에서만 이벤트 제목을 찾음
    const eventTitle = within(eventList).getByText(newEvent.title);
    expect(eventTitle).toBeInTheDocument();

    // 시스템 시간을 설정하고 알림 텍스트 확인
    vi.setSystemTime('2025-10-01 09:50');

    // 알림 텍스트가 나타날 때까지 기다림
    expect(await screen.findByText('10분 전')).toBeInTheDocument();
  });
});
