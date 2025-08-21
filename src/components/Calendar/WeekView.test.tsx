import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { WeekView } from './WeekView';
import { Event } from '../../types';

// dateUtils 모듈 목킹
vi.mock('../../utils/dateUtils', async () => {
  // eslint-disable-next-line prettier/prettier
  const actual = await vi.importActual<typeof import('../../utils/dateUtils')>(
    '../../utils/dateUtils'
  );
  return {
    ...actual,
    formatWeek: () => '2025년 10월 1주차',
    getWeekDates: () => [
      new Date('2025-10-01'),
      new Date('2025-10-02'),
      new Date('2025-10-03'),
      new Date('2025-10-04'),
      new Date('2025-10-05'),
      new Date('2025-10-06'),
      new Date('2025-10-07'),
    ],
  };
});

describe('<WeekView />', () => {
  const baseEvent: Event = {
    id: '1',
    title: '팀 회의',
    date: '2025-10-02',
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  it('weekDays가 헤더에 모두 표시된다', () => {
    render(
      <WeekView
        currentDate={new Date('2025-10-01')}
        filteredEvents={[]}
        notifiedEvents={[]}
        weekDays={weekDays}
      />
    );

    weekDays.forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it('제목, 날짜, 이벤트가 표시된다', () => {
    render(
      <WeekView
        currentDate={new Date('2025-10-01')}
        filteredEvents={[baseEvent]}
        notifiedEvents={['1']}
        weekDays={weekDays}
      />
    );

    // 제목 (formatWeek 결과)
    expect(screen.getByText(/2025년 10월 1주차/)).toBeInTheDocument();

    // 날짜 숫자
    expect(screen.getByText('2')).toBeInTheDocument();

    // 이벤트 제목
    expect(screen.getByText('팀 회의')).toBeInTheDocument();
  });
});
