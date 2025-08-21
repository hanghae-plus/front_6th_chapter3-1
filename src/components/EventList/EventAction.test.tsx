import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { EventActions } from './EventActions';
import { Event } from '../../types';

describe('<EventActions />', () => {
  const baseEvent: Event = {
    id: '1',
    title: '팀 회의',
    date: '2025-10-02',
    startTime: '09:00',
    endTime: '10:00',
    description: '테스트 설명',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  it('Edit 버튼 클릭 시 onEdit이 이벤트 객체와 함께 호출된다', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<EventActions event={baseEvent} onEdit={onEdit} onDelete={onDelete} />);

    await user.click(screen.getByRole('button', { name: /Edit event/i }));

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith(baseEvent);
  });

  it('Delete 버튼 클릭 시 onDelete가 이벤트 id와 함께 호출된다', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<EventActions event={baseEvent} onEdit={onEdit} onDelete={onDelete} />);

    await user.click(screen.getByRole('button', { name: /Delete event/i }));

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(baseEvent.id);
  });
});
