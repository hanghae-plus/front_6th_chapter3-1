import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { MonthView } from './MonthView';
import { Event } from '../../types';

//dateUtils 유틸 함수 목킹
vi.mock('../../utils/dateUtils', async () => {
  // eslint-disable-next-line prettier/prettier
  const actual = await vi.importActual<typeof import('../../utils/dateUtils')>(
    '../../utils/dateUtils'
  );
  return {
    ...actual,
    formatMonth: () => '2025년 10월',
  };
});
describe('<MonthView />', () => {
  const baseEvent: Event = {
    id: '1',
    title: '회의',
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
      <MonthView
        currentDate={new Date('2025-10-01')}
        filteredEvents={[]}
        notifiedEvents={[]}
        holidays={{}}
        weekDays={weekDays}
      />
    );

    weekDays.forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it('공휴일과 이벤트가 날짜 칸에 렌더링된다', () => {
    render(
      <MonthView
        currentDate={new Date('2025-10-01')}
        filteredEvents={[baseEvent]}
        notifiedEvents={['1']}
        holidays={{ '2025-10-03': '개천절' }}
        weekDays={weekDays}
      />
    );

    // 제목 (formatMonth 반환값)
    expect(screen.getByText(/2025년 10월/)).toBeInTheDocument();

    // 날짜 숫자
    expect(screen.getByText('2')).toBeInTheDocument();

    // 이벤트 제목
    expect(screen.getByText('회의')).toBeInTheDocument();

    // 공휴일 표시
    expect(screen.getByText('개천절')).toBeInTheDocument();
  });
});
