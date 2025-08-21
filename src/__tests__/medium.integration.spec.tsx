import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';

import { setupMockHandlerCreation } from '../__mocks__/handlersUtils';
import App from '../App';
import { createMockEvent } from './utils';

/**
 * 통합 테스트: 여러 모듈이 연관된 상태에서 잘 동작하는지 검증
 *
 *  Q. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
 *  A. 실제 api를 호출할때 얘기인가....................뭐지?!
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
      createMockEvent(1, { title: '회의', date: '2025-10-15' }),
      createMockEvent(2, { title: '개인 일정', date: '2025-10-15' }),
    ];

    setupMockHandlerCreation(events);

    renderApp();

    const user = userEvent.setup();

    // // 기존 이벤트가 표시되는지 확인
    // expect(screen.getByText('회의')).toBeInTheDocument();

    // form 입력

    await user.type(screen.getByLabelText('제목'), '새로운 일정');
    await user.type(screen.getByLabelText('날짜'), '2025-10-01');
    await user.type(screen.getByLabelText('시작 시간'), '10:00');
    await user.type(screen.getByLabelText('종료 시간'), '11:00');
    await user.type(screen.getByLabelText('설명'), '테스트 일정입니다');
    await user.type(screen.getByLabelText('위치'), '회의실 A');

    // 카테고리 선택 (올바른 방법)
    const categorySelect = screen.getByLabelText('카테고리');
    await user.click(categorySelect);
    await user.click(screen.getByText('기타')); // 직접 텍스트로 찾기

    // 알림 설정 선택 (필요시)
    const notificationSelect = screen.getByLabelText('알림 설정');
    await user.click(notificationSelect);
    await user.click(screen.getByText('10분 전'));

    // 일정 추가 버튼 클릭
    await user.click(screen.getByTestId('event-submit-button'));

    // 성공 메시지 확인
    expect(screen.getByText('일정이 추가되었습니다.')).toBeInTheDocument();

    // 새로 추가된 일정이 표시 확인
    expect(screen.getByText('새로운 일정')).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {});

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
