import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within, act } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import { debug } from 'vitest-preview';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerSearch,
  setupMockHandlerUpdating,
  setupMockHandlerWeeklyView,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';
import { L } from 'vitest/dist/chunks/reporters.d.BFLkQcL6.js';

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

const updateSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'>
) => {
  const { title, date, startTime, endTime, location, description, category } = form;
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

  await user.click(screen.getByRole('button', { name: /일정 수정/ }));
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

    // 일정 저장 후 화면에 표시되는걸 확인
    const eventTitle = await screen.findAllByText(/기존 회의/);

    expect(eventTitle[0]).toBeInTheDocument();

    // 나머지는 이미 화면에 표시되었으니 getByText로 바로 확인
    expect(screen.getByText(/2025-10-15/)).toBeInTheDocument();
    expect(screen.getByText(/09:00/)).toBeInTheDocument();
    expect(screen.getByText(/10:00/)).toBeInTheDocument();
    expect(screen.getByText(/기존 팀 미팅/)).toBeInTheDocument();
    expect(screen.getByText(/회의실 B/)).toBeInTheDocument();
    expect(screen.getByText(/카테고리: 업무/)).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    // 일정이 존재하는 모킹 생성
    setupMockHandlerUpdating();
    const { user } = setup(<App />);

    // 화면에 이벤트가 존재하는지 확인
    await screen.findAllByText(/기존 회의/);

    // 수정할 이벤트의 수정 버튼 찾기
    const editIcon = screen.getAllByTestId('EditIcon');
    const editButton = editIcon[0].closest('button');

    // 수정 버튼이 존재하는지 확인 후 클릭
    expect(editButton).toBeInTheDocument();
    await user.click(editButton!);

    // 수정 폼의 모든 필드를 수정 후 저장
    await updateSchedule(user, {
      title: '수정 된 회의',
      date: '2025-10-16',
      startTime: '10:00',
      endTime: '13:00',
      description: '수정 된 회의 설명',
      location: '수정 된 회의 위치',
      category: '개인',
    });

    // 수정 후 화면에 표시되는걸 확인
    await screen.findAllByText(/수정 된 회의/);

    // 나머지는 이미 화면에 표시되었으니 getByText로 바로 확인
    expect(screen.getByText(/2025-10-16/)).toBeInTheDocument();
    expect(screen.getByText(/10:00/)).toBeInTheDocument();
    expect(screen.getByText(/13:00/)).toBeInTheDocument();
    expect(screen.getByText(/수정 된 회의 설명/)).toBeInTheDocument();
    expect(screen.getByText(/수정 된 회의 위치/)).toBeInTheDocument();
    expect(screen.getByText(/카테고리: 개인/)).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion();
    const { user } = setup(<App />);

    // 목 데이터 있는지 확인
    await screen.findAllByText(/삭제할 이벤트/);

    // 삭제할 이벤트의 삭제 버튼 찾기
    const deleteIcon = screen.getAllByTestId('DeleteIcon');
    const deleteButton = deleteIcon[0].closest('button');

    // 삭제 버튼이 존재하는지 확인 후 클릭
    expect(deleteButton).toBeInTheDocument();
    await user.click(deleteButton!);

    // 삭제 후 화면에 없는지 확인
    expect(screen.queryByText(/삭제할 이벤트/)).not.toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  // 목 데이터에 10-01, 10-15, 11-01 일정이 있음
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    // 주 별 뷰 데이터 모킹
    setupMockHandlerWeeklyView();
    const { user } = setup(<App />);

    // 목 데이터 있는지 확인
    await screen.findAllByText(/다른 주 일정/);

    // 월 별 뷰 선택
    const comboboxes = screen.getAllByRole('combobox');
    const monthCombobox = comboboxes.find((combobox) => combobox.textContent === 'Month');
    expect(monthCombobox).toBeInTheDocument();
    await user.click(monthCombobox!);

    // QUESTION : option이 portal로 열리는데 어떻게 <App/>컴포넌트만 가져온 테스팅 라이브러리가 해당 옵션을 찾을 수 있는 걸까요???

    // 주 별 뷰 선택
    await screen.findAllByText(/week/i);
    await user.click(screen.getByRole('option', { name: /week/i }));

    // 일정이 사라졌는지 확인
    expect(screen.queryByText(/다른 주 일정/)).not.toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    // 주 별 뷰 데이터 모킹
    setupMockHandlerWeeklyView();
    const { user } = setup(<App />);

    // 목 데이터 있는지 확인
    await screen.findAllByText(/첫 주 일정/);

    // 월 별 뷰 선택
    const comboboxes = screen.getAllByRole('combobox');
    const monthCombobox = comboboxes.find((combobox) => combobox.textContent === 'Month');
    expect(monthCombobox).toBeInTheDocument();
    await user.click(monthCombobox!);

    // 주 별 뷰 선택
    await screen.findAllByText(/week/i);
    await user.click(screen.getByRole('option', { name: /week/i }));

    // 해당하는 일정 그대로 있는지 확인
    expect(screen.getAllByText(/첫 주 일정/)).toHaveLength(2);
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    setupMockHandlerWeeklyView();
    setup(<App />);

    // 목 데이터 있는지 확인
    await screen.findAllByText(/첫 주 일정/);

    // 월 뷰 인지 확인
    const comboboxes = screen.getAllByRole('combobox');
    const monthCombobox = comboboxes.find((combobox) => combobox.textContent === 'Month');
    expect(monthCombobox).toBeInTheDocument();

    // 월 뷰에 11월 일정이 있는지 확인
    expect(screen.queryByText(/11월 일정/)).not.toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    setupMockHandlerWeeklyView();
    setup(<App />);

    // 목 데이터 있는지 확인
    await screen.findAllByText(/첫 주 일정/);

    // 월 뷰 인지 확인
    const comboboxes = screen.getAllByRole('combobox');
    const monthCombobox = comboboxes.find((combobox) => combobox.textContent === 'Month');
    expect(monthCombobox).toBeInTheDocument();

    // 월 뷰에 10월 일정 두 개(1일, 15일) 있는지 확인
    expect(screen.getAllByText(/첫 주 일정/)).toHaveLength(2);
    expect(screen.getAllByText(/다른 주 일정/)).toHaveLength(2);
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    // QUESTION : vi.setSystemTime으로 1월을 설정해도 잘 되는것을 확인하였는데, 통합테스트에서는 유저의 사용을 확인하는 것이므로 직접 수정하지 않고 버튼을 눌러서 가야 할까요..?

    const { user } = setup(<App />);

    await screen.findAllByText(/일정 보기/);

    // 이전 버튼 찾기
    const prevButton = screen.getByRole('button', { name: /Previous/i });
    expect(prevButton).toBeInTheDocument();
    console.log(prevButton);

    // 이전 버튼 9번 클릭
    for (let i = 0; i < 9; i++) {
      await user.click(prevButton);
    }

    // 신정 텍스트 확인
    expect(screen.getByText(/신정/)).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    setupMockHandlerSearch();
    const { user } = setup(<App />);

    // 목 데이터 있는지 확인
    const events = await screen.findAllByText(/기존 회의/);
    expect(events).toHaveLength(2);

    // 검색어 입력
    const searchInput = screen.getByLabelText(/일정 검색/);
    expect(searchInput).toBeInTheDocument();
    await user.clear(searchInput);
    await user.type(searchInput, '없을만한검색어');

    // 검색 결과 없는지 확인
    expect(await screen.findByText(/검색 결과가 없습니다/)).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    setupMockHandlerSearch();
    const { user } = setup(<App />);

    // 목 데이터 있는지 확인
    const events = await screen.findAllByText(/기존 회의/);
    expect(events).toHaveLength(2);

    // 검색어 입력
    const searchInput = screen.getByLabelText(/일정 검색/);
    expect(searchInput).toBeInTheDocument();
    await user.clear(searchInput);
    await user.type(searchInput, '팀 회의');

    // 검색 결과 확인
    expect(await screen.findAllByText(/팀 회의/)).toHaveLength(2);
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    setupMockHandlerSearch();
    const { user } = setup(<App />);

    // 목 데이터 있는지 확인
    const events = await screen.findAllByText(/기존 회의/);
    expect(events).toHaveLength(2);

    // 검색어 입력
    const searchInput = screen.getByLabelText(/일정 검색/);
    expect(searchInput).toBeInTheDocument();
    await user.clear(searchInput);
    await user.type(searchInput, '팀 회의');

    // 검색 결과 확인
    expect(await screen.findAllByText(/팀 회의/)).toHaveLength(2);

    // 검색어 지우기
    await user.clear(searchInput);

    // 검색 결과 확인
    expect(await screen.findAllByText(/기존 회의/)).toHaveLength(2);
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    setupMockHandlerUpdating();
    const { user } = setup(<App />);

    // 목 데이터 있는지 확인
    const events = await screen.findAllByText(/기존 회의/);
    expect(events).toHaveLength(4);

    // 일정 추가
    await saveSchedule(user, {
      title: '새 회의',
      date: '2025-10-15',
      startTime: '09:00', // '기존 회의' 와 시간 겹침
      endTime: '12:00',
      description: '새 팀 미팅',
      location: '회의실 C',
      category: '업무',
    });

    // '일정 겹침 경고' 문구 확인
    expect(await screen.findByText(/일정 겹침 경고/)).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    setupMockHandlerUpdating();
    const { user } = setup(<App />);

    // 목 데이터 있는지 확인
    const events = await screen.findAllByText(/기존 회의/);
    expect(events).toHaveLength(4);

    // 수정할 이벤트의 수정 버튼 찾기
    const editIcon = screen.getAllByTestId('EditIcon');
    const editButton = editIcon[0].closest('button');

    // 수정 버튼이 존재하는지 확인 후 클릭
    expect(editButton).toBeInTheDocument();
    await user.click(editButton!);

    // 일정 수정
    await updateSchedule(user, {
      title: '수정 회의',
      date: '2025-10-15',
      startTime: '11:00', // 겹치는 시간
      endTime: '12:00', // 겹치는 시간
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
    });

    // '일정 겹침 경고' 문구 확인
    expect(await screen.findByText(/일정 겹침 경고/)).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  setupMockHandlerCreation([
    {
      id: '1',
      title: '기존 회의',
      date: '2025-10-01',
      startTime: '00:30',
      endTime: '01:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10, // 10분 전 알람
    },
  ]);
  setup(<App />);

  // 일정 확인
  expect(await screen.findAllByText(/기존 회의/)).toHaveLength(2);

  // 20분 지남
  act(() => {
    vi.advanceTimersByTime(20 * 60 * 1000);
  });

  // 알림 확인
  expect(await screen.findByText(/10분 후/)).toBeInTheDocument();
});
