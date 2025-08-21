import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';

import { OverlapDialog } from '../../components/OverlapDialog';
import type { Event } from '../../types';

const setup = (props: Partial<ComponentProps<typeof OverlapDialog>> = {}) => {
  const user = userEvent.setup();

  return {
    ...render(
      <OverlapDialog
        {...{
          open: false,
          onClose: () => {},
          overlappingEvents: [],
          onConfirm: () => {},
          ...props,
        }}
      />
    ),
    user,
  };
};

const mockOverlappingEvents: Event[] = [
  {
    id: '1',
    title: '겹치는 일정 1',
    date: '2025-01-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '테스트 설명',
    location: '테스트 위치',
    category: '업무',
    notificationTime: 10,
    repeat: { type: 'none', interval: 1 },
  },
  {
    id: '2',
    title: '겹치는 일정 2',
    date: '2025-01-15',
    startTime: '09:30',
    endTime: '10:30',
    description: '테스트 설명 2',
    location: '테스트 위치 2',
    category: '개인',
    notificationTime: 0,
    repeat: { type: 'none', interval: 1 },
  },
];

it('다이얼로그가 열려있을 때 겹치는 이벤트들이 표시된다.', () => {
  setup({
    open: true,
    overlappingEvents: mockOverlappingEvents,
  });

  expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
  expect(screen.getByText('겹치는 일정 1 (2025-01-15 09:00-10:00)')).toBeInTheDocument();
  expect(screen.getByText('겹치는 일정 2 (2025-01-15 09:30-10:30)')).toBeInTheDocument();
});

it('다이얼로그가 닫혀있을 때는 아무것도 렌더링되지 않는다.', () => {
  setup({
    open: false,
    overlappingEvents: mockOverlappingEvents,
  });

  expect(screen.queryByText('일정 겹침 경고')).not.toBeInTheDocument();
});

it('취소 버튼을 클릭하면 onClose 함수가 호출된다.', async () => {
  const mockOnClose = vi.fn();
  const { user } = setup({
    open: true,
    overlappingEvents: mockOverlappingEvents,
    onClose: mockOnClose,
  });

  await user.click(screen.getByText('취소'));
  expect(mockOnClose).toBeCalled();
});

it('계속 진행 버튼을 클릭하면 onConfirm 함수가 호출된다.', async () => {
  const mockOnConfirm = vi.fn();
  const { user } = setup({
    open: true,
    overlappingEvents: mockOverlappingEvents,
    onConfirm: mockOnConfirm,
  });

  await user.click(screen.getByText('계속 진행'));
  expect(mockOnConfirm).toBeCalled();
});

it('겹치는 이벤트가 없을 때도 다이얼로그가 올바르게 렌더링된다.', () => {
  setup({
    open: true,
    overlappingEvents: [],
  });

  expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
});
