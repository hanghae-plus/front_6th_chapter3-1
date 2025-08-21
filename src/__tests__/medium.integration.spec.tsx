import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { act, render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { vi } from 'vitest';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { createMockEvent } from './utils';

/**
 * 통합 테스트: 여러 모듈이 연관된 상태에서 잘 동작하는지 검증
 *
 *  Q. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
 *  A. 실제 api를 호출할때 얘기인가....................뭐지?!
 *
 * - within 은 뭘까?
 * - 주로 범위 검증이나 스코프 제한을 위해 사용
 */

// 테스트용 App 생성
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
    const events = [
      createMockEvent(1, { title: '회의', description: '회의 내용', date: '2025-10-15' }),
      createMockEvent(2, { title: '개인 일정', description: '개인 일정 내용', date: '2025-10-15' }),
    ];

    setupMockHandlerCreation(events);

    renderApp();

    const user = userEvent.setup();

    // 기존 이벤트가 표시되는지 확인
    expect(await screen.findByText('회의 내용')).toBeInTheDocument();

    // form 입력
    await user.type(screen.getByLabelText('제목'), '새로운 일정');
    await user.type(screen.getByLabelText('날짜'), '2025-10-01');
    await user.type(screen.getByLabelText('시작 시간'), '10:00');
    await user.type(screen.getByLabelText('종료 시간'), '11:00');
    await user.type(screen.getByLabelText('설명'), '테스트 일정입니다');
    await user.type(screen.getByLabelText('위치'), '회의실 A');

    // 카테고리 선택
    const categorySelect = screen.getByLabelText('카테고리');
    // 콤보박스 클릭..
    await user.click(within(categorySelect).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '기타-option' }));

    // 일정 추가 버튼 클릭
    await user.click(screen.getByTestId('event-submit-button'));

    // 성공 메시지 확인
    expect(screen.getByText('일정이 추가되었습니다.')).toBeInTheDocument();

    // 새로 추가된 일정이 표시 확인
    expect(screen.getByText('테스트 일정입니다')).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하면 변경사항이 반영되고 성공 메시지가 표시된다', async () => {
    setupMockHandlerUpdating();

    renderApp();

    // 테스트 실행 중 브라우저에서 확인하고 싶을 때
    const user = userEvent.setup();

    //수정 버튼 중 하나 클릭
    const editButtons = await screen.findAllByRole('button', { name: 'Edit event' });
    await user.click(editButtons[0]);

    // 폼이 수정 모드로 변경되었는지 확인
    const editTitles = screen.getAllByText('일정 수정');
    expect(editTitles.length).toBeGreaterThan(0); // 최소 1개는 있어야 함

    // 설명 수정
    const descriptionInput = screen.getByLabelText('설명');
    await user.clear(descriptionInput);
    await user.type(descriptionInput, '수정된 설명입니다');

    // 수정 버튼 클릭
    await user.click(screen.getByRole('button', { name: '일정 수정' }));

    //성공 메시지 확인
    expect(screen.getByText('일정이 수정되었습니다.')).toBeInTheDocument();

    // 변경된 설명이 표시되었는지 확인
    expect(screen.getByText('수정된 설명입니다')).toBeInTheDocument();
  });

  it('일정을 삭제하면 목록에서 사라지고 삭제 완료 메시지가 표시된다', async () => {
    setupMockHandlerDeletion();

    renderApp();

    const user = userEvent.setup();

    // 삭제 버튼 중 하나 클릭
    const deleteButtons = await screen.findAllByRole('button', { name: 'Delete event' });
    await user.click(deleteButtons[0]);

    // 성공 메시지 확인
    expect(screen.getByText('일정이 삭제되었습니다.')).toBeInTheDocument();

    // 삭제된 일정이 목록에서 사라졌는지 확인
    expect(screen.queryByText('회의')).not.toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  it('주별 뷰에서 일정이 없으면 빈 상태가 표시된다.', async () => {
    setupMockHandlerCreation();

    renderApp();

    const user = userEvent.setup();

    // 주별 뷰 선택
    const viewSelect = screen.getByLabelText('뷰 타입 선택');

    await user.click(within(viewSelect).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    // 일정이 없는지 확인
    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('주별 뷰를 선택하면 해당 주의 일정이 표시된다', async () => {
    const events = [
      createMockEvent(1, {
        title: '회의',
        description: '회의 내용',
        date: '2025-10-01',
        startTime: '09:00',
        endTime: '10:00',
      }),
    ];

    setupMockHandlerCreation(events);

    renderApp();

    const user = userEvent.setup();

    // 주별 뷰 선택
    const viewSelect = screen.getByLabelText('뷰 타입 선택');
    await user.click(within(viewSelect).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    // 일정이 표시되는지 확인
    expect(screen.getByText('회의 내용')).toBeInTheDocument();
  });

  it('월별 뷰에서 일정이 없으면 빈 상태가 표시된다', async () => {
    setupMockHandlerCreation();

    renderApp();

    const user = userEvent.setup();

    // 월별 뷰 선택
    const viewSelect = screen.getByLabelText('뷰 타입 선택');
    await user.click(within(viewSelect).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'month-option' }));

    // 일정이 없는지 확인
    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰를 선택하면 해당 월의 일정이 표시된다', async () => {
    const events = [
      createMockEvent(1, {
        title: '회의',
        description: '회의 내용',
        date: '2025-10-01',
        startTime: '09:00',
        endTime: '10:00',
      }),
    ];

    setupMockHandlerCreation(events);

    renderApp();

    const user = userEvent.setup();

    // 월별 뷰 선택
    const viewSelect = screen.getByLabelText('뷰 타입 선택');
    await user.click(within(viewSelect).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'month-option' }));

    // 일정이 표시되는지 확인
    expect(screen.getByText('회의 내용')).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    setupMockHandlerCreation();

    renderApp();

    const user = userEvent.setup();

    // 1월로 이동 (Previous 버튼 9번 클릭)
    const previousButton = screen.getByLabelText('Previous');
    await Promise.all(Array.from({ length: 9 }, () => user.click(previousButton)));

    // 1월 1일이 공휴일로 표시되는지 확인
    expect(screen.getByText('신정')).toBeInTheDocument();
    expect(screen.getByText('신정')).toHaveStyle('color: rgb(211, 47, 47)');
  });
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    setupMockHandlerCreation();

    renderApp();

    const user = userEvent.setup();

    // 검색 입력
    await user.type(screen.getByLabelText('일정 검색'), '과제가 안 끝나요');

    // 검색 결과가 없는지 확인
    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const events = [
      createMockEvent(1, {
        title: '팀 회의',
        description: '팀 회의 내용',
        date: '2025-10-01',
        startTime: '09:00',
        endTime: '10:00',
      }),
    ];

    setupMockHandlerCreation(events);

    renderApp();

    const user = userEvent.setup();

    // 검색 입력
    await user.type(screen.getByLabelText('일정 검색'), '팀 회의');

    // 이벤트 리스트에 검색 결과가 있는지 확인
    expect(within(screen.getByTestId('event-list')).getByText('팀 회의')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const events = [
      createMockEvent(1, {
        title: '팀 회의',
        description: '팀 회의 내용',
        date: '2025-10-01',
        startTime: '09:00',
        endTime: '10:00',
      }),
      createMockEvent(2, {
        title: '과제 마감',
        description: '과제 마감 내용',
        date: '2025-10-01',
        startTime: '11:00',
        endTime: '12:00',
      }),
    ];

    setupMockHandlerCreation(events);

    renderApp();

    const user = userEvent.setup();

    // 검색 입력
    await user.type(screen.getByLabelText('일정 검색'), '팀 회의');

    // 검색 결과가 있는지 확인
    expect(within(screen.getByTestId('event-list')).getByText('팀 회의')).toBeInTheDocument();

    // 검색어 지우기
    await user.clear(screen.getByLabelText('일정 검색'));

    // 모든 일정이 표시되는지 확인
    expect(within(screen.getByTestId('event-list')).getByText('팀 회의')).toBeInTheDocument();
    expect(within(screen.getByTestId('event-list')).getByText('과제 마감')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    const events = [
      createMockEvent(1, {
        title: '팀 회의',
        description: '팀 회의 내용',
        date: '2025-10-01',
        startTime: '09:00',
        endTime: '10:00',
      }),
    ];

    setupMockHandlerCreation(events);

    renderApp();

    const user = userEvent.setup();

    // 새로운 일정 입력
    await user.type(screen.getByLabelText('제목'), '새로운 일정');
    await user.type(screen.getByLabelText('날짜'), '2025-10-01');
    await user.type(screen.getByLabelText('시작 시간'), '09:00');
    await user.type(screen.getByLabelText('종료 시간'), '10:00');
    await user.type(screen.getByLabelText('설명'), '테스트 일정입니다');
    await user.type(screen.getByLabelText('위치'), '회의실 A');

    // 카테고리 선택
    const categorySelect = screen.getByLabelText('카테고리');
    // 콤보박스 클릭..
    await user.click(within(categorySelect).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '기타-option' }));

    // 일정 추가 버튼 클릭
    await user.click(screen.getByTestId('event-submit-button'));

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    setupMockHandlerUpdating();

    renderApp();

    const user = userEvent.setup();

    // 기존 일정 수정
    const editButtons = await screen.findAllByRole('button', { name: 'Edit event' });
    await user.click(editButtons[0]);

    // 시간 수정
    const startTimeInput = screen.getByLabelText('시작 시간');
    await user.clear(startTimeInput);
    await user.type(startTimeInput, '11:00');

    // 종료 시간 수정
    const endTimeInput = screen.getByLabelText('종료 시간');
    await user.clear(endTimeInput);
    await user.type(endTimeInput, '12:00');

    // 수정 버튼 클릭
    await user.click(screen.getByRole('button', { name: '일정 수정' }));

    // 경고 메시지 확인
    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  vi.stubEnv('TZ', 'UTC'); // 타임존 설정

  const events = [
    createMockEvent(1, {
      title: '마지막',
      date: '2025-10-01',
      description: '마지막 일정',
      startTime: '00:10',
      endTime: '00:20',
      notificationTime: 10, // 10분 전 알림
    }),
  ];

  setupMockHandlerCreation(events);
  renderApp();

  // 먼저 이벤트가 표시되는지 확인
  expect(await screen.findByText('마지막 일정')).toBeInTheDocument();

  act(() => {
    vi.advanceTimersByTime(1000); // 1초만 진행
  });

  // 알림이 하나만 있는지 확인
  expect(screen.getByText('10분 후 마지막 일정이 시작됩니다.')).toBeInTheDocument();
});
