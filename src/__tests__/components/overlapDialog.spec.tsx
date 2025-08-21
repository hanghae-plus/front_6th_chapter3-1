import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider, useSnackbar } from 'notistack';
import { ReactElement } from 'react';
import { vi } from 'vitest';

import { OverlapDialog } from '../../components/OverlapDialog';

const setup = (component: ReactElement) => {
  const user = userEvent.setup();
  render(<SnackbarProvider>{component}</SnackbarProvider>);
  return {
    user,
  };
};

// 토스트 메시지를 표시하는 래퍼 컴포넌트
function ToastWrapper({ onConfirm }: { onConfirm: () => void }) {
  const { enqueueSnackbar } = useSnackbar();

  const handleConfirm = () => {
    onConfirm();
    enqueueSnackbar('일정이 추가되었습니다.', { variant: 'success' });
  };

  return (
    <OverlapDialog
      isOpen={true}
      overlappingEvents={[]}
      onClose={() => {}}
      onConfirm={handleConfirm}
    />
  );
}

describe('OverlapDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('overlapDialog에서 취소 버튼 클릭 시 모달이 닫힌다', async () => {
    const { user } = setup(
      <OverlapDialog
        isOpen={true}
        overlappingEvents={[]}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const cancelButton = screen.getByRole('button', { name: '취소' });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('overlapDialog에서 계속 진행 버튼 클릭 시 모달이 닫히고 토스트 메시지가 노출된다', async () => {
    const { user } = setup(<ToastWrapper onConfirm={mockOnConfirm} />);

    const confirmButton = screen.getByRole('button', { name: '계속 진행' });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('일정이 추가되었습니다.')).toBeInTheDocument();
    });
  });
});
