import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within, act, waitFor } from '@testing-library/react';
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
import { createEventMock } from './utils.ts';

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
    const form = {
      title: '팀 회의',
      date: '2025-10-22',
      startTime: '13:00',
      endTime: '14:00',
      description: '항해는 무엇인가',
      location: 'zip',
      category: '업무',
    } as const;

    setupMockHandlerCreation([]);

    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    await saveSchedule(user, form);
    await screen.findByText('일정이 추가되었습니다.');

    await waitFor(() => {
      expect(screen.queryByText('검색 결과가 없습니다')).not.toBeInTheDocument();
    });

    // 비동기 식 반영 대기 및 검증하기 - within 으로 테스트 범위 좁히기
    const eventList = within(await screen.findByTestId('event-list'));

    console.log(eventList);

    expect(eventList.getByText('팀 회의')).toBeInTheDocument();
    expect(eventList.getByText('2025-10-22')).toBeInTheDocument();
    expect(eventList.getByText('13:00 - 14:00')).toBeInTheDocument();
    expect(eventList.getByText('항해는 무엇인가')).toBeInTheDocument();
    expect(eventList.getByText('zip')).toBeInTheDocument();
    expect(eventList.getByText(/카테고리:\s*업무/)).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    /*
        1. 검색 결과가 없습니다.
        2. 수정할 일정의 수정 버튼 클릭
        3. 일정 추가 버튼이 일정 수정 버튼으로 변경됨을 확인
        4. 일정의 제목 수정
        5. 일정이 수정되었습니다. 알림 메시지 표기
        6. 반영된 일정 조회
     */

    setupMockHandlerUpdating();
    const { user } = setup(<App />);

    await waitFor(() => {
      expect(screen.queryByText('검색 결과가 없습니다.')).not.toBeInTheDocument();
    });

    const eventList = screen.getByTestId('event-list');

    // 버튼들 먼저 찾기
    const editButtons = within(eventList).getAllByLabelText('Edit event');
    await user.click(editButtons[0]);

    // 추가 버튼이 수정 버튼으로 변경되었는지 확인
    expect(screen.getByTestId('event-submit-button')).toHaveTextContent('일정 수정');

    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '수정된 회의');

    // 수정
    await user.click(screen.getByTestId('event-submit-button'));

    await screen.findByText('일정이 수정되었습니다.');

    // 반영된 일정 조회
    const updatedList = within(await screen.findByTestId('event-list'));

    expect(updatedList.getByText('수정된 회의')).toBeInTheDocument();
    expect(updatedList.queryByText('기존 회의')).not.toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    /*
        1. 검색 결과가 없습니다.
        2. 삭제 버튼 클릭
        3. 일정이 삭제되었습니다. 알림
        4. 일정이 삭제되었는지 확인
     */

    setupMockHandlerDeletion();

    const { user } = setup(<App />);

    await waitFor(() => {
      expect(screen.queryByText('검색 결과가 없습니다')).not.toBeInTheDocument();
    });

    await within(screen.getByTestId('event-list')).findByText('삭제할 이벤트');

    const deleteButton = await screen.findByRole('button', { name: 'Delete event' });

    await user.click(deleteButton);
    await screen.findByText('일정이 삭제되었습니다.');

    expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    setupMockHandlerCreation([]);

    const { user } = setup(<App />);

    const selectViewType = screen.getByLabelText('뷰 타입 선택');

    await user.click(within(selectViewType).getByRole('combobox'));
    await user.click(screen.getByLabelText('week-option'));
    await screen.findByTestId('week-view');

    expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    setupMockHandlerCreation([
      createEventMock({
        id: '1',
        title: '팀 회의',
        date: '2025-10-02',
      }),
      createEventMock({
        id: '2',
        title: '항해 회의',
        date: '2025-10-31',
      }),
    ]);
    const { user } = setup(<App />);

    const selectViewType = screen.getByLabelText('뷰 타입 선택');

    await user.click(within(selectViewType).getByRole('combobox'));
    await user.click(screen.getByLabelText('week-option'));
    await screen.findByTestId('week-view');

    const eventList = within(await screen.findByTestId('event-list'));

    expect(eventList.getByText('팀 회의')).toBeInTheDocument();
    expect(eventList.queryByText('항해 회의')).not.toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    setupMockHandlerCreation([
      createEventMock({
        id: '1',
        title: '팀 회의',
        date: '2025-11-02',
      }),
      createEventMock({
        id: '2',
        title: '항해 회의',
        date: '2025-11-30',
      }),
    ]);

    const { user } = setup(<App />);

    const selectViewType = screen.getByLabelText('뷰 타입 선택');

    await user.click(within(selectViewType).getByRole('combobox'));
    await user.click(screen.getByLabelText('month-option'));
    await screen.findByTestId('month-view');

    const eventList = within(await screen.findByTestId('event-list'));

    expect(eventList.queryByText('항해 회의')).not.toBeInTheDocument();
    expect(eventList.queryByText('팀 회의')).not.toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    setupMockHandlerCreation([
      createEventMock({
        id: '1',
        title: '팀 회의',
        date: '2025-10-02',
      }),
      createEventMock({
        id: '2',
        title: '항해 회의',
        date: '2025-10-31',
      }),
    ]);
    const { user } = setup(<App />);

    const selectViewType = screen.getByLabelText('뷰 타입 선택');

    await user.click(within(selectViewType).getByRole('combobox'));
    await user.click(screen.getByLabelText('month-option'));
    await screen.findByTestId('month-view');

    const eventList = within(await screen.findByTestId('event-list'));

    expect(eventList.getByText('팀 회의')).toBeInTheDocument();
    expect(eventList.queryByText('항해 회의')).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    /*
        1. < 화살표 버튼을 9번 클릭
        2. 1월에 도달
        3. 1월 1일(신정) 확인
        4. 공휴일로 표시되는지 확인
      */
    setupMockHandlerCreation([]);

    const { user } = setup(<App />);

    for (let i = 0; i < 9; i++) {
      await user.click(screen.getByLabelText('Previous'));
    }

    expect(screen.getByText('신정')).toBeInTheDocument();
    expect(screen.getByText('신정')).toHaveStyle('color: #d32f2f');
  });
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    setupMockHandlerCreation([]);

    const { user } = setup(<App />);

    await user.type(screen.getByLabelText('일정 검색'), '항해');

    expect(screen.queryByText('검색 결과가 없습니다')).not.toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    /*
    1. '팀 회의'가 일정 생성
    2. 일정 검색에 팀 회의 입력
    3. 일정 조회되는지 확인
  */
    setupMockHandlerCreation([
      createEventMock({
        id: '1',
        title: '팀 회의',
        date: '2025-10-22',
      }),
      createEventMock({
        id: '2',
        title: '항해 회의',
        date: '2025-10-23',
      }),
    ]);

    const { user } = setup(<App />);

    await user.type(screen.getByLabelText('일정 검색'), '팀 회의');

    const eventList = within(screen.getByTestId('event-list'));

    const visibleTitles = eventList.getAllByText('팀 회의');
    expect(visibleTitles).toHaveLength(1);

    expect(
      within(screen.getByTestId('event-list')).queryByText('항해 회의')
    ).not.toBeInTheDocument();
    expect(within(screen.getByTestId('event-list')).getByText('팀 회의')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    setupMockHandlerCreation([
      createEventMock({
        id: '1',
        title: '팀 회의',
        date: '2025-10-22',
      }),
      createEventMock({
        id: '2',
        title: '항해 회의',
        date: '2025-10-23',
      }),
    ]);

    const { user } = setup(<App />);

    const eventList = within(screen.getByTestId('event-list'));

    await user.type(screen.getByLabelText('일정 검색'), '항해 회의');

    expect(eventList.queryByText('팀 회의')).not.toBeInTheDocument();
    expect(eventList.getByText('항해 회의')).toBeInTheDocument();

    await user.clear(screen.getByLabelText('일정 검색'));

    await waitFor(() => {
      expect(eventList.getByText('팀 회의')).toBeInTheDocument();
      expect(eventList.getByText('항해 회의')).toBeInTheDocument();
    });

    const visibleTitles = eventList.getAllByText(/^(팀 회의|항해 회의)$/);
    expect(visibleTitles).toHaveLength(2);
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    setupMockHandlerCreation([
      createEventMock({
        id: '1',
        title: '기존 회의',
        date: '2025-10-15',
        startTime: '10:00',
        endTime: '12:00',
        category: '업무',
      }),
    ]);

    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: '겹치는 회의',
      date: '2025-10-15',
      startTime: '11:00',
      endTime: '11:30',
      description: '겹침 테스트',
      location: '회의실 A',
      category: '업무',
    });

    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    setupMockHandlerUpdating();
    const { user } = setup(<App />);

    const editButtons = await screen.findAllByRole('button', { name: 'Edit event' });

    await user.click(editButtons[0]);
    await user.clear(screen.getByLabelText('시작 시간'));
    await user.type(screen.getByLabelText('시작 시간'), '11:00');
    await user.clear(screen.getByLabelText('종료 시간'));
    await user.type(screen.getByLabelText('종료 시간'), '12:00');
    await user.click(screen.getByTestId('event-submit-button'));

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  const form = {
    title: '알람 테스트 회의',
    date: '2025-10-22',
    startTime: '10:00',
    endTime: '13:00',
    description: '항해는 무엇인가',
    location: 'zip',
    category: '업무',
    notificationTime: 10,
  } as const;

  setupMockHandlerCreation([]);

  const { user } = setup(<App />);

  await screen.findByText('일정 로딩 완료!');

  await saveSchedule(user, form);
  await screen.findByText('일정이 추가되었습니다.');

  const eventList = within(await screen.findByTestId('event-list'));
  expect(eventList.getByText('알람 테스트 회의')).toBeInTheDocument();

  vi.setSystemTime(new Date('2025-10-22T09:50:00Z'));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(
    await screen.findByText('10분 후 알람 테스트 회의 일정이 시작됩니다.')
  ).toBeInTheDocument();
});
