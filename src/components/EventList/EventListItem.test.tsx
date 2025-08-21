import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { EventListItem } from './EventListItem';
import { Event } from '../../types';

describe('<EventListItem />', () => {
  const baseEvent: Event = {
    id: '1',
    title: '팀 회의',
    date: '2025-10-02',
    startTime: '09:00',
    endTime: '10:00',
    description: '주간 회의',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  const notificationOptions = [
    { value: 10, label: '10분 전' },
    { value: 30, label: '30분 전' },
  ];

  it('이벤트 기본 정보가 렌더링된다', () => {
    render(
      <EventListItem
        event={baseEvent}
        isNotified={false}
        notificationOptions={notificationOptions}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('팀 회의')).toBeInTheDocument();
    expect(screen.getByText('2025-10-02')).toBeInTheDocument();
    expect(screen.getByText('09:00 - 10:00')).toBeInTheDocument();
    expect(screen.getByText('주간 회의')).toBeInTheDocument();
    expect(screen.getByText('회의실 A')).toBeInTheDocument();
    expect(screen.getByText(/카테고리: 업무/)).toBeInTheDocument();
    expect(screen.getByText(/알림: 10분 전/)).toBeInTheDocument();
  });

  it('반복 이벤트 정보가 표시된다', () => {
    const repeatEvent: Event = {
      ...baseEvent,
      repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31' },
    };

    render(
      <EventListItem
        event={repeatEvent}
        isNotified={false}
        notificationOptions={notificationOptions}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText(/반복: 1주마다 \(종료: 2025-12-31\)/)).toBeInTheDocument();
  });

  it('Edit/Delete 버튼 클릭 시 콜백이 호출된다', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <EventListItem
        event={baseEvent}
        isNotified={false}
        notificationOptions={notificationOptions}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    await user.click(screen.getByRole('button', { name: /Edit event/i }));
    expect(onEdit).toHaveBeenCalledWith(baseEvent);

    await user.click(screen.getByRole('button', { name: /Delete event/i }));
    expect(onDelete).toHaveBeenCalledWith(baseEvent.id);
  });
});
