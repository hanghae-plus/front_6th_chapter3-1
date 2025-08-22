import { Event } from '../types';
import { useEventEditor } from './useEventEditor';
import { useEventFormData } from './useEventFormData';
import { useEventRepeatSettings } from './useEventRepeatSettings';
import { useEventTimeManagement } from './useEventTimeManagement';

export const useEventForm = (initialEvent?: Event) => {
  const {
    title,
    date,
    description,
    location,
    category,
    notificationTime,
    resetEventForm,
    updateEditEventForm,
    setTitle,
    setCategory,
    setDate,
    setLocation,
    setNotificationTime,
    setDescription,
  } = useEventFormData(initialEvent);
  const {
    isRepeating,
    repeatEndDate,
    repeatInterval,
    repeatType,
    setIsRepeating,
    setRepeatEndDate,
    setRepeatInterval,
    setRepeatType,
    resetRepeat,
    editRepeat,
  } = useEventRepeatSettings(initialEvent);
  const {
    startTime,
    endTime,
    startTimeError,
    endTimeError,
    setEndTime,
    setStartTime,
    handleEndTimeChange,
    handleStartTimeChange,
    resetTime,
    editTime,
  } = useEventTimeManagement(initialEvent);
  const { editingEvent, setEditingEvent } = useEventEditor();

  const resetForm = () => {
    resetEventForm();
    resetRepeat();
    resetTime();
  };

  const editEvent = (event: Event) => {
    setEditingEvent(event);
    updateEditEventForm(event);
    editRepeat(event);
    editTime(event);
  };

  return {
    title,
    setTitle,
    date,
    setDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    description,
    setDescription,
    location,
    setLocation,
    category,
    setCategory,
    isRepeating,
    setIsRepeating,
    repeatType,
    setRepeatType,
    repeatInterval,
    setRepeatInterval,
    repeatEndDate,
    setRepeatEndDate,
    notificationTime,
    setNotificationTime,
    startTimeError,
    endTimeError,
    editingEvent,
    setEditingEvent,
    handleStartTimeChange,
    handleEndTimeChange,
    resetForm,
    editEvent,
  };
};
