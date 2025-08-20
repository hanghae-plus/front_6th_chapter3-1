import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import {
  // UserEvent,
  userEvent,
} from '@testing-library/user-event';
// import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { ReactNode } from 'react';

import { resetMockEvents } from '../__mocks__/handlers';
import App from '../App';
// import { server } from '../setupTests';
// import { Event } from '../types';
import {
  selectComboboxOption,
  fillEventForm,
  verifyEventInList,
  toggleRepeatCheckbox,
} from './medium.integration.utils';

// 공통 테스트 래퍼 컴포넌트
const TestWrapper = ({ children }: { children: ReactNode }) => (
  <ThemeProvider theme={createTheme()}>
    <CssBaseline />
    <SnackbarProvider>{children}</SnackbarProvider>
  </ThemeProvider>
);

describe('일정 CRUD 및 기본 기능', () => {
  beforeEach(() => {
    resetMockEvents();
  });

  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    const user = userEvent.setup();

    render(<App />, { wrapper: TestWrapper });

    await screen.findByText('일정 로딩 완료!');

    const newEvent = {
      title: '새로운 테스트 일정',
      date: '2025-08-15',
      startTime: '14:30',
      endTime: '16:00',
      description: '테스트용 회의',
      location: '회의실 A',
      category: '개인',
      notificationTime: '1분 전',
    };

    await fillEventForm(user, newEvent);

    await selectComboboxOption(user, 0, newEvent.category);
    await selectComboboxOption(user, 1, newEvent.notificationTime);
    await toggleRepeatCheckbox(user, 'unchecked');

    await user.click(screen.getByTestId('event-submit-button'));

    // 성공 메시지 확인 (POST 성공 후 토스트 확인)
    await screen.findByText('일정이 추가되었습니다.');

    // 이벤트 리스트에서 새로운 일정 확인 (GET 성공 확인)
    const eventList = screen.getByTestId('event-list');

    // 모든 필드가 정확히 저장되었는지 확인
    await verifyEventInList(eventList, newEvent);
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    // 2025년 10월로 mocking: MSW가 바라보는 event가 10월에 있기때문.
    // 클릭액션으로 월을 옮기지않는이유? 이번달이 지나면 테스트코드를 다시 수정해야하기 때문.
    const mockDate = new Date('2025-10-01');
    vi.setSystemTime(mockDate);

    const user = userEvent.setup();

    render(<App />, { wrapper: TestWrapper });

    await screen.findByText('일정 로딩 완료!');

    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).getByText('기존 회의')).toBeInTheDocument();

    const editButton = within(eventList).getByLabelText('Edit event');
    await user.click(editButton);

    const updatedEvent = {
      title: '수정된 회의',
      date: '2025-10-20',
      startTime: '15:00',
      endTime: '16:30',
      description: '수정된 설명',
      location: '회의실 A',
      category: '개인',
      notificationTime: '1분 전',
    };

    await fillEventForm(user, updatedEvent, true);

    await selectComboboxOption(user, 0, updatedEvent.category);
    await selectComboboxOption(user, 1, updatedEvent.notificationTime);
    await toggleRepeatCheckbox(user, 'checked');

    await user.click(screen.getByTestId('event-submit-button'));

    // 수정 성공 메시지 확인 (PUT 성공 후 토스트 확인)
    await screen.findByText('일정이 수정되었습니다.');

    // 수정된 데이터가 이벤트 리스트에 반영되었는지 확인
    await verifyEventInList(eventList, updatedEvent);

    vi.useRealTimers();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    const mockDate = new Date('2025-10-01');
    vi.setSystemTime(mockDate);

    const user = userEvent.setup();

    render(<App />, { wrapper: TestWrapper });

    await screen.findByText('일정 로딩 완료!');

    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).getByText('기존 회의')).toBeInTheDocument();

    // Delete 버튼 클릭
    const deleteButton = within(eventList).getByLabelText('Delete event');
    await user.click(deleteButton);

    // 삭제 성공 메시지 확인 (DELETE 성공 후 토스트 확인)
    await screen.findByText('일정이 삭제되었습니다.');

    // 삭제된 이벤트가 리스트에서 사라졌는지 확인
    expect(within(eventList).queryByText('기존 회의')).not.toBeInTheDocument();
    expect(within(eventList).queryByText('기존 팀 미팅')).not.toBeInTheDocument();
    expect(within(eventList).queryByText('회의실 B')).not.toBeInTheDocument();

    // 이벤트 리스트가 비어있음을 확인 ("검색 결과가 없습니다." 표시)
    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();

    // 시스템 시간 복원
    vi.useRealTimers();
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    const mockDate = new Date('2025-09-15');
    vi.setSystemTime(mockDate);

    const user = userEvent.setup();

    render(<App />, { wrapper: TestWrapper });

    await screen.findByText('일정 로딩 완료!');

    await selectComboboxOption(user, 2, 'week-option');

    const calendarView = screen.getByTestId('week-view');

    // 일정이 표시되지 않아야 함
    expect(within(calendarView).queryByText('기존 회의')).not.toBeInTheDocument();
    expect(within(calendarView).queryByText('기존 팀 미팅')).not.toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    // 2025년 10월 15일에 MSW가 바라보는 일정이 있기 때문
    const mockDate = new Date('2025-10-15');
    vi.setSystemTime(mockDate);

    const user = userEvent.setup();

    render(<App />, { wrapper: TestWrapper });

    await screen.findByText('일정 로딩 완료!');

    // 주별 뷰 선택
    await selectComboboxOption(user, 2, 'week-option');

    // 주별 뷰에서 일정이 표시되는지 확인
    const calendarView = screen.getByTestId('week-view');

    // 기존 일정들이 표시되어야 함
    expect(within(calendarView).getByText('기존 회의')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    const mockDate = new Date('2025-09-15');
    vi.setSystemTime(mockDate);

    render(<App />, { wrapper: TestWrapper });

    await screen.findByText('일정 로딩 완료!');

    const calendarView = screen.getByTestId('month-view');

    expect(within(calendarView).queryByText('기존 회의')).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    const mockDate = new Date('2025-10-15');
    vi.setSystemTime(mockDate);

    render(<App />, { wrapper: TestWrapper });

    await screen.findByText('일정 로딩 완료!');

    // 월별 뷰는 기본값이므로 별도 선택 불필요
    const calendarView = screen.getByTestId('month-view');

    // 기존 일정들이 표시되어야 함
    expect(within(calendarView).getByText('기존 회의')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    const mockDate = new Date('2025-01-01');
    vi.setSystemTime(mockDate);

    render(<App />, { wrapper: TestWrapper });

    await screen.findByText('일정 로딩 완료!');

    const calendarView = screen.getByTestId('month-view');
    expect(within(calendarView).getByText('신정')).toBeInTheDocument();

    vi.useRealTimers();
  });
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {});

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {});

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {});
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {});

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {});
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {});
