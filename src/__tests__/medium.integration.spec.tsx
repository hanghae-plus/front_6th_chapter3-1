import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within, act, renderHook, waitFor } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import { setupMockHandlerCreation, setupMockHandlerUpdating } from '../__mocks__/handlersUtils';
import App from '../App';
import { useEventOperations } from '../hooks/useEventOperations';
import { server } from '../setupTests';
import { Event } from '../types';

describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    server.use(...setupMockHandlerCreation([]));

    const user = userEvent.setup();

    render(
      <ThemeProvider theme={createTheme()}>
        <SnackbarProvider>
          <App />
        </SnackbarProvider>
      </ThemeProvider>
    );

    const titleInput = await screen.findByRole('textbox', { name: '제목' });
    await user.type(await screen.findByRole('textbox', { name: '제목' }), '발제 모임');

    expect(titleInput).toHaveValue('발제 모임');

    const dateInput = await screen.findByLabelText('날짜');
    await user.type(dateInput, '2025-08-24');

    expect(dateInput).toHaveValue('2025-08-24');

    const startTimeInput = await screen.findByLabelText('시작 시간');
    await user.type(startTimeInput, '13:00');

    expect(startTimeInput).toHaveValue('13:00');

    const endTimeInput = await screen.findByLabelText('종료 시간');
    await user.type(endTimeInput, '18:00');

    expect(endTimeInput).toHaveValue('18:00');

    const descriptionInput = await screen.findByRole('textbox', { name: '설명' });
    await user.type(descriptionInput, '발제 시청');

    expect(descriptionInput).toHaveValue('발제 시청');

    const location = await screen.findByRole('textbox', { name: '위치' });
    await user.type(location, '아이콘 빌딩');

    expect(location).toHaveValue('아이콘 빌딩');

    const categoryContainer = await screen.findByLabelText('카테고리');
    const categorySelect = await within(categoryContainer).findByRole('combobox');
    await user.click(categorySelect);
    const workingSelectItem = screen.getByRole('option', { name: '업무-option' });
    await user.click(workingSelectItem);

    expect(categorySelect).toHaveTextContent('업무');

    const notifyLabel = await screen.findByText('알림 설정', { selector: 'label' });
    const notifySelect = await within(notifyLabel.parentElement!).findByRole('combobox');
    await user.click(notifySelect);
    const notiListbox = await screen.findByRole('listbox');
    await user.click(within(notiListbox).getByRole('option', { name: '10분 전' }));

    expect(notifySelect).toHaveTextContent('10분 전');

    const submitButton = screen.getByTestId('event-submit-button');

    await user.click(submitButton);

    await screen.findByText('일정이 추가되었습니다.');

    await waitFor(() =>
      expect(screen.queryByText('검색 결과가 없습니다.')).not.toBeInTheDocument()
    );
    const eventList = screen.getByTestId('event-list');

    expect(await within(eventList).findByText('발제 모임')).toBeInTheDocument();
    expect(within(eventList).getByText('2025-08-24')).toBeInTheDocument();
    expect(within(eventList).getByText('13:00 - 18:00')).toBeInTheDocument();
    expect(within(eventList).getByText('발제 시청')).toBeInTheDocument();
    expect(within(eventList).getByText('아이콘 빌딩')).toBeInTheDocument();
    expect(within(eventList).getByText('카테고리: 업무')).toBeInTheDocument();
    expect(within(eventList).getByText('알림: 10분 전')).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    const prevEvent = {
      id: '1',
      title: '발제 모임',
      date: '2025-08-24',
      startTime: '13:00',
      endTime: '11:00',
      description: '발제 시청',
      location: '아이콘 빌딩',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    } as Event;

    server.use(...setupMockHandlerUpdating([prevEvent]));

    const user = userEvent.setup();

    render(
      <ThemeProvider theme={createTheme()}>
        <SnackbarProvider>
          <App />
        </SnackbarProvider>
      </ThemeProvider>
    );

    const eventList = await screen.findByTestId('event-list');
    expect(await within(eventList).findByText('발제 모임')).toBeInTheDocument();

    await user.click(within(eventList).getByRole('button', { name: 'Edit event' }));

    const titleInput = await screen.findByRole('textbox', { name: '제목' });
    await user.clear(titleInput);
    await user.type(titleInput, '등산');

    expect(titleInput).toHaveValue('등산');

    const dateInput = await screen.findByLabelText('날짜');
    await user.clear(dateInput);
    await user.type(dateInput, '2025-08-30');

    expect(dateInput).toHaveValue('2025-08-30');

    const startTimeInput = await screen.findByLabelText('시작 시간');
    await user.clear(startTimeInput);
    await user.type(startTimeInput, '14:00');

    expect(startTimeInput).toHaveValue('14:00');

    const endTimeInput = await screen.findByLabelText('종료 시간');
    await user.clear(endTimeInput);
    await user.type(endTimeInput, '16:00');
    expect(endTimeInput).toHaveValue('16:00');

    const locationInput = await screen.findByRole('textbox', { name: '위치' });
    await user.clear(locationInput);
    await user.type(locationInput, '우면산');
    expect(locationInput).toHaveValue('우면산');

    const categoryContainer = await screen.findByLabelText('카테고리');
    const categorySelect = await within(categoryContainer).findByRole('combobox');
    await user.click(categorySelect);
    const workingSelectItem = screen.getByRole('option', { name: '개인-option' });
    await user.click(workingSelectItem);

    const notifyLabel = await screen.findByText('알림 설정', { selector: 'label' });
    const notifySelect = within(notifyLabel.parentElement!).getByRole('combobox');
    await user.click(notifySelect);
    const notiListbox = await screen.findByRole('listbox');
    await user.click(within(notiListbox).getByRole('option', { name: '1시간 전' }));
    expect(notifySelect).toHaveTextContent('1시간 전');

    const submit = await screen.findByRole('button', { name: '일정 수정' });
    await user.click(submit);

    await screen.findByText('일정이 수정되었습니다.');

    expect(await within(eventList).findByText('등산')).toBeInTheDocument();
    expect(within(eventList).getByText('2025-08-30')).toBeInTheDocument();
    expect(within(eventList).getByText('14:00 - 16:00')).toBeInTheDocument();
    expect(within(eventList).getByText('우면산')).toBeInTheDocument();
    expect(within(eventList).getByText('카테고리: 개인')).toBeInTheDocument();
    expect(within(eventList).getByText('알림: 1시간 전')).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    const prevEvent = {
      id: '1',
      title: '발제 모임',
      date: '2025-08-24',
      startTime: '13:00',
      endTime: '11:00',
      description: '발제 시청',
      location: '아이콘 빌딩',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    } as Event;

    server.use(...setupMockHandlerUpdating([prevEvent]));
    const user = userEvent.setup();

    render(
      <ThemeProvider theme={createTheme()}>
        <SnackbarProvider>
          <App />
        </SnackbarProvider>
      </ThemeProvider>
    );

    const list = await screen.findByTestId('event-list');
    expect(await within(list).findByText('발제 모임')).toBeInTheDocument();

    await user.click(within(list).getByRole('button', { name: 'Delete event' }));

    await screen.findByText('일정이 삭제되었습니다.');
    await waitFor(() =>
      expect(screen.queryByText('검색 결과가 없습니다.')).not.toBeInTheDocument()
    );
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
