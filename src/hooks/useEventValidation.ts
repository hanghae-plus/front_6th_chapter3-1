import { useSnackbar } from 'notistack';

export const useEventValidation = () => {
  const { enqueueSnackbar } = useSnackbar();

  const validateEventForm = (formData: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    startTimeError: string | null;
    endTimeError: string | null;
  }): boolean => {
    if (!formData.title || !formData.date || !formData.startTime || !formData.endTime) {
      enqueueSnackbar('필수 정보를 모두 입력해주세요.', { variant: 'error' });
      return false;
    }

    if (formData.startTimeError || formData.endTimeError) {
      enqueueSnackbar('시간 설정을 확인해주세요.', { variant: 'error' });
      return false;
    }

    return true;
  };

  return { validateEventForm };
};
