import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within, act, waitFor, getByRole } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import App from '../App';
import { server } from '../setupTests';
import { Event, EventForm } from '../types';
import { setupMockHandlerCreation, setupMockHandlerUpdating } from '../__mocks__/handlersUtils';

const AppWrapper = () => {
  const theme = createTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider>
        <App />
      </SnackbarProvider>
    </ThemeProvider>
  );
};

describe('일정 CRUD 및 기본 기능', () => {
  it('폼 데이터를 입력하고 일정 추가 버튼을 클릭하면 새로운 일정이 리스트에 추가된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    setupMockHandlerCreation([
      {
        id: '1',
        title: '기존 회의',
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

    render(<AppWrapper />);

    const user = userEvent.setup();

    await user.type(screen.getByLabelText('제목'), '새로운 회의');
    await user.type(screen.getByLabelText('날짜'), '2025-10-16');
    await user.type(screen.getByLabelText('시작 시간'), '10:00');
    await user.type(screen.getByLabelText('종료 시간'), '11:00');
    await user.type(screen.getByLabelText('설명'), '새로운 팀 미팅');
    await user.type(screen.getByLabelText('위치'), '회의실 A');

    const selectCategory = screen.getByLabelText('카테고리');

    await user.click(within(selectCategory).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: `기타-option` }));
    await user.click(screen.getByRole('button', { name: '일정 추가' }));

    expect(await screen.findAllByRole('button', { name: 'Edit event' })).toHaveLength(2);
    expect(screen.getByText('새로운 팀 미팅')).toBeInTheDocument();
  });

  it('일정을 수정하면 수정된 정보가 이벤트 리스트에 반영된다.', async () => {
    setupMockHandlerUpdating();

    render(<AppWrapper />);

    const user = userEvent.setup();
    const editButton = await screen.findByRole('button', { name: 'Edit event' });
    const locationInput = screen.getByLabelText('위치');

    await user.click(editButton);

    expect(screen.getByRole('button', { name: '일정 수정' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('기존 회의')).toBeInTheDocument();

    await user.clear(locationInput);
    await user.type(locationInput, '회의실 C');
    await user.click(screen.getByRole('button', { name: '일정 수정' }));

    expect(screen.getByText('회의실 C')).toBeInTheDocument();
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
