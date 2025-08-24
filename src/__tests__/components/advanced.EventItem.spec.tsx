import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { events } from '../../__mocks__/fixture/mockEvents.json';
import { EventItem } from '../../components/EventItem';
import { Event } from '../../types';

const mockEvent = events[0] as Event;

describe('EventItem', () => {
  describe('기본 이벤트 표시', () => {
    test('이벤트 제목이 표시되어야 한다', () => {
      // Given & When: EventItem을 렌더링하면
      render(<EventItem event={mockEvent} isNotified={false} />);

      // Then: 이벤트 제목이 표시되어야 한다
      expect(screen.getByText('면접공부')).toBeInTheDocument();
    });
  });

  describe('알림 상태 표시', () => {
    test('알림된 이벤트일 때 알림 아이콘이 표시되어야 한다', () => {
      // Given & When: 알림된 상태로 렌더링하면
      render(<EventItem event={mockEvent} isNotified={true} />);

      // Then: 알림 아이콘과 제목이 모두 표시되어야 한다
      expect(screen.getByTestId('NotificationsIcon')).toBeInTheDocument();
      expect(screen.getByText('면접공부')).toBeInTheDocument();
    });

    test('알림되지 않은 이벤트일 때 알림 아이콘이 표시되지 않아야 한다', () => {
      // Given & When: 알림되지 않은 상태로 렌더링하면
      render(<EventItem event={mockEvent} isNotified={false} />);

      // Then: 알림 아이콘은 없고 제목만 표시되어야 한다
      expect(screen.queryByTestId('NotificationsIcon')).not.toBeInTheDocument();
      expect(screen.getByText('면접공부')).toBeInTheDocument();
    });
  });
});
