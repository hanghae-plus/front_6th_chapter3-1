import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within, waitFor } from '@testing-library/react';
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
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    const newEvent = {
      title: '새로운 회의',
      date: '2025-10-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    await saveSchedule(user, newEvent);
    await screen.findByText('일정 로딩 완료!');

    await waitFor(() => {
      expect(screen.queryByText('검색 결과가 없습니다')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(document.body.textContent).toContain('일정이 추가되었습니다.');
    });

    await screen.findByText('일정 로딩 완료!');

    expect(document.body.textContent).toContain(newEvent.title);
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    setupMockHandlerUpdating();

    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    // 기존 이벤트가 있는지 확인
    await waitFor(() => {
      expect(screen.queryByText('검색 결과가 없습니다')).not.toBeInTheDocument();
      expect(document.body.textContent).toContain('기존 회의');
    });

    // 기존 이벤트 수정 - 필수로 1개의 이벤트는 있음
    const editButton = document.querySelector('[aria-label="Edit event"]');
    await user.click(editButton!);

    const title = screen.getByLabelText('제목');
    await user.click(title);
    await user.type(screen.getByLabelText('제목'), '수정된 회의');
    await user.click(screen.getByTestId('event-submit-button'));

    await waitFor(() => {
      expect(document.body.textContent).toContain('일정이 수정되었습니다.');
    });

    await screen.findByText('일정 로딩 완료!');

    expect(document.body.textContent).toContain('수정된 회의');
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion();

    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    // 기존 이벤트가 있는지 확인
    await waitFor(() => {
      expect(screen.queryByText('검색 결과가 없습니다')).not.toBeInTheDocument();
      expect(document.body.textContent).toContain('삭제할 이벤트');
    });

    await user.click(screen.getByLabelText('Delete event'));

    await waitFor(() => {
      expect(document.body.textContent).toContain('일정이 삭제되었습니다.');
    });

    await screen.findByText('일정 로딩 완료!');

    expect(screen.queryByText('기존 회의')).not.toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '주간 회의',
        date: '2025-10-06', // 10월 2주
        startTime: '09:00',
        endTime: '10:00',
        description: '팀 주간 회의',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    expect(screen.queryByText('2025년 10월 1주')).toBeInTheDocument();
    expect(document.body.textContent).toContain('결과가 없습니다.');
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '주간 회의',
        date: '2025-10-06', // 10월 2주
        startTime: '09:00',
        endTime: '10:00',
        description: '팀 주간 회의',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    expect(screen.queryByText('2025년 10월 1주')).toBeInTheDocument();
    expect(document.body.textContent).toContain('주간 회의');
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');
    await screen.findByText('검색 결과가 없습니다.');

    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'month-option' }));

    expect(screen.queryByText('2025년 10월')).toBeInTheDocument();

    expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '주간 회의',
        date: '2025-10-06',
        startTime: '09:00',
        endTime: '10:00',
        description: '팀 주간 회의',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');
    expect(screen.queryByText('검색 결과가 없습니다.')).not.toBeInTheDocument();

    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'month-option' }));

    expect(screen.queryByText('2025년 10월')).toBeInTheDocument();
    expect(document.body.textContent).toContain('주간 회의');
    expect(document.body.textContent).toContain('2025-10-06');
    expect(document.body.textContent).toContain('09:00 - 10:00');
    expect(document.body.textContent).toContain('팀 주간 회의');
    expect(document.body.textContent).toContain('회의실 B');
    expect(document.body.textContent).toContain('업무');
    expect(document.body.textContent).toContain('알림: 10분 전');
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    const prevButton = screen.getByLabelText('Previous');

    for (let i = 0; i < 9; i++) {
      await user.click(prevButton);
    }

    await screen.findByText('일정 로딩 완료!');
    expect(document.body.textContent).toContain('신정');
  });
});

