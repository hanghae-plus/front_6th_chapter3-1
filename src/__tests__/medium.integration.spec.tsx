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
import { Event } from '../types';

const theme = createTheme();

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

// ! HINT. 이 유틸을 사용해 일정을 저장해보세요.
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

// ! HINT. "검색 결과가 없습니다"는 초기에 노출되는데요. 그럼 검증하고자 하는 액션이 실행되기 전에 검증해버리지 않을까요? 이 테스트를 신뢰성있게 만드려면 어떻게 할까요?
describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    const initialEvent: Event[] = [
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
    ];
    setupMockHandlerCreation(initialEvent);

    const { user } = setup(<App />);

    const newEvent: Omit<Event, 'id' | 'notificationTime' | 'repeat'> = {
      title: '점심 약속',
      date: '2025-10-01',
      startTime: '12:00',
      endTime: '13:00',
      description: '동료와 점심 약속',
      location: '식당 A',
      category: '업무',
    };

    await saveSchedule(user, newEvent);

    const list = await screen.findByTestId('event-list');
    expect(within(list).getByText('점심 약속')).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    setupMockHandlerUpdating();
    const { user } = setup(<App />);

    const eventList = await screen.findByTestId('event-list');
    const editButtons = within(eventList).getAllByLabelText('Edit event');
    await user.click(editButtons[0]);

    // 폼이 편집 모드로 전환되었는지 확인 (버튼으로 찾기)
    expect(screen.getByRole('button', { name: '일정 수정' })).toBeInTheDocument();

    // 기존 값이 폼에 로드되었는지 확인
    expect(screen.getByDisplayValue('기존 회의')).toBeInTheDocument();

    // 제목 수정
    const titleInput = screen.getByLabelText('제목');
    await user.clear(titleInput);
    await user.type(titleInput, '수정된 팀 회의');

    // 시간 수정
    const startTimeInput = screen.getByLabelText('시작 시간');
    await user.clear(startTimeInput);
    await user.type(startTimeInput, '14:00');

    // 설명 수정
    const descriptionInput = screen.getByLabelText('설명');
    await user.clear(descriptionInput);
    await user.type(descriptionInput, '수정된 회의 내용');

    // 수정 버튼 클릭
    await user.click(screen.getByTestId('event-submit-button'));

    expect(screen.getByDisplayValue('수정된 팀 회의')).toBeInTheDocument();
    expect(screen.getByDisplayValue('수정된 회의 내용')).toBeInTheDocument();
    expect(screen.getByDisplayValue('14:00')).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion();
    const { user } = setup(<App />);

    // 삭제 전 이벤트가 존재하는지 확인
    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText('삭제할 이벤트')).toBeInTheDocument();

    // 이벤트 리스트에서 삭제 버튼 클릭
    const deleteButtons = within(eventList).getAllByLabelText('Delete event');
    await user.click(deleteButtons[0]);

    expect(within(eventList).queryByText('팀 회의')).not.toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    // MSW 핸들러 설정 - 빈 이벤트 배열 반환
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);

    // 주별 뷰 선택
    const viewSelector = screen.getByLabelText('뷰 타입 선택');
    await user.click(within(viewSelector).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    // 주별 뷰가 표시되는지 확인
    const weekView = await screen.findByTestId('week-view');
    expect(weekView).toBeInTheDocument();

    expect(within(weekView).queryByText('회의')).not.toBeInTheDocument();
    expect(within(weekView).queryByText('약속')).not.toBeInTheDocument();
    expect(within(weekView).queryByText('프로젝트')).not.toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    // MSW 핸들러 설정 - 현재 주에 해당하는 이벤트 포함
    const mockEvents: Event[] = [
      {
        id: 'week-event-1',
        title: '주간 팀 회의',
        date: '2025-10-01', // setupTests에서 설정한 현재 날짜
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 업무 논의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: 'week-event-2',
        title: '클라이언트 미팅',
        date: '2025-10-03', // 같은 주의 다른 날
        startTime: '14:00',
        endTime: '15:00',
        description: '프로젝트 진행 상황 보고',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    setupMockHandlerCreation(mockEvents);
    const { user } = setup(<App />);

    // 주별 뷰 선택
    const viewSelector = screen.getByLabelText('뷰 타입 선택');
    await user.click(within(viewSelector).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    // 주별 뷰가 표시되는지 확인
    const weekView = await screen.findByTestId('week-view');
    expect(weekView).toBeInTheDocument();

    // 주별 뷰에 이벤트들이 정확히 표시되는지 확인
    expect(within(weekView).getByText('주간 팀 회의')).toBeInTheDocument();
    expect(within(weekView).getByText('클라이언트 미팅')).toBeInTheDocument();

    // 해당 날짜에 이벤트가 올바르게 배치되는지 확인 (날짜별로 확인)
    // 2025-10-01은 수요일이므로 해당 칸에 이벤트가 있는지 확인
    const weekViewTable = within(weekView).getByRole('table');
    expect(weekViewTable).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);

    // 월별 뷰 선택 (기본값이지만 명시적으로 선택)
    const viewSelector = screen.getByLabelText('뷰 타입 선택');
    await user.click(within(viewSelector).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'month-option' }));

    // 월별 뷰가 표시되는지 확인
    const monthView = await screen.findByTestId('month-view');
    expect(monthView).toBeInTheDocument();

    // 일정이 표시되지 않는지 확인 (빈 상태)
    // 일반적인 이벤트 제목들이 월별 뷰에 없는지 확인
    expect(within(monthView).queryByText('회의')).not.toBeInTheDocument();
    expect(within(monthView).queryByText('약속')).not.toBeInTheDocument();
    expect(within(monthView).queryByText('프로젝트')).not.toBeInTheDocument();
    expect(within(monthView).queryByText('미팅')).not.toBeInTheDocument();

    // 월별 뷰의 테이블 구조는 존재하지만 이벤트는 없음을 확인
    const monthViewTable = within(monthView).getByRole('table');
    expect(monthViewTable).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    const mockEvents: Event[] = [
      {
        id: 'month-event-1',
        title: '월간 보고서',
        date: '2025-10-05', // setupTests에서 설정한 현재 월
        startTime: '09:00',
        endTime: '10:00',
        description: '월간 업무 보고서 작성',
        location: '사무실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: 'month-event-2',
        title: '고객 상담',
        date: '2025-10-15', // 같은 월의 다른 날
        startTime: '14:00',
        endTime: '15:00',
        description: '신규 고객 상담',
        location: '상담실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: 'month-event-3',
        title: '개인 일정',
        date: '2025-10-20', // 같은 월의 또 다른 날
        startTime: '18:00',
        endTime: '19:00',
        description: '개인 약속',
        location: '카페',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    setupMockHandlerCreation(mockEvents);
    const { user } = setup(<App />);

    // 월별 뷰 선택
    const viewSelector = screen.getByLabelText('뷰 타입 선택');
    await user.click(within(viewSelector).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'month-option' }));

    // 월별 뷰가 표시되는지 확인
    const monthView = await screen.findByTestId('month-view');
    expect(monthView).toBeInTheDocument();

    // 월별 뷰에 이벤트들이 정확히 표시되는지 확인
    expect(within(monthView).getByText('월간 보고서')).toBeInTheDocument();
    expect(within(monthView).getByText('고객 상담')).toBeInTheDocument();
    expect(within(monthView).getByText('개인 일정')).toBeInTheDocument();

    // 월별 뷰의 테이블 구조 확인
    const monthViewTable = within(monthView).getByRole('table');
    expect(monthViewTable).toBeInTheDocument();

    expect(within(monthView).getByText('2025년 10월')).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));
    setup(<App />);

    expect(screen.getByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);

    // 검색 입력란을 찾아 존재하지 않는 키워드로 검색
    const searchInput = screen.getByLabelText('일정 검색');
    await user.type(searchInput, '존재하지않는일정');

    const list = await screen.findByTestId('event-list');
    await user.type(screen.getByPlaceholderText('검색어를 입력하세요'), '테스트검색어');
    expect(within(list).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const mockEvents: Event[] = [
      {
        id: 'search-event-1',
        title: '팀 회의',
        date: '2025-10-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '주간 팀 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: 'search-event-2',
        title: '개인 일정',
        date: '2025-10-02',
        startTime: '14:00',
        endTime: '15:00',
        description: '개인 약속',
        location: '카페',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: 'search-event-3',
        title: '팀 회의 준비',
        date: '2025-10-03',
        startTime: '08:00',
        endTime: '09:00',
        description: '팀 회의 자료 준비',
        location: '사무실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    setupMockHandlerCreation(mockEvents);
    const { user } = setup(<App />);

    // 검색 입력란에 '팀 회의' 입력
    const searchInput = screen.getByLabelText('일정 검색');
    await user.type(searchInput, '팀 회의');

    // 이벤트 리스트에서 '팀 회의' 제목을 가진 일정들이 표시되는지 확인
    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
    expect(within(eventList).getByText('팀 회의 준비')).toBeInTheDocument();

    expect(within(eventList).queryByText('개인 일정')).not.toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const initialEvent: Event[] = [
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
    ];
    setupMockHandlerCreation(initialEvent);

    const { user } = setup(<App />);
    const list = await screen.findByTestId('event-list');

    expect(within(list).getByText('기존 회의')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('검색어를 입력하세요'), '테스트검색어');
    expect(within(list).getByText('검색 결과가 없습니다.')).toBeInTheDocument();

    await user.clear(screen.getByPlaceholderText('검색어를 입력하세요'));
    expect(within(list).getByText('기존 회의')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    const initialEvent: Event[] = [
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
    ];
    setupMockHandlerCreation(initialEvent);
    const { user } = setup(<App />);

    const newEvent: Omit<Event, 'id' | 'notificationTime' | 'repeat'> = {
      title: '점심 약속',
      date: '2025-10-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '동료와 점심 약속',
      location: '식당 A',
      category: '업무',
    };

    await saveSchedule(user, newEvent);

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    setupMockHandlerUpdating();
    const { user } = setup(<App />);

    const eventList = await screen.findByTestId('event-list');
    const deleteButtons = within(eventList).getAllByLabelText('Edit event');
    await user.click(deleteButtons[0]);

    expect(screen.getByRole('button', { name: '일정 수정' })).toBeInTheDocument();
    expect(within(eventList).getByText('기존 회의')).toBeInTheDocument();

    await user.clear(screen.getByLabelText('시작 시간'));
    await user.type(screen.getByLabelText('시작 시간'), '11:00');
    await user.clear(screen.getByLabelText('종료 시간'));
    await user.type(screen.getByLabelText('종료 시간'), '12:00');

    await user.click(screen.getByRole('button', { name: '일정 수정' }));

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  vi.setSystemTime(new Date('2025-10-15T08:50:00Z'));
  setup(<App />);

  const list = await screen.findByTestId('event-list');
  expect(within(list).getByText('기존 회의')).toBeInTheDocument();

  expect(await screen.findByText('10분 후 기존 회의 일정이 시작됩니다.')).toBeInTheDocument();
});
