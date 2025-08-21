import { render, screen } from '@testing-library/react';

import WeekView from '../../components/WeekView';

it('현재 날짜가 10월 1일일 때 그에 맞는 주의 날짜가 표시된다.', () => {
  const mockData = {
    events: [],
    notifiedEvents: [],
    currentDate: new Date('2025-10-01'),
  };

  render(<WeekView {...mockData} />);

  expect(screen.getByText(28)).toBeInTheDocument();
  expect(screen.getByText(29)).toBeInTheDocument();
  expect(screen.getByText(30)).toBeInTheDocument();
  expect(screen.getByText(1)).toBeInTheDocument();
  expect(screen.getByText(2)).toBeInTheDocument();
  expect(screen.getByText(3)).toBeInTheDocument();
  expect(screen.getByText(4)).toBeInTheDocument();
});

it('주별 뷰에 일정이 있을 경우 달력에 제목이 표시된다.', () => {
  const mockData = {
    events: [
      {
        id: '1',
        title: '기존 회의',
        date: '2025-10-02',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none' as const, interval: 0 },
        notificationTime: 10,
      },
    ],
    notifiedEvents: [],
    currentDate: new Date('2025-10-01'),
  };

  render(<WeekView {...mockData} />);
  expect(screen.getByText('기존 회의')).toBeInTheDocument();
});