describe('검색 기능', () => {
  it('등록된 일정이 없을 때 검색 후 해당하는 검색 결과가 없으면 "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    expect(screen.queryByText('검색 결과가 없습니다.')).toBeInTheDocument();

    await user.click(screen.getByPlaceholderText('검색어를 입력하세요'));
    await user.type(screen.getByPlaceholderText('검색어를 입력하세요'), '회의');

    expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('등록된 일정이 있을 때 검색 후 해당하는 검색 결과가 없으면 "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '주간 회의',
        date: '2025-10-06',
        startTime: '09:00',
        endTime: '10:00',
        description: '팀 주간 회의',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    expect(screen.queryByText('검색 결과가 없습니다.')).not.toBeInTheDocument();

    await user.click(screen.getByPlaceholderText('검색어를 입력하세요'));
    await user.type(screen.getByPlaceholderText('검색어를 입력하세요'), '식사');

    expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('등록된 일정이 있을 때 검색 후 해당 제목을 가진 일정이 리스트에 노출된다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '주간 회의',
        date: '2025-10-06',
        startTime: '09:00',
        endTime: '10:00',
        description: '팀 주간 회의1',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '점심 식사',
        date: '2025-10-06',
        startTime: '12:00',
        endTime: '13:00',
        description: '점심 먹자',
        location: '사내 식당',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '주간 회의',
        date: '2025-10-12',
        startTime: '09:00',
        endTime: '10:00',
        description: '팀 주간 회의2',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    expect(document.body.textContent).toContain('주간 회의');
    expect(document.body.textContent).toContain('점심 식사');
    expect(screen.queryByText('점심 먹자')).toBeInTheDocument();
    expect(screen.queryByText('검색 결과가 없습니다.')).not.toBeInTheDocument();

    await user.click(screen.getByPlaceholderText('검색어를 입력하세요'));
    await user.type(screen.getByPlaceholderText('검색어를 입력하세요'), '주간 회의');

    expect(screen.queryByText('검색 결과가 없습니다.')).not.toBeInTheDocument();
    expect(screen.queryByText('점심 먹자')).not.toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '주간 회의',
        date: '2025-10-06',
        startTime: '09:00',
        endTime: '10:00',
        description: '팀 주간 회의1',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '점심 식사',
        date: '2025-10-06',
        startTime: '12:00',
        endTime: '13:00',
        description: '점심 먹자',
        location: '사내 식당',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '주간 회의',
        date: '2025-10-12',
        startTime: '09:00',
        endTime: '10:00',
        description: '팀 주간 회의2',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.click(searchInput);
    await user.type(searchInput, '식사');
    expect(screen.queryByText('점심 먹자')).toBeInTheDocument();
    expect(screen.queryByText('팀 주간 회의1')).not.toBeInTheDocument();
    expect(screen.queryByText('팀 주간 회의2')).not.toBeInTheDocument();

    await user.clear(searchInput);
    expect(screen.queryByText('점심 먹자')).toBeInTheDocument();
    expect(screen.queryByText('팀 주간 회의1')).toBeInTheDocument();
    expect(screen.queryByText('팀 주간 회의2')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '기존 회의',
        date: '2025-10-06',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    const newEvent = {
      title: '새로운 회의',
      date: '2025-10-06',
      startTime: '09:30',
      endTime: '10:30',
      description: '새로운 팀 미팅',
      location: '회의실 D',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    await saveSchedule(user, newEvent);

    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    setupMockHandlerUpdating();

    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    const editButton = document.querySelector('[aria-label="Edit event"]');
    await user.click(editButton!);

    const startTime = screen.getByLabelText('시작 시간');
    const endTime = screen.getByLabelText('종료 시간');
    await user.clear(startTime);
    await user.type(startTime, '11:30');
    await user.clear(endTime);
    await user.type(endTime, '12:30');
    await user.click(screen.getByTestId('event-submit-button'));

    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
  });
});

describe('알림 기능', () => {
  it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
    vi.setSystemTime(new Date('2025-10-06T08:50:00Z'));

    setupMockHandlerCreation([
      {
        id: '1',
        title: '기존 회의',
        date: '2025-10-06',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    await waitFor(() => {
      expect(document.body.textContent).toContain('10분 후 기존 회의 일정이 시작됩니다.');
    });
  });

  it('회의 일정에 맞춰 알람 텍스트가 노출되면 해당 일정 제목에 아이콘이 표시된다.', async () => {
    vi.setSystemTime(new Date('2025-10-06T08:50:00Z'));

    setupMockHandlerCreation([
      {
        id: '1',
        title: '기존 회의',
        date: '2025-10-06',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    await waitFor(() => {
      expect(document.body.textContent).toContain('10분 후 기존 회의 일정이 시작됩니다.');
    });

    const eventList = screen.getByTestId('event-list');
    const notificationIcon = within(eventList).getByTestId('NotificationsIcon');
    expect(notificationIcon).toBeInTheDocument();
  });

  it('지난 일정에 대해서는 알람 텍스트가 노출되지 않는다.', async () => {
    vi.setSystemTime(new Date('2025-10-06T09:01:00Z'));

    setupMockHandlerCreation([
      {
        id: '1',
        title: '기존 회의',
        date: '2025-10-06',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    const eventList = screen.getByTestId('event-list');
    const notificationIcon = within(eventList).queryByTestId('NotificationsIcon');
    expect(notificationIcon).not.toBeInTheDocument();
    expect(screen.queryByText('10분 후 기존 회의 일정이 시작됩니다.')).not.toBeInTheDocument();
  });
});
