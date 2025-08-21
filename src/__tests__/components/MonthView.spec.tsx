import { render, screen } from '@testing-library/react';

import MonthView from '../../components/MonthView';

it('현재 날짜가 10월 1일일 때 그에 맞는 월의 날짜가 표시된다.', () => {
  const mockData = {
    events: [],
    notifiedEvents: [],
    currentDate: new Date('2025-10-01'),
    holidays: {},
  };

  render(<MonthView {...mockData} />);

  // 9월
  expect(screen.getByText(28)).toBeInTheDocument();
  expect(screen.getByText(29)).toBeInTheDocument();
  expect(screen.getByText(30)).toBeInTheDocument();
  // 10월
  expect(screen.getByText(31)).toBeInTheDocument();
  expect(screen.getByText(12)).toBeInTheDocument();
  expect(screen.getByText(13)).toBeInTheDocument();
  expect(screen.getByText(14)).toBeInTheDocument();
});

it('월별 뷰에 일정이 있을 경우 달력에 제목이 표시된다.', () => {
  const mockData = {
    events: [
      {
        id: '1',
        title: '기존 회의',
        date: '2025-10-20',
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
    holidays: {},
  };

  render(<MonthView {...mockData} />);
  expect(screen.getByText('기존 회의')).toBeInTheDocument();
});

it('월별 뷰에 공휴일이 있을 경우 달력에 공휴일이 표시된다.', () => {
  const mockData = {
    events: [],
    notifiedEvents: [],
    currentDate: new Date('2025-10-01'),
    holidays: {
      '2025-10-03': '개천절',
      '2025-10-05': '추석',
      '2025-10-06': '추석',
      '2025-10-07': '추석',
      '2025-10-09': '한글날',
    },
  };

  render(<MonthView {...mockData} />);

  expect(screen.getByText('개천절')).toBeInTheDocument();
  expect(screen.getByText('한글날')).toBeInTheDocument();

  // 추석 텍스트가 1개 이상 표시되는지 확인
  const chuseok = screen.getAllByText('추석');
  expect(chuseok.length).toBeGreaterThan(0);
});
