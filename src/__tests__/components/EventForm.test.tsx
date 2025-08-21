import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { describe, it, expect, vi } from 'vitest';

import { Form } from '../../components';

const theme = createTheme();
const setup = () => {
  const user = userEvent.setup();
  const defaultProps = {
    onSave: vi.fn(),
    editingEvent: null,
    onEditingEventChange: vi.fn(),
  };
  return {
    ...render(
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <Form {...defaultProps} />
        </SnackbarProvider>
      </ThemeProvider>
    ),
    user,
  };
};

describe('EventForm', () => {
  it('모든 폼 필드가 올바르게 렌더링된다', () => {
    setup();

    // 모든 라벨과 입력 필드 확인
    expect(screen.getByLabelText('제목')).toBeInTheDocument();
    expect(screen.getByLabelText('날짜')).toBeInTheDocument();
    expect(screen.getByLabelText('시작 시간')).toBeInTheDocument();
    expect(screen.getByLabelText('종료 시간')).toBeInTheDocument();
    expect(screen.getByLabelText('설명')).toBeInTheDocument();
    expect(screen.getByLabelText('위치')).toBeInTheDocument();
    expect(screen.getByText('카테고리')).toBeInTheDocument();
    expect(screen.getByText('알림 설정')).toBeInTheDocument();
    expect(screen.getByText('반복 일정')).toBeInTheDocument();
  });

  it('필수 필드가 채워져있지 않으면, 에러 토스트가 나옴', async () => {
    const { user } = setup();
    // 빈 폼으로 제출 버튼 클릭
    const submitButton = screen.getByRole('button', { name: '일정 추가' });

    await user.click(submitButton);
    // 에러 토스트 메시지 확인
    expect(await screen.findByText('필수 정보를 모두 입력해주세요.')).toBeInTheDocument();
  });

  // 반복 일정 체크박스
  it('반복 일정 체크박스가 올바르게 작동한다', async () => {
    const { user } = setup();

    // 반복 일정 체크박스 찾기
    const repeatCheckbox = screen.getByRole('checkbox');

    // 초기 상태: 체크되지 않음
    expect(repeatCheckbox).not.toBeChecked();

    // 체크박스 클릭
    await user.click(repeatCheckbox);

    // 체크된 상태로 변경됨
    expect(repeatCheckbox).toBeChecked();

    // 다시 클릭
    await user.click(repeatCheckbox);

    // 체크 해제됨
    expect(repeatCheckbox).not.toBeChecked();
  });
});
