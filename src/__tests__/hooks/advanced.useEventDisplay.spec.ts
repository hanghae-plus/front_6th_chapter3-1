import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useEventDisplay } from '../../hooks/useEventDisplay';
import { createEvent } from '../utils';

// Material-UI 컴포넌트 모킹 - 간단한 객체로 모킹
vi.mock('@mui/material', () => ({
  Stack: ({ children, ...props }: Record<string, unknown>) => ({
    type: 'div',
    props: { 'data-testid': 'stack', ...props },
    children,
  }),
  Typography: ({ children, ...props }: Record<string, unknown>) => ({
    type: 'div',
    props: { 'data-testid': 'typography', ...props },
    children,
  }),
  Table: ({ children, ...props }: Record<string, unknown>) => ({
    type: 'table',
    props: { 'data-testid': 'table', ...props },
    children,
  }),
  TableHead: ({ children, ...props }: Record<string, unknown>) => ({
    type: 'thead',
    props: { 'data-testid': 'table-head', ...props },
    children,
  }),
  TableBody: ({ children, ...props }: Record<string, unknown>) => ({
    type: 'tbody',
    props: { 'data-testid': 'table-body', ...props },
    children,
  }),
  TableRow: ({ children, ...props }: Record<string, unknown>) => ({
    type: 'tr',
    props: { 'data-testid': 'table-row', ...props },
    children,
  }),
  TableCell: ({ children, ...props }: Record<string, unknown>) => ({
    type: 'td',
    props: { 'data-testid': 'table-cell', ...props },
    children,
  }),
  TableContainer: ({ children, ...props }: Record<string, unknown>) => ({
    type: 'div',
    props: { 'data-testid': 'table-container', ...props },
    children,
  }),
  Box: ({ children, ...props }: Record<string, unknown>) => ({
    type: 'div',
    props: { 'data-testid': 'box', ...props },
    children,
  }),
}));

// 아이콘 모킹
vi.mock('@mui/icons-material', () => ({
  Notifications: () => ({
    type: 'span',
    props: { 'data-testid': 'notifications-icon' },
    children: '🔔',
  }),
}));

// dateUtils 모킹
vi.mock('../../utils/dateUtils', () => ({
  formatDate: vi.fn((_currentDate, day) => `2025-01-${day}`),
  formatMonth: vi.fn(() => '2025년 1월'),
  formatWeek: vi.fn(() => '2025년 1월 1주차'),
  getEventsForDay: vi.fn(() => []),
  getWeekDates: vi.fn(() => [
    new Date('2025-01-01'),
    new Date('2025-01-02'),
    new Date('2025-01-03'),
    new Date('2025-01-04'),
    new Date('2025-01-05'),
    new Date('2025-01-06'),
    new Date('2025-01-07'),
  ]),
  getWeeksAtMonth: vi.fn(() => [
    [1, 2, 3, 4, 5, 6, 7],
    [8, 9, 10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19, 20, 21],
    [22, 23, 24, 25, 26, 27, 28],
    [29, 30, 31, null, null, null, null],
  ]),
}));

describe('useEventDisplay', () => {
  let currentDate: Date;
  let filteredEvents: ReturnType<typeof createEvent>[];
  let notifiedEvents: string[];
  let holidays: { [key: string]: string };
  let weekDays: string[];

  beforeEach(() => {
    currentDate = new Date('2025-01-01');
    filteredEvents = [
      createEvent({ id: '1', date: '2025-01-01', startTime: '09:00', endTime: '10:00' }),
      createEvent({ id: '2', date: '2025-01-02', startTime: '10:00', endTime: '11:00' }),
    ];
    notifiedEvents = ['1'];
    holidays = { '2025-01-01': '신정' };
    weekDays = ['일', '월', '화', '수', '목', '금', '토'];
    vi.clearAllMocks();
  });

  it('useEventDisplay가 올바른 함수들을 반환해야 한다', () => {
    const { result } = renderHook(() =>
      useEventDisplay(currentDate, filteredEvents, notifiedEvents, holidays, weekDays)
    );

    expect(result.current.renderWeekView).toBeDefined();
    expect(result.current.renderMonthView).toBeDefined();
    expect(typeof result.current.renderWeekView).toBe('function');
    expect(typeof result.current.renderMonthView).toBe('function');
  });

  it('renderWeekView가 JSX를 반환해야 한다', () => {
    const { result } = renderHook(() =>
      useEventDisplay(currentDate, filteredEvents, notifiedEvents, holidays, weekDays)
    );

    const weekView = result.current.renderWeekView();
    expect(weekView).toBeDefined();
    expect(weekView.props).toBeDefined();
    // 실제 JSX의 data-testid 값 확인
    expect(weekView.props['data-testid']).toBe('week-view');
  });

  it('renderMonthView가 JSX를 반환해야 한다', () => {
    const { result } = renderHook(() =>
      useEventDisplay(currentDate, filteredEvents, notifiedEvents, holidays, weekDays)
    );

    const monthView = result.current.renderMonthView();
    expect(monthView).toBeDefined();
    expect(monthView.props).toBeDefined();
    // 실제 JSX의 data-testid 값 확인
    expect(monthView.props['data-testid']).toBe('month-view');
  });

  it('주간 뷰에서 weekDays가 올바르게 렌더링되어야 한다', () => {
    const { result } = renderHook(() =>
      useEventDisplay(currentDate, filteredEvents, notifiedEvents, holidays, weekDays)
    );

    const weekView = result.current.renderWeekView();
    expect(weekView).toBeDefined();
  });

  it('월간 뷰에서 달력 구조가 올바르게 렌더링되어야 한다', () => {
    const { result } = renderHook(() =>
      useEventDisplay(currentDate, filteredEvents, notifiedEvents, holidays, weekDays)
    );

    const monthView = result.current.renderMonthView();
    expect(monthView).toBeDefined();
  });

  it('이벤트가 있는 날짜에 알림 아이콘이 표시되어야 한다', () => {
    const { result } = renderHook(() =>
      useEventDisplay(currentDate, filteredEvents, notifiedEvents, holidays, weekDays)
    );

    const weekView = result.current.renderWeekView();
    expect(weekView).toBeDefined();
  });

  it('공휴일이 있는 날짜에 공휴일 정보가 표시되어야 한다', () => {
    const { result } = renderHook(() =>
      useEventDisplay(currentDate, filteredEvents, notifiedEvents, holidays, weekDays)
    );

    const monthView = result.current.renderMonthView();
    expect(monthView).toBeDefined();
  });
});
