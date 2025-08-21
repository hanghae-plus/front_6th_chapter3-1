import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';
// import { debug } from 'vitest-preview';

import {
  setupMockHandlerCreation,
  setupMockHandlerUpdating,
  setupMockHandlerDeletion,
} from '../__mocks__/handlersUtils';
import App from '../App';
import type { Event } from '../types';

// ! HINT. 이 유틸을 사용해 리액트 컴포넌트를 렌더링해보세요.
const setup = (element: ReactElement) => {
  const theme = createTheme();
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

const updateSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'>
) => {
  const { title, date, startTime, endTime, location, description, category } = form;

  const [editButton] = await screen.findAllByLabelText('Edit event');
  await user.click(editButton);

  await user.clear(screen.getByLabelText('제목'));
  await user.type(screen.getByLabelText('제목'), title);

  await user.clear(screen.getByLabelText('날짜'));
  await user.type(screen.getByLabelText('날짜'), date);

  await user.clear(screen.getByLabelText('시작 시간'));
  await user.type(screen.getByLabelText('시작 시간'), startTime);

  await user.clear(screen.getByLabelText('종료 시간'));
  await user.type(screen.getByLabelText('종료 시간'), endTime);

  await user.clear(screen.getByLabelText('설명'));
  await user.type(screen.getByLabelText('설명'), description);

  await user.clear(screen.getByLabelText('위치'));
  await user.type(screen.getByLabelText('위치'), location);

  await user.click(screen.getByLabelText('카테고리'));
  await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
  await user.click(screen.getByRole('option', { name: `${category}-option` }));

  await user.click(screen.getByTestId('event-submit-button'));
};

// ! HINT. "검색 결과가 없습니다"는 초기에 노출되는데요. 그럼 검증하고자 하는 액션이 실행되기 전에 검증해버리지 않을까요? 이 테스트를 신뢰성있게 만드려면 어떻게 할까요?
describe.only('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    setupMockHandlerCreation();

    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    const { user } = setup(<App />);
    const eventList = within(screen.getByTestId('event-list'));

    expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    await screen.findByText('일정 로딩 완료!');

    await saveSchedule(user, {
      title: '새로운 회의',
      date: '2025-10-15',
      startTime: '15:00',
      endTime: '16:00',
      description: '새로운 회의 입니다',
      location: '회의실 3-1',
      category: '업무',
    });

    await screen.findByText('일정이 추가되었습니다.');

    expect(eventList.getByText('새로운 회의')).toBeInTheDocument();
    expect(eventList.getByText('2025-10-15')).toBeInTheDocument();
    expect(eventList.getByText('15:00 - 16:00')).toBeInTheDocument();
    expect(eventList.getByText('새로운 회의 입니다')).toBeInTheDocument();
    expect(eventList.getByText('회의실 3-1')).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    setupMockHandlerUpdating();

    const { user } = setup(<App />);
    const eventList = within(screen.getByTestId('event-list'));

    expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    await screen.findByText('일정 로딩 완료!');
    expect(eventList.getByText('기존 회의')).toBeInTheDocument();

    await updateSchedule(user, {
      title: '수정된 회의',
      date: '2025-10-20',
      startTime: '14:00',
      endTime: '15:30',
      description: '수정된 회의 내용입니다',
      location: '수정된 회의실',
      category: '개인',
    });

    await screen.findByText('일정이 수정되었습니다.');

    expect(eventList.getByText('수정된 회의')).toBeInTheDocument();
    expect(eventList.getByText('2025-10-20')).toBeInTheDocument();
    expect(eventList.getByText('14:00 - 15:30')).toBeInTheDocument();
    expect(eventList.getByText('수정된 회의 내용입니다')).toBeInTheDocument();
    expect(eventList.getByText('수정된 회의실')).toBeInTheDocument();
    expect(eventList.queryByText('기존 회의')).not.toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion();

    const { user } = setup(<App />);
    const eventList = within(screen.getByTestId('event-list'));

    expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    await screen.findByText('일정 로딩 완료!');
    expect(eventList.getByText('삭제할 이벤트')).toBeInTheDocument();

    const [deleteButton] = await screen.findAllByLabelText('Delete event');
    await user.click(deleteButton);
    await screen.findByText('일정이 삭제되었습니다.');

    expect(eventList.queryByText('삭제할 이벤트')).not.toBeInTheDocument();
  });
});

