import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';

import { Event, EventForm } from '../types';

// 이벤트 관련 CRUD 작업을 제공하는 커스텀 훅
export const useEventOperations = (editing: boolean, onSave?: () => void) => {
  // 이벤트 목록 상태 관리
  const [events, setEvents] = useState<Event[]>([]);
  // 스낵바 알림 함수
  const { enqueueSnackbar } = useSnackbar();

  // 이벤트 목록을 서버에서 불러오는 함수
  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const { events } = await response.json();
      setEvents(events); // 상태에 이벤트 목록 저장
    } catch (error) {
      console.error('Error fetching events:', error);
      enqueueSnackbar('이벤트 로딩 실패', { variant: 'error' }); // 에러 알림
    }
  };

  // 이벤트를 저장(추가/수정)하는 함수
  const saveEvent = async (eventData: Event | EventForm) => {
    try {
      let response;
      if (editing) {
        // 수정 모드: PUT 요청
        response = await fetch(`/api/events/${(eventData as Event).id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
      } else {
        // 추가 모드: POST 요청
        response = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save event');
      }

      await fetchEvents(); // 저장 후 이벤트 목록 갱신
      onSave?.(); // 저장 후 콜백 실행(옵션)
      enqueueSnackbar(editing ? '일정이 수정되었습니다.' : '일정이 추가되었습니다.', {
        variant: 'success',
      }); // 성공 알림
    } catch (error) {
      console.error('Error saving event:', error);
      enqueueSnackbar('일정 저장 실패', { variant: 'error' }); // 에러 알림
    }
  };

  // 이벤트를 삭제하는 함수
  const deleteEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      await fetchEvents(); // 삭제 후 이벤트 목록 갱신
      enqueueSnackbar('일정이 삭제되었습니다.', { variant: 'info' }); // 삭제 성공 알림
    } catch (error) {
      console.error('Error deleting event:', error);
      enqueueSnackbar('일정 삭제 실패', { variant: 'error' }); // 에러 알림
    }
  };

  // 컴포넌트 마운트 시 초기화 함수
  async function init() {
    await fetchEvents(); // 이벤트 목록 불러오기
    enqueueSnackbar('일정 로딩 완료!', { variant: 'info' }); // 로딩 완료 알림
  }

  // 컴포넌트가 처음 렌더링될 때 init 실행
  useEffect(() => {
    init();
  }, []);

  // 훅에서 제공하는 값 및 함수들 반환
  return { events, fetchEvents, saveEvent, deleteEvent };
};
