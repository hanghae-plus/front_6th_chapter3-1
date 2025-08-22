import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';

const theme = createTheme();

// ! HINT. 이 유틸을 사용해 리액트 컴포넌트를 렌더링해보세요.
// 앱을 받아서 렌더링 시켜주고 유저 이벤트 셋업
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

    await saveSchedule(user, {
      title: '기존 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
    });
    await user.click(screen.getByRole('button', { name: '일정 추가' }));

    expect(
      await screen.findByText('기존 회의', {
        selector: '[data-testid="event-list"] p',
      })
    ).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    setupMockHandlerUpdating();

    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');
    const editButtons = await screen.findAllByRole('button', { name: 'Edit event' });
    await user.click(editButtons[0]);

    const title = screen.getByLabelText('제목');
    await user.clear(title);
    await user.type(title, '룰루 난나');
    await user.click(screen.getByRole('button', { name: '일정 수정' }));

    expect(
      await screen.findByText('룰루 난나', {
        selector: '[data-testid="event-list"] p',
      })
    ).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion();

    const { user } = setup(<App />);
    const deleteButtons = await screen.findByRole('button', { name: 'Delete event' });
    await user.click(deleteButtons);

    expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    setupMockHandlerCreation();
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
        title: '기존 회의',
        date: '2025-10-03',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);
    await user.click(screen.getByLabelText('뷰 타입 선택'));
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    expect(
      await screen.findByText('기존 회의', {
        selector: '[data-testid="event-list"] p',
      })
    ).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '기존 회의',
        date: '2025-11-10',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);
    await user.click(screen.getByLabelText('뷰 타입 선택'));
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'month-option' }));

    expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '기존 회의',
        date: '2025-10-10',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);
    await user.click(screen.getByLabelText('뷰 타입 선택'));
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'month-option' }));

    expect(
      await screen.findByText('기존 회의', {
        selector: '[data-testid="event-list"] p',
      })
    ).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    const { user } = setup(<App />);
    const previousButton = await screen.findAllByRole('button', { name: 'Previous' });

    for (let i = 0; i < 9; i++) {
      await user.click(previousButton[0]);
    }

    expect(await screen.findByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: [] });
      })
    );

    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    const eventInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.click(eventInput);
    await user.type(eventInput, '팀 회의');

    expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: [
            {
              id: '1',
              title: '팀 회의',
              date: '2025-10-01',
              startTime: '09:00',
              endTime: '10:00',
              description: '팀 회의 설명',
              location: '회의실 B',
              category: '업무',
              repeat: { type: 'none', interval: 0 },
              notificationTime: 10,
            },
            {
              id: '2',
              title: '회의',
              date: '2025-10-01',
              startTime: '09:00',
              endTime: '10:00',
              description: '팀 회의 설명',
              location: '회의실 B',
              category: '업무',
              repeat: { type: 'none', interval: 0 },
              notificationTime: 10,
            },
          ] satisfies Event[],
        });
      })
    );

    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.click(searchInput);
    await user.type(searchInput, '팀 회의');

    expect(
      await screen.findByText('팀 회의', {
        selector: '[data-testid="event-list"] p',
      })
    ).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: [
            {
              id: '1',
              title: '팀 회의',
              date: '2025-10-01',
              startTime: '09:00',
              endTime: '10:00',
              description: '팀 회의 설명',
              location: '회의실 B',
              category: '업무',
              repeat: { type: 'none', interval: 0 },
              notificationTime: 10,
            },
            {
              id: '2',
              title: '회의',
              date: '2025-10-01',
              startTime: '09:00',
              endTime: '10:00',
              description: '팀 회의 설명',
              location: '회의실 B',
              category: '업무',
              repeat: { type: 'none', interval: 0 },
              notificationTime: 10,
            },
          ] satisfies Event[],
        });
      })
    );

    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.click(searchInput);
    await user.type(searchInput, '팀 회의');

    await screen.findByText('팀 회의', {
      selector: '[data-testid="event-list"] p',
    });

    await user.clear(searchInput);

    expect(
      await screen.findByText('회의', {
        exact: true,
        selector: '[data-testid="event-list"] p',
      })
    ).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: [
            {
              id: '1',
              title: '기존 일정',
              date: '2025-10-01',
              startTime: '09:00',
              endTime: '10:00',
              description: '팀 회의 설명',
              location: '회의실 B',
              category: '업무',
              repeat: { type: 'none', interval: 0 },
              notificationTime: 10,
            },
          ] satisfies Event[],
        });
      })
    );

    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');
    await saveSchedule(user, {
      title: '새 일정',
      date: '2025-10-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '새일정 미팅',
      location: '회의실 B',
      category: '업무',
    });

    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    setupMockHandlerUpdating();

    const { user } = setup(<App />);

    const editButtons = await screen.findAllByRole('button', { name: 'Edit event' });
    const startInput = screen.getByLabelText('시작 시간');
    const endInput = screen.getByLabelText('종료 시간');

    await user.click(editButtons[0]);

    expect(screen.getByRole('button', { name: '일정 수정' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('기존 회의')).toBeInTheDocument();

    await user.clear(startInput);
    await user.type(startInput, '11:00');
    await user.click(screen.getByRole('button', { name: '일정 수정' }));
    await user.clear(endInput);
    await user.type(endInput, '12:00');
    await user.click(screen.getByRole('button', { name: '일정 수정' }));

    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
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
  ]);

  vi.setSystemTime(new Date('2025-10-15T08:50:00'));
  setup(<App />);

  const eventList = within(screen.getByTestId('event-list'));
  expect(await eventList.findByText('기존 회의')).toBeInTheDocument();

  expect(await screen.findByText('10분 후 기존 회의 일정이 시작됩니다.')).toBeInTheDocument();
});