describe.only('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    const select = screen.getByLabelText('뷰 타입 선택');
    const combobox = within(select).getByRole('combobox');
    await user.click(combobox);
    await user.click(screen.getByLabelText('week-option'));

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    setupMockHandlerCreation([
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
    ] satisfies Event[]);
    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    const select = screen.getByLabelText('뷰 타입 선택');
    const combobox = within(select).getByRole('combobox');
    await user.click(combobox);
    await user.click(screen.getByLabelText('week-option'));

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('기존 회의')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    const select = screen.getByLabelText('뷰 타입 선택');
    const combobox = within(select).getByRole('combobox');
    await user.click(combobox);
    await user.click(screen.getByLabelText('month-option'));
    expect(screen.getByTestId('month-view')).toBeInTheDocument();

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '월별 뷰 테스트 일정',
        date: '2025-10-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '월별 뷰에서 표시될 일정',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '월별 뷰 테스트 일정2',
        date: '2025-10-20',
        startTime: '10:00',
        endTime: '11:00',
        description: '두 번째 일정',
        location: '회의실 B',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 5,
      },
    ] satisfies Event[]);
    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    const select = screen.getByLabelText('뷰 타입 선택');
    const combobox = within(select).getByRole('combobox');
    await user.click(combobox);
    await user.click(screen.getByLabelText('month-option'));
    expect(screen.getByTestId('month-view')).toBeInTheDocument();

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('월별 뷰 테스트 일정')).toBeInTheDocument();
    expect(eventList.getByText('월별 뷰 테스트 일정2')).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    setupMockHandlerCreation();
    vi.setSystemTime(new Date('2025-01-01'));
    setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    const monthView = within(await screen.findByTestId('month-view'));
    expect(monthView.getByText('신정')).toBeInTheDocument();
  });
});

describe.only('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    setupMockHandlerUpdating();
    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    const input = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(input, '존재하지 않는 일정');

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    setupMockHandlerUpdating();
    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    const input = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(input, '회의');

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('기존 회의')).toBeInTheDocument();
    expect(eventList.getByText('기존 회의2')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    setupMockHandlerUpdating();
    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    const input = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(input, '기존 회의2');

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.queryByText('기존 회의')).not.toBeInTheDocument();
    expect(eventList.getByText('기존 회의2')).toBeInTheDocument();

    await user.clear(input);

    expect(eventList.getByText('기존 회의')).toBeInTheDocument();
    expect(eventList.getByText('기존 회의2')).toBeInTheDocument();
  });
});

describe.only('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    setupMockHandlerCreation([
      {
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
    ] satisfies Event[]);
    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    await saveSchedule(user, {
      title: '충돌 일정',
      date: '2025-10-15',
      startTime: '09:30',
      endTime: '10:30',
      description: '겹치는 시간 테스트',
      location: '회의실',
      category: '업무',
    });

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    setupMockHandlerUpdating();
    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    await updateSchedule(user, {
      title: '기존 회의',
      date: '2025-10-15',
      startTime: '11:30',
      endTime: '12:30',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
    });

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  setupMockHandlerCreation();

  const { user } = setup(<App />);

  await screen.findByText('일정 로딩 완료!');

  // 10분 후 시간으로 일정 생성 (현재 시간이 2025-10-01 00:00:00)
  await saveSchedule(user, {
    title: '알림 테스트 일정',
    date: '2025-10-01',
    startTime: '00:10', // 현재 시간으로부터 10분 후
    endTime: '00:30',
    description: '알림 테스트',
    location: '어딘가',
    category: '개인',
  });

  await screen.findByText('일정이 추가되었습니다.');

  // 알림 텍스트가 나타날 때까지 대기 (notificationTime이 10분이므로 즉시 알림이 떠야 함)
  expect(
    await screen.findByText('10분 후 알림 테스트 일정 일정이 시작됩니다.')
  ).toBeInTheDocument();
});
