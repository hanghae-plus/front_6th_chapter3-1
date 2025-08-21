import { render, screen } from '@testing-library/react';

import { EventItem } from './EventItem';
import { Event } from '../../types';

describe('<EventItem />', () => {
  const baseEvent: Event = {
    id: '1',
    title: '테스트 이벤트',
    date: '2025-10-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '테스트 설명',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  it('event.title을 캡션으로 표시한다', () => {
    const customEvent = { ...baseEvent, title: '회의 일정' };
    render(<EventItem event={customEvent} isNotified={false} />);

    expect(screen.getByText('회의 일정')).toBeInTheDocument();
  });

  it('isNotified=false이면 알림 아이콘이 없다', () => {
    render(<EventItem event={baseEvent} isNotified={false} />);
    expect(screen.queryByTestId('NotificationsIcon')).not.toBeInTheDocument();
  });

  it('isNotified=true이면 알림 아이콘이 있다', () => {
    render(<EventItem event={baseEvent} isNotified={true} />);
    expect(screen.getByTestId('NotificationsIcon')).toBeInTheDocument();
  });
});
