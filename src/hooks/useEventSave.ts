import { useSnackbar } from 'notistack';

import { Event, EventForm, RepeatType } from '../types';
import { findOverlappingEvents } from '../utils/eventOverlap';
import { validateEventData } from '../utils/eventUtils';

interface UseEventSaveParams {
  // useEventForm에서 가져올 데이터들
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;
  isRepeating: boolean;
  repeatType: string;
  repeatInterval: number;
  repeatEndDate: string;
  notificationTime: number;
  startTimeError: string | null;
  endTimeError: string | null;
  editingEvent: Event | null;

  // 외부 의존성들
  events: Event[];
  saveEvent: (event: Event | EventForm) => Promise<void>;
  resetForm: () => void;
  openOverlapDialog: (events: Event[]) => void;
}

/**
 * 이벤트 저장 훅
 * @param params - 이벤트 저장 파라미터
 * @returns 이벤트 저장 함수
 */
export const useEventSave = ({
  title,
  date,
  startTime,
  endTime,
  description,
  location,
  category,
  isRepeating,
  repeatType,
  repeatInterval,
  repeatEndDate,
  notificationTime,
  startTimeError,
  endTimeError,
  editingEvent,
  events,
  saveEvent,
  resetForm,
  openOverlapDialog,
}: UseEventSaveParams) => {
  const { enqueueSnackbar } = useSnackbar();

  // 이벤트 데이터 생성
  const createEventData = (): Event | EventForm => ({
    id: editingEvent ? editingEvent.id : undefined,
    title,
    date,
    startTime,
    endTime,
    description,
    location,
    category,
    repeat: {
      type: isRepeating ? (repeatType as RepeatType) : 'none',
      interval: repeatInterval,
      endDate: repeatEndDate || undefined,
    },
    notificationTime,
  });

  // 이벤트 저장
  const handleSaveEvent = async () => {
    const error = validateEventData(title, date, startTime, endTime, startTimeError, endTimeError);

    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
      return;
    }

    const eventData = createEventData();
    const overlapping = findOverlappingEvents(eventData, events);

    if (overlapping.length > 0) {
      openOverlapDialog(overlapping);
    } else {
      await saveEvent(eventData);
      resetForm();
    }
  };

  // 중복 확인 후 저장
  const handleConfirmSave = async () => {
    const eventData = createEventData();
    await saveEvent(eventData);
    resetForm();
  };

  return {
    handleSaveEvent,
    handleConfirmSave,
    createEventData,
  };
};
