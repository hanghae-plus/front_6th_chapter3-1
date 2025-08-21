import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { TimeFields } from './TimeFields';

describe('<TimeFields />', () => {
  it('라벨과 초기값이 올바르게 렌더링된다', () => {
    render(
      <TimeFields
        startTime="09:00"
        endTime="18:00"
        startTimeError={null}
        endTimeError={null}
        onStartTimeChange={vi.fn()}
        onEndTimeChange={vi.fn()}
        onTimeBlur={vi.fn()}
      />
    );

    expect(screen.getByLabelText('시작 시간')).toHaveValue('09:00');
    expect(screen.getByLabelText('종료 시간')).toHaveValue('18:00');
  });

  it('시간 입력 변경 시 핸들러가 호출된다', async () => {
    const user = userEvent.setup();
    const onStartTimeChange = vi.fn();
    const onEndTimeChange = vi.fn();
    const onTimeBlur = vi.fn();

    render(
      <TimeFields
        startTime="09:00"
        endTime="18:00"
        startTimeError={null}
        endTimeError={null}
        onStartTimeChange={onStartTimeChange}
        onEndTimeChange={onEndTimeChange}
        onTimeBlur={onTimeBlur}
      />
    );

    const startInput = screen.getByLabelText('시작 시간');
    const endInput = screen.getByLabelText('종료 시간');

    // 값 변경
    await user.clear(startInput);
    await user.type(startInput, '10:00');
    expect(onStartTimeChange).toHaveBeenCalled();

    await user.clear(endInput);
    await user.type(endInput, '19:00');
    expect(onEndTimeChange).toHaveBeenCalled();

    // blur
    await user.tab();
    expect(onTimeBlur).toHaveBeenCalled();
  });

  it('에러 메시지가 있으면 Tooltip이 열린 상태가 된다', () => {
    render(
      <TimeFields
        startTime="09:00"
        endTime="18:00"
        startTimeError="시작 시간이 잘못되었습니다"
        endTimeError="종료 시간이 잘못되었습니다"
        onStartTimeChange={vi.fn()}
        onEndTimeChange={vi.fn()}
        onTimeBlur={vi.fn()}
      />
    );

    // TextField 자체가 에러 상태인지 확인
    expect(screen.getByLabelText('시작 시간')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('종료 시간')).toHaveAttribute('aria-invalid', 'true');

    // Tooltip text 확인 (에러 메시지가 DOM에 나타남)
    expect(screen.getByText('시작 시간이 잘못되었습니다')).toBeInTheDocument();
    expect(screen.getByText('종료 시간이 잘못되었습니다')).toBeInTheDocument();
  });
});
