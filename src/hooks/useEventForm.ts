import { useCallback, useRef } from 'react';
import { proxy, useSnapshot } from 'valtio';

import { Event, EventForm, RepeatType } from '../types';
import { getTimeErrorMessage } from '../utils/timeValidation';

interface FormState {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;
  isRepeating: boolean;
  repeatType: RepeatType;
  repeatInterval: number;
  repeatEndDate: string;
  notificationTime: number;
}

interface FormErrors {
  startTimeError: string | null;
  endTimeError: string | null;
}

const getInitialFormState = (): FormState => ({
  title: '',
  date: '',
  startTime: '',
  endTime: '',
  description: '',
  location: '',
  category: '업무',
  isRepeating: false,
  repeatType: 'none',
  repeatInterval: 1,
  repeatEndDate: '',
  notificationTime: 10,
});

const getInitialErrors = (): FormErrors => ({
  startTimeError: null,
  endTimeError: null,
});

const formState = proxy(getInitialFormState());
const errorsState = proxy(getInitialErrors());
const editingState = proxy<{ event: Event | null }>({ event: null });

export const useEventForm = () => {
  const form = useRef(formState).current;
  const formProxy = useSnapshot(form);
  const errors = useRef(errorsState).current;
  const errorsProxy = useSnapshot(errors);
  const editing = useRef(editingState).current;
  const editingProxy = useSnapshot(editing);

  // 폼 필드 업데이트 함수 - 프록시 직접 수정
  const updateField = useCallback(
    <K extends keyof FormState>(field: K, value: FormState[K]) => {
      form[field] = value;
    },
    [form]
  );

  // 시간 필드 전용 핸들러 (유효성 검사 포함)
  const onChangeStartTime = useCallback(
    (value: string) => {
      form.startTime = value;
      const timeErrors = getTimeErrorMessage(value, form.endTime);
      errors.startTimeError = timeErrors.startTimeError;
      errors.endTimeError = timeErrors.endTimeError;
    },
    [errors, form]
  );

  const onChangeEndTime = useCallback(
    (value: string) => {
      form.endTime = value;
      const timeErrors = getTimeErrorMessage(form.startTime, value);
      errors.startTimeError = timeErrors.startTimeError;
      errors.endTimeError = timeErrors.endTimeError;
    },
    [errors, form]
  );

  // 폼 초기화
  const resetForm = useCallback(() => {
    Object.assign(form, getInitialFormState());
    Object.assign(errors, getInitialErrors());
    editing.event = null;
  }, [form, errors, editing]);

  // 이벤트 편집 모드 설정
  const editEvent = useCallback(
    (event: Event) => {
      editing.event = event;
      // Event -> FormState 매핑
      form.title = event.title;
      form.date = event.date;
      form.startTime = event.startTime;
      form.endTime = event.endTime;
      form.description = event.description;
      form.location = event.location;
      form.category = event.category;
      form.isRepeating = event.repeat.type !== 'none';
      form.repeatType = event.repeat.type;
      form.repeatInterval = event.repeat.interval;
      form.repeatEndDate = event.repeat.endDate || '';
      form.notificationTime = event.notificationTime;
      Object.assign(errors, getInitialErrors());
    },
    [form, errors, editing]
  );

  // EventForm 객체 생성
  const getEventFormData = useCallback(
    (): Event | EventForm => ({
      id: editing.event?.id,
      title: form.title,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      description: form.description,
      location: form.location,
      category: form.category,
      repeat: {
        type: form.isRepeating ? form.repeatType : 'none',
        interval: form.repeatInterval,
        endDate: form.repeatEndDate || undefined,
      },
      notificationTime: form.notificationTime,
    }),
    [form, editing]
  );

  return {
    // 폼 상태 - 프록시 스냅샷 사용
    form: formProxy,
    updateField,

    // 에러 상태 - 프록시 스냅샷 사용
    errors: errorsProxy,

    // 편집 상태
    editingEvent: editingProxy.event,
    setEditingEvent: (event: Event | null) => {
      editing.event = event;
    },

    // 핸들러
    onChangeStartTime,
    onChangeEndTime,
    resetForm,
    editEvent,
    getEventFormData,

    startTimeError: errorsProxy.startTimeError,
    endTimeError: errorsProxy.endTimeError,
  };
};
