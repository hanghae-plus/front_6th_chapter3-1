import { useSnackbar } from 'notistack';
import { useState } from 'react';

import { Event, EventForm as EventFormType } from '../types';
import { useCalendarView } from './useCalendarView';
import { useEventForm } from './useEventForm';
import { useEventOperations } from './useEventOperations';
import { useNotifications } from './useNotifications';
import { useSearch } from './useSearch';
import { findOverlappingEvents } from '../utils/eventOverlap';

export const useEventManager = () => {
  const formState = useEventForm();
  const {
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
    editingEvent,
    setEditingEvent,
    resetForm,
  } = formState;

  const { events, saveEvent, deleteEvent } = useEventOperations(Boolean(editingEvent), () =>
    setEditingEvent(null)
  );

  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);

  const { enqueueSnackbar } = useSnackbar();

  const addOrUpdateEvent = async () => {
    if (!title || !date || !startTime || !endTime) {
      enqueueSnackbar('필수 정보를 모두 입력해주세요.', { variant: 'error' });
      return;
    }

    const eventData: Event | EventFormType = {
      id: editingEvent ? editingEvent.id : undefined,
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      repeat: {
        type: isRepeating ? repeatType : 'none',
        interval: repeatInterval,
        endDate: repeatEndDate || undefined,
      },
      notificationTime,
    };

    const overlapping = findOverlappingEvents(eventData, events);
    if (overlapping.length > 0) {
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
    } else {
      await saveEvent(eventData);
      resetForm();
    }
  };

  return {
    formState,
    addOrUpdateEvent,
    saveEvent,
    calendarView: {
      view,
      setView,
      currentDate,
      holidays,
      navigate,
    },
    eventList: {
      searchTerm,
      setSearchTerm,
      filteredEvents,
      notifiedEvents,
      onEdit: formState.editEvent,
      onDelete: deleteEvent,
    },
    dialogs: {
      isOverlapDialogOpen,
      setIsOverlapDialogOpen,
      overlappingEvents,
    },
    notifications,
    setNotifications,
  };
};
