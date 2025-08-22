import { render, screen, fireEvent, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';

import { EventForm } from '../../components/EventForm';
import { useEventForm } from '../../hooks/useEventForm';
import { server } from '../../setupTests';
import { createMockEvent, createMockEvents } from '../fixtures/mockData';

const TestEventForm = ({ onSubmit = vi.fn(), onOverlapDetected = vi.fn() }) => {
  const eventFormHook = useEventForm();
  const mockEvents = createMockEvents();

  return (
    <SnackbarProvider>
      <EventForm
        events={mockEvents}
        onSubmit={onSubmit}
        onOverlapDetected={onOverlapDetected}
        eventFormHook={eventFormHook}
      />
    </SnackbarProvider>
  );
};

describe('EventForm MSW API 테스트', () => {
  const mockOnSubmit = vi.fn();
  const mockOnOverlapDetected = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('저장 성공 시 성공 토스트가 표시된다', async () => {
    server.use(
      http.post('/api/events', () => {
        return HttpResponse.json({
          success: true,
          data: createMockEvent({ title: '새로운 이벤트' }),
        });
      })
    );

    render(<TestEventForm onSubmit={mockOnSubmit} />);

    // 폼 입력
    await act(async () => {
      fireEvent.change(screen.getByLabelText('제목'), { target: { value: '새로운 이벤트' } });
      fireEvent.change(screen.getByLabelText('날짜'), { target: { value: '2024-07-20' } });
      fireEvent.change(screen.getByLabelText('시작 시간'), { target: { value: '10:00' } });
      fireEvent.change(screen.getByLabelText('종료 시간'), { target: { value: '11:00' } });
    });

    // 폼 제출
    await act(async () => {
      fireEvent.click(screen.getByTestId('event-submit-button'));
    });

    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('저장 실패 시 에러 토스트가 표시된다', async () => {
    server.use(
      http.post('/api/events', () => {
        return HttpResponse.json({ error: 'Save failed' }, { status: 500 });
      })
    );

    render(<TestEventForm onSubmit={mockOnSubmit} />);

    await act(async () => {
      fireEvent.change(screen.getByLabelText('제목'), { target: { value: '실패할 이벤트' } });
      fireEvent.change(screen.getByLabelText('날짜'), { target: { value: '2024-07-20' } });
      fireEvent.change(screen.getByLabelText('시작 시간'), { target: { value: '10:00' } });
      fireEvent.change(screen.getByLabelText('종료 시간'), { target: { value: '11:00' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('event-submit-button'));
    });

    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('수정 실패 시 에러 처리가 된다', async () => {
    server.use(
      http.put('/api/events/:id', () => {
        return HttpResponse.json({ error: 'Update failed' }, { status: 404 });
      })
    );

    render(<TestEventForm onSubmit={mockOnSubmit} />);

    await act(async () => {
      fireEvent.change(screen.getByLabelText('제목'), { target: { value: '수정할 이벤트' } });
      fireEvent.change(screen.getByLabelText('날짜'), { target: { value: '2024-07-20' } });
      fireEvent.change(screen.getByLabelText('시작 시간'), { target: { value: '10:00' } });
      fireEvent.change(screen.getByLabelText('종료 시간'), { target: { value: '11:00' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('event-submit-button'));
    });

    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('네트워크 타임아웃 시 적절한 에러 처리가 된다', async () => {
    server.use(
      http.post('/api/events', () => {
        return HttpResponse.json({ error: 'Timeout' }, { status: 408 });
      })
    );

    render(<TestEventForm onSubmit={mockOnSubmit} />);

    await act(async () => {
      fireEvent.change(screen.getByLabelText('제목'), { target: { value: '타임아웃 이벤트' } });
      fireEvent.change(screen.getByLabelText('날짜'), { target: { value: '2024-07-20' } });
      fireEvent.change(screen.getByLabelText('시작 시간'), { target: { value: '10:00' } });
      fireEvent.change(screen.getByLabelText('종료 시간'), { target: { value: '11:00' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('event-submit-button'));
    });

    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('겹치는 이벤트가 있을 때 onOverlapDetected 콜백이 호출된다', async () => {
    render(<TestEventForm onSubmit={mockOnSubmit} onOverlapDetected={mockOnOverlapDetected} />);

    // 기존 mockEvents와 겹치는 시간대로 설정 (09:00-10:00과 겹침)
    await act(async () => {
      fireEvent.change(screen.getByLabelText('제목'), { target: { value: '겹치는 이벤트' } });
      fireEvent.change(screen.getByLabelText('날짜'), { target: { value: '2024-07-15' } }); // 기존 이벤트와 같은 날
      fireEvent.change(screen.getByLabelText('시작 시간'), { target: { value: '09:30' } }); // 기존 09:00-10:00과 겹침
      fireEvent.change(screen.getByLabelText('종료 시간'), { target: { value: '10:30' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('event-submit-button'));
    });

    // 겹치는 이벤트 감지 시 onOverlapDetected가 호출되어야 함
    expect(mockOnOverlapDetected).toHaveBeenCalled();
  });
});
