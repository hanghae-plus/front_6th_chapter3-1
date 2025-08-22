import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { OverlapDialog } from '../../components/OverlapDialog';
import { Event, EventForm } from '../../types';
import { createEvents, createEvent } from '../eventFactory';

const mockEvents: Event[] = createEvents([
  {
    id: '1',
    title: '회의',
    date: '2024-01-15',
    startTime: '10:00',
    endTime: '11:00',
    description: '팀 회의',
    location: '회의실',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '점심 약속',
    date: '2024-01-15',
    startTime: '10:30',
    endTime: '11:30',
    description: '동료와 점심',
    location: '레스토랑',
    category: '개인',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
]);

const mockEventData: Event = createEvent({
  id: '3',
  title: '새 일정',
  date: '2024-01-15',
  startTime: '10:15',
  endTime: '11:15',
  description: '새로운 일정',
  location: '사무실',
  category: '업무',
  repeat: { type: 'none', interval: 1 },
  notificationTime: 10,
});

describe('OverlapDialog', () => {
  let isCloseCalled = false;
  let isConfirmCalled = false;
  let confirmCalledWith: Event | EventForm | null = null;

  const handleClose = () => {
    isCloseCalled = true;
  };

  const handleConfirm = (eventData: Event | EventForm) => {
    isConfirmCalled = true;
    confirmCalledWith = eventData;
  };

  beforeEach(() => {
    isCloseCalled = false;
    isConfirmCalled = false;
    confirmCalledWith = null;
  });

  it('다이얼로그가 열려있을 때 제목과 경고 메시지를 표시한다', () => {
    render(
      <OverlapDialog
        open={true}
        overlappingEvents={mockEvents}
        eventData={mockEventData}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />
    );

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
    expect(screen.getByText(/계속 진행하시겠습니까/)).toBeInTheDocument();
  });

  it('겹치는 일정들의 정보를 표시한다', () => {
    render(
      <OverlapDialog
        open={true}
        overlappingEvents={mockEvents}
        eventData={mockEventData}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />
    );

    expect(screen.getByText(/회의.*2024-01-15.*10:00.*11:00/)).toBeInTheDocument();
    expect(screen.getByText(/점심 약속.*2024-01-15.*10:30.*11:30/)).toBeInTheDocument();
  });

  it('취소 버튼을 클릭하면 onClose가 호출된다', async () => {
    const user = userEvent.setup();

    render(
      <OverlapDialog
        open={true}
        overlappingEvents={mockEvents}
        eventData={mockEventData}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />
    );

    await user.click(screen.getByRole('button', { name: '취소' }));
    expect(isCloseCalled).toBe(true);
  });

  it('계속 진행 버튼을 클릭하면 onConfirm과 onClose가 호출된다', async () => {
    const user = userEvent.setup();

    render(
      <OverlapDialog
        open={true}
        overlappingEvents={mockEvents}
        eventData={mockEventData}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />
    );

    await user.click(screen.getByRole('button', { name: '계속 진행' }));
    expect(isConfirmCalled).toBe(true);
    expect(confirmCalledWith).toEqual(mockEventData);
    expect(isCloseCalled).toBe(true);
  });

  it('eventData가 null일 때 계속 진행 버튼을 클릭하면 onConfirm이 호출되지 않는다', async () => {
    const user = userEvent.setup();

    render(
      <OverlapDialog
        open={true}
        overlappingEvents={mockEvents}
        eventData={null}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />
    );

    await user.click(screen.getByRole('button', { name: '계속 진행' }));
    expect(isConfirmCalled).toBe(false);
    expect(isCloseCalled).toBe(true);
  });

  it('다이얼로그가 닫혀있을 때는 렌더링되지 않는다', () => {
    render(
      <OverlapDialog
        open={false}
        overlappingEvents={mockEvents}
        eventData={mockEventData}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />
    );

    expect(screen.queryByText('일정 겹침 경고')).not.toBeInTheDocument();
  });
});
