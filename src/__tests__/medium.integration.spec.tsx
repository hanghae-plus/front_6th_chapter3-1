import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  render,
  screen,
  within,
  act,
  fireEvent,
  RenderResult,
  waitFor,
} from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import App from '../App';
import { server } from '../setupTests';
import { Event, EventForm } from '../types';

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

async function clearEvent() {
  fireEvent.change(screen.getByLabelText('제목'), { target: { value: '' } });
  fireEvent.change(screen.getByLabelText('날짜'), { target: { value: '' } });
  fireEvent.change(screen.getByLabelText('설명'), { target: { value: '' } });
  fireEvent.change(screen.getByLabelText('시작 시간'), { target: { value: '' } });
  fireEvent.change(screen.getByLabelText('종료 시간'), { target: { value: '' } });
}

async function createEvent({ title, date, description, startTime, endTime }: Partial<EventForm>) {
  fireEvent.change(screen.getByLabelText('제목'), { target: { value: title } });
  fireEvent.change(screen.getByLabelText('날짜'), { target: { value: date } });
  fireEvent.change(screen.getByLabelText('설명'), { target: { value: description } });
  fireEvent.change(screen.getByLabelText('시작 시간'), { target: { value: startTime } });
  fireEvent.change(screen.getByLabelText('종료 시간'), { target: { value: endTime } });

  await fireEvent.click(screen.getByTestId('event-submit-button'));

  clearEvent();
}

async function updateEvent({ title, date, description, startTime, endTime }: Partial<EventForm>) {
  fireEvent.click(screen.getByLabelText('Edit event'));

  fireEvent.change(screen.getByLabelText('제목'), { target: { value: title } });
  date && fireEvent.change(screen.getByLabelText('날짜'), { target: { value: date } });
  description && fireEvent.change(screen.getByLabelText('설명'), { target: { value: description } });
  startTime && fireEvent.change(screen.getByLabelText('시작 시간'), { target: { value: startTime } });
  endTime && fireEvent.change(screen.getByLabelText('종료 시간'), { target: { value: endTime } });

  await fireEvent.click(screen.getByTestId('event-submit-button'));

  clearEvent();
}

describe.only('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    renderApp();

    // 기존 회의 날짜로 이동
    fireEvent.click(screen.getByLabelText('Next'));
    fireEvent.click(screen.getByLabelText('Next'));

    await createEvent({
      title: '테스트 - 새 회의',
      date: '2025-10-16',
      description: '테스트 - 설명',
      startTime: '17:00',
      endTime: '18:00',
    });

    const eventList = within(await screen.findByTestId('event-list'));
    expect(eventList.getByText('테스트 - 새 회의')).toBeInTheDocument();
    expect(eventList.getByText('2025-10-16')).toBeInTheDocument();
    expect(eventList.getByText('테스트 - 설명')).toBeInTheDocument();

    // TODO: 구현에 몇가지 validation 을 넣어서 더 안정적으로 바꾸기
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    renderApp();

    // 기존 회의 날짜로 이동
    fireEvent.click(screen.getByLabelText('Next'));
    fireEvent.click(screen.getByLabelText('Next'));

    const eventList = within(await screen.findByTestId('event-list'));
    expect(eventList.getByText('기존 회의')).toBeInTheDocument();

    await updateEvent({ title: '바뀐 회의' });

    const eventListAfterUpdate = within(await screen.findByTestId('event-list'));
    expect(eventListAfterUpdate.getByText('바뀐 회의')).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    renderApp();

    // 기존 회의 날짜로 이동
    fireEvent.click(screen.getByLabelText('Next'));
    fireEvent.click(screen.getByLabelText('Next'));

    const eventList = within(await screen.findByTestId('event-list'));
    expect(eventList.getByText('기존 회의')).toBeInTheDocument();

    await fireEvent.click(screen.getByLabelText('Delete event'));

    const eventListAfterDelete = within(await screen.findByTestId('event-list'));
    expect(await eventListAfterDelete.queryByText('기존 회의')).toBeNull();
    expect(await eventListAfterDelete.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {});

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {});

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {});

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {});

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {});
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {});

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {});

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {});
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {});

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {});
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {});
