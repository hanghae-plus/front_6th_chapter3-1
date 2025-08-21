import { useEffect, useState } from 'react';

import { fetchHolidays } from '../apis/fetchHolidays';

/**
 * 달력 뷰 관리 훅
 * @description view: 현재 뷰 타입(month, week), setView: 뷰 타입 변경 함수,
 * @description currentDate: 현재 날짜, setCurrentDate: 날짜 변경,
 * @description holidays: 현재 날짜의 공휴일 목록,
 * @description navigate: 날짜 이동(prev: 이전 날짜, next: 다음 날짜)
 */
export const useCalendarView = () => {
  const [view, setView] = useState<'week' | 'month'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [holidays, setHolidays] = useState<{ [key: string]: string }>({});

  const navigate = (direction: 'prev' | 'next') => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      if (view === 'week') {
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
      } else if (view === 'month') {
        newDate.setDate(1); // 항상 1일로 설정
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
      }
      return newDate;
    });
  };

  useEffect(() => {
    setHolidays(fetchHolidays(currentDate));
  }, [currentDate]);

  return { view, setView, currentDate, setCurrentDate, holidays, navigate };
};
