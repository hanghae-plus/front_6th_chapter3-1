import { useSnackbar } from 'notistack';
import { useEffect, useRef } from 'react';
import { proxy, useSnapshot } from 'valtio';

import { Event, EventForm } from '../types';

interface EventOperationsState {
  events: Event[];
  isLoading: boolean;
  error: string | null;
}

export const eventOperationsState = proxy<EventOperationsState>({
  events: [],
  isLoading: false,
  error: null,
});

export const useEvents = (): Readonly<Event[]> => {
  const snap = useSnapshot(eventOperationsState);
  return snap.events;
};

export const useEventOperations = (isEditing: boolean, onSave?: () => void) => {
  const state = useRef(eventOperationsState).current;
  const stateProxy = useSnapshot(state);
  const { enqueueSnackbar } = useSnackbar();

  const setLoading = (loading: boolean) => {
    state.isLoading = loading;
  };

  const setError = (error: string | null) => {
    state.error = error;
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const { events } = await response.json();
      state.events = events;
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('이벤트 로딩 실패');
      enqueueSnackbar('이벤트 로딩 실패', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const saveEvent = async (eventData: Event | EventForm) => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (isEditing) {
        response = await fetch(`/api/events/${(eventData as Event).id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
      } else {
        response = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save event');
      }

      await fetchEvents();
      onSave?.();
      enqueueSnackbar(isEditing ? '일정이 수정되었습니다.' : '일정이 추가되었습니다.', {
        variant: 'success',
      });
    } catch (error) {
      console.error('Error saving event:', error);
      setError('일정 저장 실패');
      enqueueSnackbar('일정 저장 실패', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      await fetchEvents();
      enqueueSnackbar('일정이 삭제되었습니다.', { variant: 'info' });
    } catch (error) {
      console.error('Error deleting event:', error);
      setError('일정 삭제 실패');
      enqueueSnackbar('일정 삭제 실패', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  async function init() {
    await fetchEvents();
    enqueueSnackbar('일정 로딩 완료!', { variant: 'info' });
  }

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    // 상태 - 프록시 스냅샷 사용
    events: stateProxy.events,
    isLoading: stateProxy.isLoading,
    error: stateProxy.error,

    // 액션
    fetchEvents,
    saveEvent,
    deleteEvent,
  };
};
