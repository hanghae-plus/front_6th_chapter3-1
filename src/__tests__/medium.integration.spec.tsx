import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within, act, waitFor } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
// import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
// import { server } from '../setupTests';
import { Event } from '../types';

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

// ! HINT. "검색 결과가 없습니다"는 초기에 노출되는데요. 그럼 검증하고자 하는 액션이 실행되기 전에 검증해버리지 않을까요? 이 테스트를 신뢰성있게 만드려면 어떻게 할까요?
describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);

    const testEvent = {
      title: '신규 테스트 회의',
      date: '2025-10-05',
      startTime: '14:00',
      endTime: '15:00',
      location: '테스트 회의실',
      description: '테스트용 설명',
      category: '업무',
    };

    await saveSchedule(user, testEvent);
    await screen.findByText('일정이 추가되었습니다.');

    await waitFor(() => {
      expect(screen.queryByText('검색 결과가 없습니다')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(document.body.textContent).toContain('신규 테스트 회의');
    });
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    setupMockHandlerUpdating();
    const { user } = setup(<App />);

    await waitFor(() => {
      expect(screen.queryByText('검색 결과가 없습니다')).not.toBeInTheDocument();
    });

    const eventContainer = document.querySelector('[data-testid="event-list"]');
    const editButton = eventContainer?.querySelector('[aria-label="Edit event"]');
    await user.click(editButton as Element);
    await user.type(screen.getByLabelText('제목'), '기존 상품 회의');
    await user.click(screen.getByTestId('event-submit-button'));

    await waitFor(() => {
      expect(document.body.textContent).toContain('기존 상품 회의');
    });
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion();
    const { user } = setup(<App />);

    await waitFor(() => {
      expect(screen.queryByText('검색 결과가 없습니다')).not.toBeInTheDocument();
    });

    const eventContainer = document.querySelector('[data-testid="event-list"]');
    const deleteButton = eventContainer?.querySelector('[aria-label="Delete event"]');
    await user.click(deleteButton as Element);

    await waitFor(() => {
      expect(document.body.textContent).not.toContain('삭제할 이벤트');
    });
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    setupMockHandlerCreation([
      {
        title: '팀 회의',
        date: '2025-10-22',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
        id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      },
      {
        id: '09702fb3-a478-40b3-905e-9ab3c8849dcd',
        title: '점심 약속',
        date: '2025-10-29',
        startTime: '12:30',
        endTime: '13:30',
        description: '동료와 점심 식사',
        location: '회사 근처 식당',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ]);

    const { user } = setup(<App />);

    await waitFor(() => {
      expect(screen.queryByText('검색 결과가 없습니다')).not.toBeInTheDocument();
    });

    const viewSelector = screen.getByLabelText('뷰 타입 선택');
    await user.click(within(viewSelector).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    console.log(document.body.textContent);

    expect(screen.queryByText('2025년 10월 1주')).toBeInTheDocument();
    expect(document.body.textContent).toContain('결과가 없습니다.');
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    setupMockHandlerCreation([
      {
        title: '팀 회의',
        date: '2025-10-04',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
        id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      },
      {
        id: '09702fb3-a478-40b3-905e-9ab3c8849dcd',
        title: '점심 약속',
        date: '2025-10-20',
        startTime: '12:30',
        endTime: '13:30',
        description: '동료와 점심 식사',
        location: '회사 근처 식당',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ]);

    const { user } = setup(<App />);

    await waitFor(() => {
      expect(screen.queryByText('검색 결과가 없습니다')).not.toBeInTheDocument();
    });

    const viewSelector = screen.getByLabelText('뷰 타입 선택');
    await user.click(within(viewSelector).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    console.log(document.body.textContent);

    expect(screen.queryByText('2025년 10월 1주')).toBeInTheDocument();
    expect(screen.queryByText('2025-10-04')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    setupMockHandlerCreation();

    const {} = setup(<App />);

    await waitFor(() => {
      expect(screen.queryByText('검색 결과가 없습니다')).not.toBeInTheDocument();
    });

    console.log(document.body.textContent);

    expect(screen.queryByText('검색 결과가 없습니다')).not.toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    setupMockHandlerCreation([
      {
        title: '팀 회의',
        date: '2025-10-04',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
        id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      },
      {
        id: '09702fb3-a478-40b3-905e-9ab3c8849dcd',
        title: '점심 약속',
        date: '2025-10-20',
        startTime: '12:30',
        endTime: '13:30',
        description: '동료와 점심 식사',
        location: '회사 근처 식당',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ]);

    const {} = setup(<App />);

    await waitFor(() => {
      expect(screen.queryByText('검색 결과가 없습니다')).not.toBeInTheDocument();
    });

    expect(document.body.textContent).toContain('팀 회의');
    expect(document.body.textContent).toContain('점심 약속');
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);
    const prevButton = document?.querySelector('[aria-label="Previous"]');
    await user.click(prevButton as Element);
    await user.click(prevButton as Element);
    await user.click(prevButton as Element);
    await user.click(prevButton as Element);
    await user.click(prevButton as Element);
    await user.click(prevButton as Element);
    await user.click(prevButton as Element);
    await user.click(prevButton as Element);
    await user.click(prevButton as Element);

    expect(document.body.textContent).toContain('신정');
  });
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    const testEvent = {
      title: '기존 테스트 회의',
      date: '2025-10-08',
      startTime: '14:00',
      endTime: '15:00',
      location: '회의실',
      description: '오늘은 회의실에서 진행',
      category: '업무',
    };

    await saveSchedule(user, testEvent);

    await waitFor(() => {
      expect(document.body.textContent).toContain('기존 테스트 회의');
    });

    const eventContainer = document.querySelector('[data-testid="event-list"]');
    const searchInput = eventContainer?.querySelector('#search');

    await user.type(searchInput as Element, '운동');
    expect(screen.queryByText('검색 결과가 없습니다')).not.toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    setupMockHandlerCreation([
      {
        title: '팀 회의',
        date: '2025-10-08',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
        id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      },
      {
        id: '09702fb3-a478-40b3-905e-9ab3c8849dcd',
        title: '점심 약속',
        date: '2025-10-11',
        startTime: '12:30',
        endTime: '13:30',
        description: '동료와 점심 식사',
        location: '회사 근처 식당',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ]);
    const { user } = setup(<App />);

    await waitFor(() => {
      expect(screen.queryByText('검색 결과가 없습니다')).not.toBeInTheDocument();
    });

    const eventInput = screen.getByLabelText('일정 검색');
    await user.type(eventInput, '팀');

    // await user.type(searchInput as Element, '팀');
    console.log(document.body.textContent);

    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('팀 회의')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    setupMockHandlerCreation([
      {
        title: '팀 회의',
        date: '2025-10-08',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
        id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      },
      {
        id: '09702fb3-a478-40b3-905e-9ab3c8849dcd',
        title: '점심 약속',
        date: '2025-10-11',
        startTime: '12:30',
        endTime: '13:30',
        description: '동료와 점심 식사',
        location: '회사 근처 식당',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ]);
    const { user } = setup(<App />);

    await waitFor(() => {
      expect(screen.queryByText('검색 결과가 없습니다')).not.toBeInTheDocument();
    });

    const eventInput = screen.getByLabelText('일정 검색');
    await user.type(eventInput, '점심');

    expect(screen.queryByText('주간 팀 미팅')).not.toBeInTheDocument();

    await user.clear(eventInput);

    expect(screen.queryByText('주간 팀 미팅')).toBeInTheDocument();
    expect(screen.queryByText('동료와 점심')).not.toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    setupMockHandlerUpdating();
    const { user } = setup(<App />);

    await waitFor(() => {
      expect(screen.queryByText('검색 결과가 없습니다')).not.toBeInTheDocument();
    });

    const testEvent = {
      title: '신규 테스트 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      location: '테스트 회의실',
      description: '테스트용 설명',
      repeat: { type: 'none', interval: 0 },
      category: '업무',
    };

    await saveSchedule(user, testEvent);

    expect(screen.queryByText('일정과 겹칩니다')).not.toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    setupMockHandlerUpdating();
    const { user } = setup(<App />);

    await waitFor(() => {
      expect(screen.queryByText('검색 결과가 없습니다')).not.toBeInTheDocument();
    });

    const eventContainer = document.querySelector('[data-testid="event-list"]');
    const editButton = eventContainer?.querySelector('[aria-label="Edit event"]');
    await user.click(editButton as Element);
    await user.type(screen.getByLabelText('시작 시간'), '11:00');
    await user.type(screen.getByLabelText('종료 시간'), '12:00');

    expect(screen.queryByText('일정과 겹칩니다')).not.toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  setupMockHandlerCreation([
    {
      title: '신규 테스트 회의',
      date: '2025-10-18',
      startTime: '14:00',
      endTime: '15:00',
      location: '테스트 회의실',
      description: '테스트용 설명',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    } as Event,
  ]);

  setup(<App />);

  await waitFor(() => {
    expect(screen.queryByText('검색 결과가 없습니다')).not.toBeInTheDocument();
  });

  console.log(document.body.textContent);

  vi.setSystemTime(new Date('2025-10-18T113:51:00'));

  expect(document.body.textContent).toContain('알림: 10분 전');
});
