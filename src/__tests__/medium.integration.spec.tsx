import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within, act, waitFor } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';
import { defaultMockEvents } from '../__mocks__/mockData';
import { createMockEventHandler } from '../__mocks__/handlersUtils.ts';

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

describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.

    const newEvent: Event = {
      id: 'new-test-event',
      title: '새로운 회의',
      date: '2025-08-21',
      startTime: '14:00',
      endTime: '15:00',
      description: '중요한 회의입니다',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    const mockHandler = createMockEventHandler([]);
    server.use(mockHandler.get(), mockHandler.post());

    const user = userEvent.setup();
    renderApp();

    // 필수 필드만 입력
    await user.type(await screen.findByLabelText('제목'), newEvent.title);
    await user.type(await screen.findByLabelText('날짜'), newEvent.date);
    await user.type(await screen.findByLabelText('시작 시간'), newEvent.startTime);
    await user.type(await screen.findByLabelText('종료 시간'), newEvent.endTime);
    await user.type(await screen.findByLabelText('설명'), newEvent.description);
    await user.type(await screen.findByLabelText('위치'), newEvent.location);
    await user.type(await screen.findByLabelText('카테고리'), newEvent.category);

    const eventSubmitButton = screen.getByTestId('event-submit-button');
    await user.click(eventSubmitButton);

    expect(await screen.findByText('일정이 추가되었습니다.')).toBeInTheDocument();

    const eventList = screen.getByTestId('event-list');
    expect(await within(eventList).findByText(newEvent.title)).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    const existingEvent: Event = {
      id: 'test-event-1',
      title: '기존 회의',
      date: '2025-08-21',
      startTime: '10:00',
      endTime: '11:00',
      description: '기존 설명',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    const updatedEvent: Event = {
      ...existingEvent,
      title: '수정된 회의',
      description: '수정된 설명',
      location: '회의실 C',
    };

    // 기존 이벤트가 있는 상태로 시작
    const mockHandler = createMockEventHandler([existingEvent]);
    server.use(mockHandler.get(), mockHandler.put());

    const user = userEvent.setup();
    renderApp();

    // 기존 이벤트가 표시되는지 확인
    const eventList = screen.getByTestId('event-list');
    expect(await within(eventList).findByText(existingEvent.title)).toBeInTheDocument();

    // 수정 버튼 클릭
    const editButton = await screen.findByLabelText('Edit event');
    await user.click(editButton);

    // 폼이 기존 값으로 채워졌는지 확인
    const titleField = await screen.findByLabelText('제목');
    expect(titleField).toHaveValue(existingEvent.title);

    // 값 수정
    await user.clear(titleField);
    await user.type(titleField, updatedEvent.title);

    const descriptionField = await screen.findByLabelText('설명');
    await user.clear(descriptionField);
    await user.type(descriptionField, updatedEvent.description);

    const locationField = await screen.findByLabelText('위치');
    await user.clear(locationField);
    await user.type(locationField, updatedEvent.location);

    // 수정 버튼 클릭
    const submitButton = screen.getByTestId('event-submit-button');
    expect(submitButton).toHaveTextContent('일정 수정');
    await user.click(submitButton);

    // 수정 완료 메시지 확인
    expect(await screen.findByText('일정이 수정되었습니다.')).toBeInTheDocument();

    // 수정된 내용이 목록에 반영되었는지 확인
    expect(await within(eventList).findByText(updatedEvent.title)).toBeInTheDocument();
    expect(await within(eventList).findByText(updatedEvent.description)).toBeInTheDocument();
    expect(await within(eventList).findByText(updatedEvent.location)).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    const existingEvent: Event = {
      id: 'test-event-1',
      title: '삭제될 회의',
      date: '2025-08-21',
      startTime: '10:00',
      endTime: '11:00',
      description: '삭제될 설명',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    // 기존 이벤트가 있는 상태로 시작
    const mockHandler = createMockEventHandler([existingEvent]);
    server.use(mockHandler.get(), mockHandler.delete());

    const user = userEvent.setup();
    renderApp();

    // 기존 이벤트가 표시되는지 확인
    const eventList = screen.getByTestId('event-list');
    expect(await within(eventList).findByText(existingEvent.title)).toBeInTheDocument();

    // 삭제 버튼 클릭
    const deleteButton = await screen.findByLabelText('Delete event');
    await user.click(deleteButton);

    // 삭제 완료 메시지 확인
    expect(await screen.findByText('일정이 삭제되었습니다.')).toBeInTheDocument();

    // 이벤트가 목록에서 사라졌는지 확인
    expect(within(eventList).queryByText(existingEvent.title)).not.toBeInTheDocument();
    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
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
