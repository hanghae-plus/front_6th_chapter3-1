import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { ReactNode } from 'react';

import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';
import { resetMockEvents } from '../__mocks__/handlers';

describe('일정 CRUD 및 기본 기능', () => {
  beforeEach(() => {
    resetMockEvents();
  });

  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    const TestWrapper = ({ children }: { children: ReactNode }) => (
      <ThemeProvider theme={createTheme()}>
        <CssBaseline />
        <SnackbarProvider>{children}</SnackbarProvider>
      </ThemeProvider>
    );

    const user = userEvent.setup();

    render(<App />, { wrapper: TestWrapper });

    await screen.findByText('일정 로딩 완료!');

    const newEvent = {
      title: '새로운 테스트 일정',
      date: '2025-08-15',
      startTime: '14:30',
      endTime: '16:00',
      description: '테스트용 회의',
      location: '회의실 A',
      category: '업무',
    };

    await user.type(screen.getByLabelText('제목'), newEvent.title);
    await user.type(screen.getByLabelText('날짜'), newEvent.date);
    await user.type(screen.getByLabelText('시작 시간'), newEvent.startTime);
    await user.type(screen.getByLabelText('종료 시간'), newEvent.endTime);
    await user.type(screen.getByLabelText('설명'), newEvent.description);
    await user.type(screen.getByLabelText('위치'), newEvent.location);
    // UI 컴포넌트(셀렉트박스, 체크박스)의 동작은 포스트 입력값이 저장되었는지 검증과는 별개로 다루는 것이 좋으므로 생략
    // - 카테고리 Select: 기본값 '업무' 그대로 사용
    // - 알림 설정 Select: 기본값 '10분 전' 그대로 사용
    // - 반복 일정 Checkbox: 기본값 체크 상태 그대로 사용

    await user.click(screen.getByTestId('event-submit-button'));

    // 성공 메시지 확인 (POST 성공 후 토스트 확인)
    await screen.findByText('일정이 추가되었습니다.');

    // 이벤트 리스트에서 새로운 일정 확인 (GET 성공 확인)
    const eventList = screen.getByTestId('event-list');

    // 모든 필드가 정확히 저장되었는지 확인
    // 제목만 await으로 UI 업데이트 완료 대기, 나머지는 로드가 보장되기 때문에 동기적으로 검증
    await within(eventList).findByText(newEvent.title);
    expect(within(eventList).getByText(newEvent.date)).toBeInTheDocument();
    expect(
      within(eventList).getByText(`${newEvent.startTime} - ${newEvent.endTime}`)
    ).toBeInTheDocument();
    expect(within(eventList).getByText(newEvent.description)).toBeInTheDocument();
    expect(within(eventList).getByText(newEvent.location)).toBeInTheDocument();
    expect(within(eventList).getByText(`카테고리: ${newEvent.category}`)).toBeInTheDocument();
    expect(within(eventList).getByText('알림: 10분 전')).toBeInTheDocument();
    expect(within(eventList).queryByText(/반복:/)).not.toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    // 2025년 10월로 mocking: MSW가 바라보는 event가 10월에 있기때문.
    // 클릭액션으로 월을 옮기지않는이유? 이번달이 지나면 테스트코드를 다시 수정해야하기 때문.
    const mockDate = new Date('2025-10-01');
    vi.setSystemTime(mockDate);

    const TestWrapper = ({ children }: { children: ReactNode }) => (
      <ThemeProvider theme={createTheme()}>
        <CssBaseline />
        <SnackbarProvider>{children}</SnackbarProvider>
      </ThemeProvider>
    );

    const user = userEvent.setup();

    render(<App />, { wrapper: TestWrapper });

    await screen.findByText('일정 로딩 완료!');

    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).getByText('기존 회의')).toBeInTheDocument();

    const editButton = within(eventList).getByLabelText('Edit event');
    await user.click(editButton);

    const updatedEvent = {
      title: '수정된 회의',
      date: '2025-10-20',
      startTime: '15:00',
      endTime: '16:30',
      description: '수정된 설명',
      location: '회의실 A',
      category: '업무',
    };

    const titleField = screen.getByLabelText('제목');
    const dateField = screen.getByLabelText('날짜');
    const startTimeField = screen.getByLabelText('시작 시간');
    const endTimeField = screen.getByLabelText('종료 시간');
    const descriptionField = screen.getByLabelText('설명');
    const locationField = screen.getByLabelText('위치');

    await user.clear(titleField);
    await user.clear(dateField);
    await user.clear(startTimeField);
    await user.clear(endTimeField);
    await user.clear(descriptionField);
    await user.clear(locationField);

    await user.type(titleField, updatedEvent.title);
    await user.type(dateField, updatedEvent.date);
    await user.type(startTimeField, updatedEvent.startTime);
    await user.type(endTimeField, updatedEvent.endTime);
    await user.type(descriptionField, updatedEvent.description);
    await user.type(locationField, updatedEvent.location);

    await user.click(screen.getByTestId('event-submit-button'));

    // 수정 성공 메시지 확인 (PUT 성공 후 토스트 확인)
    await screen.findByText('일정이 수정되었습니다.');

    // 수정된 데이터가 이벤트 리스트에 반영되었는지 확인
    await within(eventList).findByText(updatedEvent.title);
    expect(within(eventList).getByText(updatedEvent.date)).toBeInTheDocument();
    expect(
      within(eventList).getByText(`${updatedEvent.startTime} - ${updatedEvent.endTime}`)
    ).toBeInTheDocument();
    expect(within(eventList).getByText(updatedEvent.description)).toBeInTheDocument();
    expect(within(eventList).getByText(updatedEvent.location)).toBeInTheDocument();
    expect(within(eventList).getByText(`카테고리: ${updatedEvent.category}`)).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {});
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
