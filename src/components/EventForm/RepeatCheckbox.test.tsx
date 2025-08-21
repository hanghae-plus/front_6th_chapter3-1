import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { RepeatCheckbox } from './RepeatCheckbox';

describe('<RepeatCheckbox />', () => {
  it('라벨과 체크 상태가 올바르게 렌더링된다', () => {
    const { rerender } = render(<RepeatCheckbox isRepeating={true} onChange={vi.fn()} />);

    const checkbox = screen.getByRole('checkbox', { name: '반복 일정' });
    expect(checkbox).toBeChecked();

    rerender(<RepeatCheckbox isRepeating={false} onChange={vi.fn()} />);
    expect(screen.getByRole('checkbox', { name: '반복 일정' })).not.toBeChecked();
  });

  it('체크박스를 클릭하면 onChange가 호출된다', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<RepeatCheckbox isRepeating={false} onChange={onChange} />);

    const checkbox = screen.getByRole('checkbox', { name: '반복 일정' });
    await user.click(checkbox);

    expect(onChange).toHaveBeenCalledWith(true);
  });
});
