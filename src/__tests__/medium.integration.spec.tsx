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
    setupMockHandlerCreation([]);

    const { user } = setup(<App />);
    await saveSchedule(user, {
      title: '팀 회의',
      date: '2025-10-01',
      startTime: '06:30',
      endTime: '07:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
    });
    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('팀 회의')).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    setupMockHandlerUpdating();

    const { user } = setup(<App />);

    const [editButton] = await screen.findAllByLabelText('Edit event');
    await user.click(editButton);

    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '가족 회의');
    await user.clear(screen.getByLabelText('위치'));
    await user.type(screen.getByLabelText('위치'), '회의실 B');
    await user.click(screen.getByTestId('event-submit-button'));

    await screen.findByText('일정이 수정되었습니다.');

    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('가족 회의')).toBeInTheDocument();
    expect(await eventList.findByText('회의실 B')).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion();

    const { user } = setup(<App />);

    const [deleteButton] = await screen.findAllByLabelText('Delete event');
    await user.click(deleteButton);

    await screen.findByText('일정이 삭제되었습니다.');
    expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    const { user } = setup(<App />);

    await user.click(screen.getByLabelText('뷰 타입 선택'));
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '팀 회의',
        date: '2025-10-01',
        startTime: '06:30',
        endTime: '07:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    await user.click(screen.getByLabelText('뷰 타입 선택'));
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    const weekView = within(screen.getByTestId('week-view'));
    expect(await weekView.findByText('팀 회의')).toBeInTheDocument();

    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('회의실 A')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    setupMockHandlerCreation([]);

    setup(<App />);

    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '이사가는 날',
        date: '2025-10-15',
        startTime: '11:30',
        endTime: '13:00',
        description: '이사가는 날 날씨 좋다!',
        location: '봉천동',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30,
      },
    ]);
    setup(<App />);

    const monthView = within(screen.getByTestId('month-view'));
    expect(await monthView.findByText('이사가는 날')).toBeInTheDocument();

    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('봉천동')).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);

    // 왜 26년 1월 1일에는 신정 표시 안해주냐...ㅠ
    for (let i = 0; i < 9; i++) {
      await user.click(screen.getByLabelText('Previous'));
    }
    const monthView = within(screen.getByTestId('month-view'));
    expect(await monthView.findByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '팀 회의',
        date: '2025-10-01',
        startTime: '08:30',
        endTime: '09:00',
        description: '회의 하기 싫어',
        location: '회사',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '점심 약속',
        date: '2025-10-02',
        startTime: '12:30',
        endTime: '14:00',
        description: '쌀국수 먹어야지',
        location: '쌀국수 맛집',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30,
      },
    ]);

    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.click(searchInput);
    await user.type(searchInput, '집에 가고싶다');

    expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '팀 회의',
        date: '2025-10-01',
        startTime: '08:30',
        endTime: '09:00',
        description: '회의 하기 싫어',
        location: '회사',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.click(searchInput);
    await user.type(searchInput, '팀 회의');

    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('팀 회의')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '팀 회의',
        date: '2025-10-01',
        startTime: '08:30',
        endTime: '09:00',
        description: '회의 하기 싫어',
        location: '회사',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '점심 약속',
        date: '2025-10-02',
        startTime: '12:30',
        endTime: '14:00',
        description: '쌀국수 먹어야지',
        location: '쌀국수 맛집',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30,
      },
      {
        id: '3',
        title: '야구 직관',
        date: '2025-10-10',
        startTime: '18:30',
        endTime: '21:00',
        description: 'KT 응원',
        location: '수원KT종합경기장',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30,
      },
    ]);

    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.click(searchInput);
    await user.clear(searchInput);

    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('팀 회의')).toBeInTheDocument();
    expect(await eventList.findByText('점심 약속')).toBeInTheDocument();
    expect(await eventList.findByText('야구 직관')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '팀 회의',
        date: '2025-10-01',
        startTime: '08:30',
        endTime: '09:00',
        description: '회의 하기 싫어',
        location: '회사',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: '부서 회의',
      date: '2025-10-01',
      startTime: '08:00',
      endTime: '10:00',
      description: '부서 회의',
      location: '회사',
      category: '업무',
    });

    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    setupMockHandlerUpdating();

    const { user } = setup(<App />);

    const editButtons = await screen.findAllByRole('button', { name: 'Edit event' });
    await user.click(editButtons[1]);
    await user.clear(screen.getByLabelText('시작 시간'));
    await user.type(screen.getByLabelText('시작 시간'), '08:00');
    await user.click(screen.getByTestId('event-submit-button'));

    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  setupMockHandlerCreation([
    {
      id: '1',
      title: '물 마시기',
      date: '2025-10-01',
      startTime: '00:10',
      endTime: '00:50',
      description: '물 마시기',
      location: '집',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ]);

  setup(<App />);
  // 일정이 로딩되어야 notification에 Id가 추가되고 setInterval이 실행되기 때문에 추가
  await screen.findByText('일정 로딩 완료!');
  expect(await screen.findByText('10분 후 물 마시기 일정이 시작됩니다.')).toBeInTheDocument();
});
