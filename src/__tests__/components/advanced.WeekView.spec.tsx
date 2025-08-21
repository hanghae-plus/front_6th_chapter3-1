import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { events } from '../../__mocks__/fixture/mockEvents.json';
import { WeekView } from '../../components/WeekView';
import { WEEK_DAYS } from '../../policy';
import { Event, RepeatType } from '../../types';

const mockEvents = events as Event[];

describe('WeekView', () => {
  const currentDate = new Date('2025-08-22');

  describe('주간 캘린더 기본 구조', () => {
    test('사용자에게 현재 주차 정보가 표시되어야 한다', () => {
      // Given & When: 현재 날짜로 WeekView를 렌더링하면
      render(<WeekView currentDate={currentDate} filteredEvents={[]} notifiedEvents={[]} />);

      // Then: 사용자는 해당 주의 제목을 볼 수 있어야 한다
      expect(screen.getByText(/2025년 8월 3주/)).toBeInTheDocument();

      // And: 모든 요일이 표시되어야 한다
      WEEK_DAYS.forEach((day) => {
        expect(screen.getByText(day)).toBeInTheDocument();
      });
    });
  });

  describe('이벤트 날짜별 표시', () => {
    test('이벤트가 해당하는 날짜에만 표시되어야 한다', () => {
      // Given & When: 월요일과 수요일에 이벤트가 있는 상태로 렌더링하면
      render(
        <WeekView currentDate={currentDate} filteredEvents={mockEvents} notifiedEvents={[]} />
      );

      // Then: 모든 이벤트가 표시되어야 한다
      expect(screen.getByText('면접공부')).toBeInTheDocument();
      expect(screen.getByText('회의')).toBeInTheDocument();
    });

    test('현재 주에 속하지 않는 이벤트는 표시되지 않아야 한다', () => {
      // Given: 다른 주의 이벤트가 포함된 이벤트 목록
      const eventsWithOtherWeek: Event[] = [
        ...mockEvents,
        {
          id: '4',
          title: '다음 주 월요일 미팅',
          date: '2025-08-25',
          startTime: '10:00',
          endTime: '11:00',
          description: '다음 주 미팅',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
      ];

      // When: 현재 주간 뷰를 렌더링하면
      render(
        <WeekView
          currentDate={currentDate}
          filteredEvents={eventsWithOtherWeek}
          notifiedEvents={[]}
        />
      );

      // Then: 현재 주의 이벤트만 보여야 한다
      expect(screen.getByText('면접공부')).toBeInTheDocument();
      expect(screen.queryByText('다음 주 월요일 미팅')).not.toBeInTheDocument();
    });

    test('같은 날짜에 여러 이벤트가 있으면 모두 표시되어야 한다', () => {
      // Given & When: 수요일에 두 개의 이벤트가 있는 상태로 렌더링하면
      render(
        <WeekView currentDate={currentDate} filteredEvents={mockEvents} notifiedEvents={[]} />
      );

      // Then: 같은 날(수요일)의 두 이벤트가 모두 보여야 한다
      expect(screen.getByText('면접공부')).toBeInTheDocument();
      expect(screen.getByText('회의')).toBeInTheDocument();
    });
  });

  describe('이벤트 필터링', () => {
    test('필터링된 이벤트만 표시되어야 한다', () => {
      // Given: 일부 이벤트만 필터된 상태
      const filteredEvents = [mockEvents[0]];

      // When: WeekView를 렌더링하면
      render(
        <WeekView currentDate={currentDate} filteredEvents={filteredEvents} notifiedEvents={[]} />
      );

      // Then: 필터된 이벤트만 보이고 나머지는 보이지 않아야 한다
      expect(screen.getByText('면접공부')).toBeInTheDocument();
      expect(screen.queryByText('회의')).not.toBeInTheDocument();
      expect(screen.queryByText('코테풀기')).not.toBeInTheDocument();
    });

    test('이벤트가 없으면 빈 주간 뷰가 표시되어야 한다', () => {
      // Given & When: 이벤트가 없는 상태로 렌더링하면
      render(<WeekView currentDate={currentDate} filteredEvents={[]} notifiedEvents={[]} />);

      // Then: 주간 구조는 유지되지만 이벤트는 없어야 한다
      expect(screen.getByTestId('week-view')).toBeInTheDocument();
      expect(screen.getByText('월')).toBeInTheDocument();

      // 어떤 이벤트 제목도 표시되지 않아야 한다
      mockEvents.forEach((event) => {
        expect(screen.queryByText(event.title)).not.toBeInTheDocument();
      });
    });
  });

  describe('주간 네비게이션', () => {
    test('다른 주로 이동했을 때 해당 주의 이벤트가 표시되어야 한다', () => {
      // Given: 다음 주의 날짜와 이벤트
      const nextWeekDate = new Date('2025-08-29');
      const nextWeekEvent = {
        id: '5',
        title: '다음 주 화요일 미팅',
        date: '2025-08-26',
        startTime: '11:00',
        endTime: '12:00',
        description: '다음 주 미팅',
        location: '회의실 C',
        category: '업무',
        repeat: { type: 'none' as RepeatType, interval: 0 },
        notificationTime: 5,
      };

      // When: 다음 주 날짜로 렌더링하면
      render(
        <WeekView currentDate={nextWeekDate} filteredEvents={[nextWeekEvent]} notifiedEvents={[]} />
      );

      // Then: 다음 주의 이벤트가 표시되고 이전 주 이벤트는 보이지 않아야 한다
      expect(screen.getByText('다음 주 화요일 미팅')).toBeInTheDocument();
      expect(screen.queryByText('월요일 회의')).not.toBeInTheDocument();
    });
  });
});
