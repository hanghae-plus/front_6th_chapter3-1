import { useState } from 'react';

import { Event } from '../types';

/**
 * 중복된 이벤트 alert
 * @description isOverlapDialogOpen: 열림 여부
 * @description overlappingEvents: 중복 이벤트 목록
 * @description openOverlapDialog: 열기
 * @description closeOverlapDialog: 닫기
 */
export const useOverlapDialog = () => {
  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);

  const openOverlapDialog = (events: Event[]) => {
    setOverlappingEvents(events);
    setIsOverlapDialogOpen(true);
  };

  const closeOverlapDialog = () => {
    setIsOverlapDialogOpen(false);
    setOverlappingEvents([]);
  };

  return {
    isOverlapDialogOpen,
    overlappingEvents,
    openOverlapDialog,
    closeOverlapDialog,
  };
};
