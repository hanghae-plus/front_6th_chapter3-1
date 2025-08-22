import { useSnackbar } from 'notistack';

import { Event, EventForm } from '../types';
import { EventValidationResult } from '../utils/eventValidation';

interface UseEventSubmitProps {
  eventData: Event | EventForm;
  eventFormValidation: EventValidationResult;
  events: Event[];
  openOverlapDialog: (events: Event[]) => void;
  saveEvent: (event: Event) => void;
  resetForm: () => void;
  isOverlap: (eventData: Event | EventForm, events: Event[]) => boolean;
}

export const useEventSubmit = ({
  eventData,
  eventFormValidation,
  saveEvent,
  resetForm,
  events,
  openOverlapDialog,
  isOverlap,
}: UseEventSubmitProps) => {
  const { enqueueSnackbar } = useSnackbar();

  const addOrUpdateEvent = async () => {
    if (!eventFormValidation.ok) {
      enqueueSnackbar(eventFormValidation.errorMessage || '유효성 검사 실패', { variant: 'error' });
      return;
    }

    const isOverlapping = isOverlap(eventData, events);
    if (isOverlapping) {
      openOverlapDialog(events);
      return;
    }

    await saveEvent(eventData as Event);
    resetForm();
  };

  return {
    addOrUpdateEvent,
  };
};
