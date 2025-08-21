import { render, screen } from '@testing-library/react';

import { MonthView } from '../../components/MonthView';
import { Event } from '../../types';
import { createTestEvents } from '../utils';

const mockEvents: Event[] = createTestEvents([
  {
    id: '1',
    title: '팀 회의',
    date: '2025-08-01',
  },
  {
    id: '2',
    title: '점심 약속',
    date: '2025-08-15',
  },
  {
    id: '3',
    title: '운동',
    date: '2025-08-30',
  },
]);

const mockHolidays = {
  '2025-08-15': '광복절',
  '2025-01-01': '신정',
};

describe('MonthView 컴포넌트', () => {
  describe('기본 렌더링', () => {
    it('월간뷰 컨테이너가 올바르게 렌더링된다', () => {
      const currentDate = new Date('2025-08-01');
      render(
        <MonthView
          currentDate={currentDate}
          filteredEvents={[]}
          notifiedEvents={[]}
          holidays={{}}
        />
      );

      const monthView = screen.getByTestId('month-view');
      expect(monthView).toBeInTheDocument();
    });

    it('요일 헤더(일~토)가 올바르게 표시된다', () => {
      const currentDate = new Date('2025-08-01');
      render(
        <MonthView
          currentDate={currentDate}
          filteredEvents={[]}
          notifiedEvents={[]}
          holidays={{}}
        />
      );

      const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
      weekDays.forEach((day) => {
        expect(screen.getByText(day)).toBeInTheDocument();
      });
    });

    it('현재 월의 날짜들이 올바르게 표시된다', () => {
      const currentDate = new Date('2025-08-01');
      render(
        <MonthView
          currentDate={currentDate}
          filteredEvents={[]}
          notifiedEvents={[]}
          holidays={{}}
        />
      );

      // 8월 초일, 중간일, 말일
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('31')).toBeInTheDocument();
    });
  });

  describe('월별 제목 표시', () => {
    it('현재 월의 제목이 올바른 형식으로 표시된다', () => {
      const currentDate = new Date('2025-08-01');
      render(
        <MonthView
          currentDate={currentDate}
          filteredEvents={[]}
          notifiedEvents={[]}
          holidays={{}}
        />
      );

      expect(screen.getByText('2025년 8월')).toBeInTheDocument();
    });
  });

  describe('일정 표시 기능', () => {
    it('해당 월에 일정이 있을 때 올바른 날짜에 일정이 표시된다', () => {
      const currentDate = new Date('2025-08-01');
      render(
        <MonthView
          currentDate={currentDate}
          filteredEvents={mockEvents}
          notifiedEvents={[]}
          holidays={{}}
        />
      );

      expect(screen.getByText('팀 회의')).toBeInTheDocument();
      expect(screen.getByText('점심 약속')).toBeInTheDocument();
      expect(screen.getByText('운동')).toBeInTheDocument();
    });

    it('해당 월에 일정이 없을 때 빈 셀로 표시된다', () => {
      const currentDate = new Date('2025-09-01');
      render(
        <MonthView
          currentDate={currentDate}
          filteredEvents={[]}
          notifiedEvents={[]}
          holidays={{}}
        />
      );

      expect(screen.queryByText('팀 회의')).not.toBeInTheDocument();
      expect(screen.queryByText('점심 약속')).not.toBeInTheDocument();
      expect(screen.queryByText('운동')).not.toBeInTheDocument();
    });

    it('하루에 여러 일정이 있을 때 모든 일정이 표시된다', () => {
      const multipleEvents = [
        ...mockEvents,
        ...createTestEvents([
          {
            id: '4',
            title: '추가 회의',
            date: '2025-08-01',
          },
        ]),
      ];

      const currentDate = new Date('2025-08-01');
      render(
        <MonthView
          currentDate={currentDate}
          filteredEvents={multipleEvents}
          notifiedEvents={[]}
          holidays={{}}
        />
      );

      expect(screen.getByText('팀 회의')).toBeInTheDocument();
      expect(screen.getByText('추가 회의')).toBeInTheDocument();
    });
  });

  describe('공휴일 표시 기능', () => {
    it('공휴일이 있을 때 해당 날짜에 공휴일 이름이 표시된다', () => {
      const currentDate = new Date('2025-08-01');
      render(
        <MonthView
          currentDate={currentDate}
          filteredEvents={[]}
          notifiedEvents={[]}
          holidays={mockHolidays}
        />
      );

      expect(screen.getByText('광복절')).toBeInTheDocument();
    });

    it('공휴일이 없을 때 공휴일 이름이 표시되지 않는다', () => {
      const currentDate = new Date('2025-08-01');
      render(
        <MonthView
          currentDate={currentDate}
          filteredEvents={[]}
          notifiedEvents={[]}
          holidays={{}}
        />
      );

      expect(screen.queryByText('광복절')).not.toBeInTheDocument();
    });
  });

  describe('일정 세부 정보 표시', () => {
    it('일정 제목만 표시되고 시간은 별도로 표시되지 않는다', () => {
      const currentDate = new Date('2025-08-01');
      render(
        <MonthView
          currentDate={currentDate}
          filteredEvents={mockEvents}
          notifiedEvents={[]}
          holidays={{}}
        />
      );

      // MonthView에서는 제목만 표시되고 시간은 표시되지 않음
      expect(screen.getByText('팀 회의')).toBeInTheDocument();
      expect(screen.queryByText('09:00-10:00')).not.toBeInTheDocument();
    });
  });

  describe('알림 기능', () => {
    it('알림을 받지 않은 일정에는 알림 아이콘이 표시되지 않는다', () => {
      const currentDate = new Date('2025-08-01');
      render(
        <MonthView
          currentDate={currentDate}
          filteredEvents={mockEvents}
          notifiedEvents={[]}
          holidays={{}}
        />
      );

      // notifiedEvents가 빈 배열이므로 알림 아이콘이 표시되지 않음
      const notificationIcons = screen.queryAllByTestId('NotificationsIcon');
      expect(notificationIcons).toHaveLength(0);
    });

    it('이미 알림을 받은 일정(notifiedEvents)에 알림 아이콘이 표시된다', () => {
      const currentDate = new Date('2025-08-01');
      render(
        <MonthView
          currentDate={currentDate}
          filteredEvents={mockEvents}
          notifiedEvents={['1']} // 첫 번째 일정이 알림을 받음
          holidays={{}}
        />
      );

      const notificationIcons = screen.getAllByTestId('NotificationsIcon');
      expect(notificationIcons).toHaveLength(1);
    });
  });

  describe('날짜 경계 처리', () => {
    it('월 경계를 넘나드는 캘린더가 올바르게 처리된다', () => {
      const currentDate = new Date('2025-02-28');
      render(
        <MonthView
          currentDate={currentDate}
          filteredEvents={[]}
          notifiedEvents={[]}
          holidays={{}}
        />
      );

      const monthView = screen.getByTestId('month-view');
      expect(monthView).toBeInTheDocument();

      // 월별 제목이 표시되어야 함
      expect(screen.getByText('2025년 2월')).toBeInTheDocument();
    });
  });
});
