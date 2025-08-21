import { render, screen, within, act } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerUpdating,
  setupMockHandlerDeletion,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';

const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return { ...render(<SnackbarProvider>{element}</SnackbarProvider>), user };
};

describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // Given: 빈 이벤트 목록으로 시작하는 앱과 새로운 일정 정보
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    const titleInput = screen.getByLabelText('제목');
    const dateInput = screen.getByLabelText('날짜');
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');

    // When: 새로운 일정 정보를 입력하고 저장
    await user.type(titleInput, '새로운 회의');
    await user.type(dateInput, '2025-10-15');
    await user.type(startTimeInput, '10:00');
    await user.type(endTimeInput, '11:00');

    await user.click(screen.getByTestId('event-submit-button'));

    // Then: 입력한 모든 필드가 이벤트 리스트에 정확히 표시되어야 함
    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('새로운 회의')).toBeInTheDocument();
    expect(eventList.getByText('2025-10-15')).toBeInTheDocument();
    expect(eventList.getByText('10:00 - 11:00')).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    // Given: 수정 가능한 기존 일정이 있는 상태
    const { user } = setup(<App />);
    setupMockHandlerUpdating();

    // When: 기존 일정을 클릭하여 수정하고 저장
    await user.click(await screen.findByLabelText('Edit event'));

    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '수정된 회의');
    await user.clear(screen.getByLabelText('설명'));
    await user.type(screen.getByLabelText('설명'), '회의 내용 변경');

    await user.click(screen.getByTestId('event-submit-button'));

    // Then: 수정된 내용이 이벤트 리스트에 정확히 반영되어야 함
    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('수정된 회의')).toBeInTheDocument();
    expect(eventList.getByText('회의 내용 변경')).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    // Given: 삭제할 수 있는 기존 일정이 있는 상태
    setupMockHandlerDeletion();
    const { user } = setup(<App />);
    const eventList = within(screen.getByTestId('event-list'));

    await eventList.findByText('삭제테스트입니당', { exact: true });

    // When: 삭제 버튼을 클릭하여 일정을 삭제
    const deleteButtons = await screen.findAllByLabelText('Delete event');
    await user.click(deleteButtons[0]);

    // Then: 삭제된 일정이 더 이상 이벤트 리스트에 표시되지 않아야 함
    expect(eventList.queryByText('삭제테스트입니당')).not.toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    // Given: 빈 일정 목록으로 시작하는 앱
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    // When: 주별 뷰를 선택
    const viewSelect = screen.getByLabelText('뷰 타입 선택');
    const combobox = within(viewSelect).getByRole('combobox');
    await user.click(combobox);
    await user.click(screen.getByLabelText('week-option'));

    // Then: 검색 결과가 없다는 메시지가 표시되어야 함
    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    // Given: 기존 일정이 있는 앱
    const { user } = setup(<App />);

    // When: 주별 뷰를 선택
    const viewSelect = screen.getByLabelText('뷰 타입 선택');
    const combobox = within(viewSelect).getByRole('combobox');
    await user.click(combobox);
    await user.click(screen.getByLabelText('week-option'));

    // Then: 해당 일정이 표시되어야 함
    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('기존 회의')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    // Given: 해당 월에 일정이 없는 상태로 앱 시작
    vi.setSystemTime(new Date('2019-01-01'));
    setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    // When: 월별 뷰를 확인 (기본값)
    // Then: 검색 결과가 없다는 메시지가 표시되어야 함
    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    // Given: 특정 일정이 있는 상태
    setupMockHandlerCreation([
      {
        id: '1',
        title: '황준일 고양이',
        date: '2025-10-02',
        startTime: '09:00',
        endTime: '10:00',
        description: '황준일 고양이 회의입니다.',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
    setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    // When: 월별 뷰를 확인
    // Then: 해당 일정이 월별 뷰에 표시되어야 함
    const monthView = within(screen.getByTestId('month-view'));
    expect(monthView.getByText('황준일 고양이')).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    // Given: 2025년 1월 1일 신정으로 시간을 설정하고 앱 시작
    vi.setSystemTime(new Date('2025-01-01'));
    setup(<App />);

    // When: 월별 뷰에서 1월 1일을 확인
    const monthView = screen.getByTestId('month-view');
    const januaryFirst = within(monthView).getByText('1').closest('td')!;

    // Then: 신정이 표시되어야 함
    expect(within(januaryFirst).getByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  beforeEach(() => {
    setupMockHandlerCreation([
      {
        id: '2',
        title: '팀 회의',
        date: '2025-10-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '새로운 회의',
        date: '2025-10-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    // Given: 기존 일정들이 있는 앱
    const { user } = setup(<App />);

    // When: 존재하지 않는 검색어를 입력
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '존재하지않는검색어');

    // Then: 검색 결과가 없다는 메시지가 표시되어야 함
    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    // Given: '팀 회의' 일정이 있는 앱
    const { user } = setup(<App />);

    // When: '팀 회의'를 검색
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');

    // Then: 해당 일정이 표시되어야 함
    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('팀 회의')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    // Given: 여러 일정이 있는 앱
    const { user } = setup(<App />);

    // When: 검색어를 입력한 후 삭제
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');
    await user.clear(searchInput);

    // Then: 모든 일정이 다시 표시되어야 함
    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('팀 회의')).toBeInTheDocument();
    expect(eventList.getByText('새로운 회의')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    // Given: 기존 일정이 있는 앱
    const { user } = setup(<App />);
    const titleInput = screen.getByLabelText('제목');
    const dateInput = screen.getByLabelText('날짜');
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');

    // When: 기존 일정과 겹치는 시간에 새로운 일정을 추가
    await user.type(titleInput, '새로운 회의');
    await user.type(dateInput, '2025-10-15');
    await user.type(startTimeInput, '09:30');
    await user.type(endTimeInput, '11:00');
    await user.click(screen.getByTestId('event-submit-button'));

    // Then: 일정 겹침 경고가 표시되어야 함
    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
    expect(screen.getByText('기존 회의 (2025-10-15 09:00-10:00)')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    // Given: 수정 가능한 기존 일정들이 있는 상태
    setupMockHandlerUpdating();
    const { user } = setup(<App />);

    const editButton = (await screen.findAllByLabelText('Edit event'))[1];
    await user.click(editButton);

    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');

    // When: 기존 일정의 시간을 다른 일정과 겹치도록 수정하고 저장
    await user.clear(startTimeInput);
    await user.type(startTimeInput, '08:30');
    await user.clear(endTimeInput);
    await user.type(endTimeInput, '10:30');

    await user.click(screen.getByTestId('event-submit-button'));

    // Then: 일정 겹침 경고가 표시되어야 함
    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
    expect(screen.getByText('수정테스트입니당 (2025-10-17 09:00-10:00)')).toBeInTheDocument();
  });
});

test('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  // Given: 10분 전 알림이 설정된 기존 회의가 있고, 알림 시간 전으로 설정
  vi.setSystemTime(new Date('2025-10-15 08:49:59'));
  setup(<App />);
  await screen.findByText('일정 로딩 완료!');
  expect(screen.queryByText('10분 후 기존 회의 일정이 시작됩니다.')).not.toBeInTheDocument();

  // When: 알림 시간(08:50:00)으로 이동
  act(() => {
    vi.setSystemTime(new Date('2025-10-15 08:50:00'));
    vi.advanceTimersByTime(1000);
  });

  // Then: 알림 메시지가 표시되어야 함
  expect(screen.getByText('10분 후 기존 회의 일정이 시작됩니다.')).toBeInTheDocument();
});
