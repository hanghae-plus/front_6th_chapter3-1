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
import { debug } from 'vitest-preview';
import { expect } from 'vitest';

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
    const newEventData = {
      title: '뉴 이벤트',
      date: '2025-10-01',
      startTime: '00:00',
      endTime: '11:00',
      location: '회의실 A',
      description: '중요한 회의',
      category: '업무',
    };
    await saveSchedule(user, newEventData);
    // 일정 추가 알람 확인
    expect(await screen.findByText('일정이 추가되었습니다.')).toBeInTheDocument();

    // event-list 안에 추가된 요소를 찾자
    const targetList = within(await screen.getByTestId('event-list'));
    expect(targetList.getByText('뉴 이벤트')).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    setupMockHandlerUpdating();

    const { user } = setup(<App />);

    // 첫번째 이벤트 리스트의 수정 버튼을 클릭
    const editButton = await screen.findAllByRole('button', { name: 'Edit event' });

    await user.click(editButton[0]);
    // 수정 폼 버튼이 일정 수정으로 변경됨을 확인 검증
    expect(screen.getByRole('button', { name: '일정 수정' })).toBeInTheDocument();

    // 수정할 제목 내용 확인
    expect(screen.getByDisplayValue('기존 회의')).toBeInTheDocument();
    // 수정 하기
    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '수정된 회의');
    await user.click(screen.getByRole('button', { name: '일정 수정' }));

    // event-list 안에 추가된 요소를 찾자
    const targetList = within(await screen.getByTestId('event-list'));

    expect(targetList.getByText('수정된 회의')).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion();
    const { user } = setup(<App />);
    const deleteButton = await screen.findAllByRole('button', { name: 'Delete event' });

    await user.click(deleteButton[0]);
    expect(await screen.findByText('일정이 삭제되었습니다.')).toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    const { user } = setup(<App />);
    const selectElement = screen.getByLabelText('뷰 타입 선택');
    // 순서대로 div -> ul -> li 이렇게
    await user.click(selectElement);
    await user.click(within(selectElement).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: `week-option` }));

    const targetList = within(await screen.getByTestId('event-list'));
    expect(targetList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: [
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
          ],
        });
      })
    );

    const { user } = setup(<App />);
    const selectElement = screen.getByLabelText('뷰 타입 선택');
    // 순서대로 div -> ul -> li 이렇게
    await user.click(selectElement);
    await user.click(within(selectElement).getByRole('combobox'));
    debug();
    await user.click(screen.getByRole('option', { name: `week-option` }));

    const targetList = within(await screen.getByTestId('event-list'));
    debug();
    expect(targetList.getByText('기존 회의')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: [] });
      })
    );
    const { user } = setup(<App />);
    const selectElement = screen.getByLabelText('뷰 타입 선택');
    // 순서대로 div -> ul -> li 이렇게
    await user.click(selectElement);
    await user.click(within(selectElement).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: `month-option` }));

    const targetList = within(await screen.getByTestId('event-list'));
    expect(targetList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: [
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
          ],
        });
      })
    );

    const { user } = setup(<App />);
    const selectElement = screen.getByLabelText('뷰 타입 선택');
    // 순서대로 div -> ul -> li 이렇게
    await user.click(selectElement);
    await user.click(within(selectElement).getByRole('combobox'));

    await user.click(screen.getByRole('option', { name: `month-option` }));

    const targetList = within(await screen.getByTestId('event-list'));
    expect(targetList.getByText('기존 회의')).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    const { user } = setup(<App />);
    const prevButton = screen.getByRole('button', { name: 'Previous' });
    // 최대 누른 횟수
    let maxAttempts = 12;

    for (let i = 0; i < maxAttempts; i++) {
      // 신정이 나오면 멈춤
      if (screen.queryByText('신정')) {
        break;
      }
      // 버튼을 최대한 눌러봐~
      await user.click(prevButton);
    }

    debug();
    expect(screen.getByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: [],
        });
      })
    );
    const { user } = setup(<App />);

    // 인풋 부터 찾자
    const inputElement = screen.getByPlaceholderText('검색어를 입력하세요');

    await user.click(inputElement);
    await user.type(inputElement, '회의');

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
              date: '2025-10-15',
              startTime: '09:00',
              endTime: '10:00',
              description: '기존 팀 미팅',
              location: '회의실 B',
              category: '업무',
              repeat: { type: 'none', interval: 0 },
              notificationTime: 10,
            },
          ],
        });
      })
    );
    const { user } = setup(<App />);

    // 인풋 부터 찾자
    const inputElement = screen.getByPlaceholderText('검색어를 입력하세요');

    await user.click(inputElement);
    await user.type(inputElement, '팀 회의');

    const targetList = within(await screen.getByTestId('event-list'));
    expect(targetList.getByText('팀 회의')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: [
            {
              id: '1',
              title: '팀 회의',
              date: '2025-10-15',
              startTime: '09:00',
              endTime: '10:00',
              description: '기존 팀 미팅',
              location: '회의실 B',
              category: '업무',
              repeat: { type: 'none', interval: 0 },
              notificationTime: 10,
            },
            {
              id: '2',
              title: '팀 회의2',
              date: '2025-10-15',
              startTime: '09:00',
              endTime: '10:00',
              description: '기존 팀 미팅',
              location: '회의실 B',
              category: '업무',
              repeat: { type: 'none', interval: 0 },
              notificationTime: 10,
            },
          ],
        });
      })
    );
    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');

    await user.click(searchInput);

    await user.type(searchInput, '팀 회의');

    await user.clear(searchInput);

    const targetList = within(await screen.getByTestId('event-list'));

    expect(targetList.getByText('팀 회의')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '팀 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '팀 회의2',
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

    const { user } = setup(<App />);
    const newEventData = {
      title: '뉴 이벤트',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
    };
    await saveSchedule(user, newEventData);

    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    setupMockHandlerUpdating();
    const { user } = setup(<App />);

    // 첫번째 이벤트 리스트의 수정 버튼을 클릭
    const editButton = await screen.findAllByRole('button', { name: 'Edit event' });

    await user.click(editButton[0]);
    // 수정 폼 버튼이 일정 수정으로 변경됨을 확인 검증
    expect(screen.getByRole('button', { name: '일정 수정' })).toBeInTheDocument();

    // 수정할 제목 내용 확인
    expect(screen.getByDisplayValue('기존 회의')).toBeInTheDocument();
    // 수정 하기
    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '수정된 회의');
    await user.clear(screen.getByLabelText('시작 시간'));
    await user.type(screen.getByLabelText('시작 시간'), '11:00');
    await user.clear(screen.getByLabelText('종료 시간'));
    await user.type(screen.getByLabelText('종료 시간'), '12:00');
    await user.click(screen.getByRole('button', { name: '일정 수정' }));

    // event-list 안에 추가된 요소를 찾자
    debug();
    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  setupMockHandlerCreation([
    {
      id: '1',
      title: '기존 회의',
      date: '2025-10-01',
      startTime: '00:10',
      endTime: '01:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ]);
  setup(<App />);

  await screen.findByText('일정 로딩 완료!');

  expect(await screen.findByText(/일정이 시작됩니다/)).toBeInTheDocument();
});
