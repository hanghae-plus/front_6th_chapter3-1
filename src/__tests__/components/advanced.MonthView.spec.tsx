import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { events } from '../../__mocks__/fixture/mockEvents.json';
import { MonthView } from '../../components/MonthView';
import { WEEK_DAYS } from '../../policy';
import { Event } from '../../types';

const mockEvents = events as Event[];

const mockHolidays = {
  '2025-08-15': '광복절',
  '2025-08-25': '임시공휴일',
};

describe('MonthView', () => {
  const currentDate = new Date('2025-08-17');

  describe('월간 캘린더 기본 구조', () => {
    test('사용자에게 현재 월 정보가 표시되어야 한다', () => {
      // Given & When: 2025년 8월로 MonthView를 렌더링하면
      render(
        <MonthView
          currentDate={currentDate}
          filteredEvents={[]}
          notifiedEvents={[]}
          holidays={{}}
        />
      );

      // Then: 사용자는 해당 월의 제목을 볼 수 있어야 한다
      expect(screen.getByText('2025년 8월')).toBeInTheDocument();

      // And: 모든 요일이 표시되어야 한다

      WEEK_DAYS.forEach((day) => {
        expect(screen.getByText(day)).toBeInTheDocument();
      });
    });

    test('월간 캘린더의 모든 날짜가 표시되어야 한다', () => {
      // Given & When: MonthView를 렌더링하면
      render(
        <MonthView
          currentDate={currentDate}
          filteredEvents={[]}
          notifiedEvents={[]}
          holidays={{}}
        />
      );

      // Then: 8월의 주요 날짜들이 표시되어야 한다
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('17')).toBeInTheDocument();
      expect(screen.getByText('24')).toBeInTheDocument();
      expect(screen.getByText('31')).toBeInTheDocument();
    });
  });

  describe('이벤트 날짜별 표시', () => {
    test('각 날짜에 해당하는 이벤트가 올바르게 표시되어야 한다', () => {
      // Given & When: 8월 17일과 24일에 이벤트가 있는 상태로 렌더링하면
      render(
        <MonthView
          currentDate={currentDate}
          filteredEvents={mockEvents}
          notifiedEvents={[]}
          holidays={{}}
        />
      );

      // Then: 모든 이벤트가 표시되어야 한다
      expect(screen.getByText('면접공부')).toBeInTheDocument();
      expect(screen.getByText('회의')).toBeInTheDocument();
      expect(screen.getByText('코테풀기')).toBeInTheDocument();
    });

    test('같은 날짜에 여러 이벤트가 있으면 모두 표시되어야 한다', () => {
      // Given & When: 8월 17일에 두 개의 이벤트가 있는 상태로 렌더링하면
      render(
        <MonthView
          currentDate={currentDate}
          filteredEvents={mockEvents}
          notifiedEvents={[]}
          holidays={{}}
        />
      );

      // Then: 같은 날(17일)의 두 이벤트가 모두 보여야 한다
      expect(screen.getByText('면접공부')).toBeInTheDocument();
      expect(screen.getByText('회의')).toBeInTheDocument();

      // And: 다른 날(24일)의 이벤트도 표시되어야 한다
      expect(screen.getByText('코테풀기')).toBeInTheDocument();
    });
  });

  describe('공휴일 표시 기능', () => {
    test('공휴일이 해당 날짜에 표시되어야 한다', () => {
      // Given & When: 공휴일 정보와 함께 렌더링하면
      render(
        <MonthView
          currentDate={currentDate}
          filteredEvents={[]}
          notifiedEvents={[]}
          holidays={mockHolidays}
        />
      );

      // Then: 공휴일이 해당 날짜에 표시되어야 한다
      expect(screen.getByText('광복절')).toBeInTheDocument();
      expect(screen.getByText('임시공휴일')).toBeInTheDocument();
    });

    test('공휴일과 이벤트가 같은 날에 있으면 둘 다 표시되어야 한다', () => {
      // Given: 공휴일과 이벤트가 겹치는 상황
      const eventsWithHoliday: Event[] = [
        ...mockEvents,
        {
          id: '4',
          title: '공휴일과 겹치는 이벤트',
          date: '2025-08-15',
          startTime: '09:00',
          endTime: '10:00',
          description: '공휴일과 겹치는 이벤트',
          location: '회의실',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
      ];

      // When: 렌더링하면
      render(
        <MonthView
          currentDate={currentDate}
          filteredEvents={eventsWithHoliday}
          notifiedEvents={[]}
          holidays={mockHolidays}
        />
      );

      // Then: 공휴일과 이벤트가 모두 표시되어야 한다
      expect(screen.getByText('공휴일과 겹치는 이벤트')).toBeInTheDocument();
      expect(screen.getByText('면접공부')).toBeInTheDocument();
      expect(screen.getByText('회의')).toBeInTheDocument();
    });

    test('공휴일 정보가 없으면 공휴일이 표시되지 않아야 한다', () => {
      // Given & When: 공휴일 정보 없이 렌더링하면
      render(
        <MonthView
          currentDate={currentDate}
          filteredEvents={mockEvents}
          notifiedEvents={[]}
          holidays={{}}
        />
      );

      // Then: 공휴일은 표시되지 않고 이벤트만 표시되어야 한다
      expect(screen.queryByText('광복절')).not.toBeInTheDocument();
      expect(screen.getByText('면접공부')).toBeInTheDocument();
    });
  });

  describe('이벤트 필터링', () => {
    test('필터링된 이벤트만 표시되어야 한다', () => {
      // Given: 일부 이벤트만 필터된 상태
      const filteredEvents = [mockEvents[0], mockEvents[2]]; // 면접공부, 코테풀기만

      // When: MonthView를 렌더링하면
      render(
        <MonthView
          currentDate={currentDate}
          filteredEvents={filteredEvents}
          notifiedEvents={[]}
          holidays={{}}
        />
      );

      // Then: 필터된 이벤트만 보이고 나머지는 보이지 않아야 한다
      expect(screen.getByText('면접공부')).toBeInTheDocument();
      expect(screen.getByText('코테풀기')).toBeInTheDocument();
      expect(screen.queryByText('회의')).not.toBeInTheDocument();
    });

    test('이벤트가 없는 월이면 빈 캘린더가 표시되어야 한다', () => {
      // Given & When: 이벤트가 없는 상태로 렌더링하면
      render(
        <MonthView
          currentDate={currentDate}
          filteredEvents={[]}
          notifiedEvents={[]}
          holidays={{}}
        />
      );

      // Then: 월간 구조는 유지되지만 이벤트는 없어야 한다
      expect(screen.getByTestId('month-view')).toBeInTheDocument();
      expect(screen.getByText('2025년 8월')).toBeInTheDocument();
      expect(screen.getByText('17')).toBeInTheDocument();

      // And: 어떤 이벤트 제목도 표시되지 않아야 한다
      mockEvents.forEach((event) => {
        expect(screen.queryByText(event.title)).not.toBeInTheDocument();
      });
    });
  });

  describe('월간 네비게이션', () => {
    test('다른 월로 이동했을 때 해당 월의 제목과 구조가 표시되어야 한다', () => {
      // Given: 다른 월의 날짜
      const septemberDate = new Date('2025-09-15');

      // When: 9월로 렌더링하면
      render(
        <MonthView
          currentDate={septemberDate}
          filteredEvents={[]}
          notifiedEvents={[]}
          holidays={{}}
        />
      );

      // Then: 9월의 정보가 표시되어야 한다
      expect(screen.getByText('2025년 9월')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();
    });
  });
});
