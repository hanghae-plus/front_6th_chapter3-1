import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within, getByRole } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { notificationOptions } from '../constant';
import { server } from '../setupTests';
import { EventForm } from '../types';

const renderApp = () => {
  const theme = createTheme();
  return render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider>
        <App />
      </SnackbarProvider>
    </ThemeProvider>
  );
};

async function createEvent({
  title,
  date,
  description,
  startTime,
  endTime,
  category,
  location,
  notificationTime,
}: Partial<EventForm>) {
  await userEvent.type(screen.getByLabelText('제목'), title!);
  await userEvent.type(screen.getByLabelText('날짜'), date!);
  await userEvent.type(screen.getByLabelText('시작 시간'), startTime!);
  await userEvent.type(screen.getByLabelText('종료 시간'), endTime!);
  await userEvent.type(screen.getByLabelText('설명'), description!);
  await userEvent.type(screen.getByLabelText('위치'), location!);
  // await userEvent.type(screen.getByLabelText('반복 일정'), repeat);

  await userEvent.click(getByRole(screen.getByLabelText('카테고리'), 'combobox'));
  await userEvent.click(screen.getByLabelText(`${category}-option`));

  await userEvent.click(screen.getByLabelText('알림 설정'));
  await userEvent.click(screen.getByLabelText(`${notificationTime}-option`));

  await userEvent.click(screen.getByTestId('event-submit-button'));
}

async function updateFirstEvent({
  title,
  date,
  description,
  startTime,
  endTime,
  category,
  location,
  notificationTime,
}: Partial<EventForm>) {
  await userEvent.click((await screen.findAllByLabelText('Edit event'))[0]);

  if (title != null) {
    await userEvent.clear(screen.getByLabelText('제목'));
    await userEvent.type(screen.getByLabelText('제목'), title!);
  }

  if (date != null) {
    await userEvent.clear(screen.getByLabelText('날짜'));
    await userEvent.type(screen.getByLabelText('날짜'), date);
  }

  if (description != null) {
    await userEvent.clear(screen.getByLabelText('설명'));
    await userEvent.type(screen.getByLabelText('설명'), description);
  }

  if (startTime != null) {
    await userEvent.clear(screen.getByLabelText('시작 시간'));
    await userEvent.type(screen.getByLabelText('시작 시간'), startTime);
  }

  if (endTime != null) {
    await userEvent.clear(screen.getByLabelText('종료 시간'));
    await userEvent.type(screen.getByLabelText('종료 시간'), endTime);
  }

  if (location != null) {
    await userEvent.clear(screen.getByLabelText('위치'));
    await userEvent.type(screen.getByLabelText('위치'), location);
  }

  if (category != null) {
    await userEvent.click(getByRole(screen.getByLabelText('카테고리'), 'combobox'));
    await userEvent.click(screen.getByLabelText(`${category}-option`));
  }

  if (notificationTime != null) {
    await userEvent.click(screen.getByLabelText('알림 설정'));
    await userEvent.click(screen.getByLabelText(`${notificationTime}-option`));
  }

  await userEvent.click(screen.getByTestId('event-submit-button'));
}

describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    const handlers = setupMockHandlerCreation([]);
    server.resetHandlers(...handlers);
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    renderApp();

    const testData = {
      title: '제목 테스트',
      date: '2025-08-15',
      description: '설명 테스트 입니다.',
      startTime: '12:30',
      endTime: '15:30',
      category: '개인',
      location: '서울 은평구',
      notificationTime: 120,
    };

    await createEvent(testData);

    const list = await screen.findByTestId('event-list');
    const withinList = within(list);

    expect(withinList.getByText(testData.title)).toBeInTheDocument();
    expect(withinList.getByText(testData.date)).toBeInTheDocument();
    expect(withinList.getByText(testData.description)).toBeInTheDocument();
    expect(list).toHaveTextContent(testData.startTime);
    expect(list).toHaveTextContent(testData.endTime);
    expect(list).toHaveTextContent(testData.category);
    expect(withinList.getByText(testData.location)).toBeInTheDocument();
    const notificationLabel = notificationOptions.find(
      (x) => x.value === testData.notificationTime
    )!.label;
    expect(list).toHaveTextContent(notificationLabel);
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    const handlers = setupMockHandlerUpdating();
    server.resetHandlers(...handlers);

    renderApp();

    const testData = {
      id: '1',
      title: '변경 후 제목',
      date: '2025-08-30',
      description: '변경 테스트 입니다.',
      startTime: '10:30',
      endTime: '11:30',
      category: '가족',
      location: '서울 강남구',
      notificationTime: 1440,
    };

    await updateFirstEvent(testData);

    const list = await screen.findByTestId('event-list');
    const withinList = within(list);

    expect(withinList.getByText(testData.title)).toBeInTheDocument();
    expect(withinList.getByText(testData.date)).toBeInTheDocument();
    expect(withinList.getByText(testData.description)).toBeInTheDocument();
    expect(list).toHaveTextContent(testData.startTime);
    expect(list).toHaveTextContent(testData.endTime);
    expect(list).toHaveTextContent(testData.category);
    expect(withinList.getByText(testData.location)).toBeInTheDocument();
    const notificationLabel = notificationOptions.find(
      (x) => x.value === testData.notificationTime
    )!.label;
    expect(list).toHaveTextContent(notificationLabel);
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    const handlers = setupMockHandlerDeletion();
    server.resetHandlers(...handlers);

    renderApp();

    await userEvent.click(screen.getByLabelText('Next'));
    await userEvent.click(screen.getByLabelText('Next'));

    await userEvent.click(screen.getByLabelText('Delete event'));

    const list = await screen.findByTestId('event-list');
    expect(list).toHaveTextContent('검색 결과가 없습니다.');
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    renderApp();
    await userEvent.click(getByRole(screen.getByLabelText('뷰 타입 선택'), 'combobox'));
    await userEvent.click(screen.getByLabelText('week-option'));

    expect(screen.queryAllByTestId('event-tag')).toHaveLength(0);

    const list = await screen.findByTestId('event-list');
    expect(list).toHaveTextContent('검색 결과가 없습니다.');
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    renderApp();
    await userEvent.click(screen.getByLabelText('Next'));
    await userEvent.click(screen.getByLabelText('Next'));

    await userEvent.click(getByRole(screen.getByLabelText('뷰 타입 선택'), 'combobox'));
    await userEvent.click(screen.getByLabelText('week-option'));

    await userEvent.click(screen.getByLabelText('Next'));
    await userEvent.click(screen.getByLabelText('Next'));

    expect(screen.queryAllByTestId('event-tag').length > 0).toBe(true);
    expect(screen.queryAllByText('기존 회의').length >= 2).toBe(true);
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    renderApp();
    await userEvent.click(getByRole(screen.getByLabelText('뷰 타입 선택'), 'combobox'));
    await userEvent.click(screen.getByLabelText('month-option'));

    expect(screen.queryAllByTestId('event-tag')).toHaveLength(0);

    const list = await screen.findByTestId('event-list');
    expect(list).toHaveTextContent('검색 결과가 없습니다.');
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    renderApp();
    await userEvent.click(screen.getByLabelText('Next'));
    await userEvent.click(screen.getByLabelText('Next'));

    await userEvent.click(getByRole(screen.getByLabelText('뷰 타입 선택'), 'combobox'));
    await userEvent.click(screen.getByLabelText('month-option'));

    expect(screen.queryAllByTestId('event-tag').length > 0).toBe(true);
    expect(screen.queryAllByText('기존 회의').length >= 2).toBe(true);
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    renderApp();

    await userEvent.click(screen.getByLabelText('Previous'));
    await userEvent.click(screen.getByLabelText('Previous'));
    await userEvent.click(screen.getByLabelText('Previous'));
    await userEvent.click(screen.getByLabelText('Previous'));
    await userEvent.click(screen.getByLabelText('Previous'));
    await userEvent.click(screen.getByLabelText('Previous'));
    await userEvent.click(screen.getByLabelText('Previous'));

    const january1stCell = await screen.findByTestId('1-day-cell');
    expect(within(january1stCell).getByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    renderApp();
    await userEvent.click(screen.getByLabelText('Next'));
    await userEvent.click(screen.getByLabelText('Next'));

    await userEvent.type(screen.getByLabelText('일정 검색'), '존재하지 않는 일정');

    const list = await screen.findByTestId('event-list');
    expect(list).toHaveTextContent('검색 결과가 없습니다.');
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    renderApp();

    const testData = {
      title: '팀 회의',
      date: '2025-08-15',
      description: '설명 테스트 입니다.',
      startTime: '12:30',
      endTime: '15:30',
      category: '개인',
      location: '서울 은평구',
      notificationTime: 120,
    };

    const list = await screen.findByTestId('event-list');
    await createEvent(testData);

    await userEvent.type(screen.getByLabelText('일정 검색'), testData.title);

    const searchResultTitles = within(list)
      .queryAllByTestId('event-card-title')
      .map((x) => x.innerHTML);

    expect(searchResultTitles.find((x) => x === testData.title)).toBe(testData.title);
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const handlers = setupMockHandlerCreation([]);
    server.resetHandlers(...handlers);
    renderApp();

    const testData1 = {
      title: '팀 회의',
      date: '2025-08-15',
      description: '설명 테스트 입니다.',
      startTime: '12:30',
      endTime: '15:30',
      category: '개인',
      location: '서울 은평구',
      notificationTime: 120,
    };
    const testData2 = {
      title: '스크럼',
      date: '2025-08-16',
      description: '데일리 스크럼 입니다.',
      startTime: '13:30',
      endTime: '14:00',
      category: '업무',
      location: '강남구',
      notificationTime: 10,
    };
    const testData3 = {
      title: '가족 회의',
      date: '2025-08-17',
      description: '가족 회의 입니다.',
      startTime: '11:00',
      endTime: '13:00',
      category: '가족',
      location: '집',
      notificationTime: 1440,
    };

    await createEvent(testData1);
    await createEvent(testData2);
    await createEvent(testData3);

    const allEventCount = screen.queryAllByTestId('event-card').length;

    await userEvent.type(screen.getByLabelText('일정 검색'), '회의');
    const searchedEventCount = screen.queryAllByTestId('event-card').length;
    expect(allEventCount !== searchedEventCount).toBe(true);

    await userEvent.clear(screen.getByLabelText('일정 검색'));
    const finalEventCount = screen.queryAllByTestId('event-card').length;
    expect(allEventCount === finalEventCount).toBe(true);
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    const handlers = setupMockHandlerCreation([]);
    server.resetHandlers(...handlers);

    renderApp();

    const testData = {
      title: '팀 회의',
      date: '2025-08-15',
      description: '설명 테스트 입니다.',
      startTime: '12:30',
      endTime: '15:30',
      category: '개인',
      location: '서울 은평구',
      notificationTime: 120,
    };
    const testDataCopy = {
      title: '팀 회의 Copy',
      date: '2025-08-15',
      description: '설명 테스트 입니다.',
      startTime: '12:30',
      endTime: '15:30',
      category: '개인',
      location: '서울 은평구',
      notificationTime: 120,
    };

    await createEvent(testData);
    await createEvent(testDataCopy);

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(
      screen.getByText(
        `${testData.title} (${testData.date} ${testData.startTime}-${testData.endTime})`
      )
    ).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    const handlers = setupMockHandlerCreation([]);
    server.resetHandlers(...handlers);

    renderApp();

    const testData1 = {
      title: '팀 회의',
      date: '2025-08-15',
      description: '설명 테스트 입니다.',
      startTime: '12:30',
      endTime: '15:30',
      category: '개인',
      location: '서울 은평구',
      notificationTime: 120,
    };
    const testData2 = {
      title: '스크럼',
      date: '2025-08-16',
      description: '데일리 스크럼 입니다.',
      startTime: '13:30',
      endTime: '14:00',
      category: '업무',
      location: '강남구',
      notificationTime: 10,
    };

    await createEvent(testData1);
    await createEvent(testData2);

    await updateFirstEvent({
      ...testData1,
      date: '2025-08-16',
      startTime: '13:30',
      endTime: '14:00',
    });
    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(
      screen.getByText(
        `${testData2.title} (${testData2.date} ${testData2.startTime}-${testData2.endTime})`
      )
    ).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {});
