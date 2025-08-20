import { useMemo, useState } from 'react';

import { Event } from '../types';
import { getFilteredEvents } from '../utils/eventUtils';

/**
 * 이벤트 검색 훅
 * - 이벤트 목록을 검색어와 현재 뷰에 따라 필터링
 * - 검색어 변경 시 자동으로 필터링 결과 업데이트
 * @param events - 검색할 이벤트 목록
 * @param currentDate - 현재 날짜
 * @param view - 현재 뷰 'week' | 'month'
 */
export const useSearch = (events: Event[], currentDate: Date, view: 'week' | 'month') => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = useMemo(() => {
    return getFilteredEvents(events, searchTerm, currentDate, view);
  }, [events, searchTerm, currentDate, view]);

  return {
    searchTerm,
    setSearchTerm,
    filteredEvents,
  };
};
