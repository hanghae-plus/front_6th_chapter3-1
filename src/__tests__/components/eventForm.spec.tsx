import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';

import { EventFormComponent } from '../../components/EventForm';
import { useEventForm } from '../../hooks/useEventForm';
import { Event } from '../../types';

function EventFormWrapper({
  events,
  saveEvent,
}: {
  events: Event[];
  saveEvent: (eventData: Event | any) => Promise<void>;
}) {
  const eventForm = useEventForm();
  return (
    <SnackbarProvider>
      <EventFormComponent events={events} eventForm={eventForm} saveEvent={saveEvent} />
    </SnackbarProvider>
  );
}

describe('EventForm', () => {
  it('초기 랜더링 시 빈 폼이 랜더링된다', () => {
    render(<EventFormWrapper events={[]} saveEvent={() => Promise.resolve()} />);

    expect(screen.getByLabelText('제목')).toHaveValue('');
    expect(screen.getByLabelText('날짜')).toHaveValue('');
    expect(screen.getByLabelText('시작 시간')).toHaveValue('');
    expect(screen.getByLabelText('종료 시간')).toHaveValue('');
    expect(screen.getByLabelText('설명')).toHaveValue('');
    expect(screen.getByLabelText('위치')).toHaveValue('');
  });

  it('일정 추가 시 필수 값이 비어있으면 에러 토스트 메시지가 노출된다', async () => {
    const user = userEvent.setup();
    render(<EventFormWrapper events={[]} saveEvent={() => Promise.resolve()} />);

    expect(screen.getByLabelText('제목')).toHaveValue('');
    expect(screen.getByLabelText('날짜')).toHaveValue('');
    expect(screen.getByLabelText('시작 시간')).toHaveValue('');
    expect(screen.getByLabelText('종료 시간')).toHaveValue('');

    const addButton = screen.getByTestId('event-submit-button');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('필수 정보를 모두 입력해주세요.')).toBeInTheDocument();
    });
  });
});
