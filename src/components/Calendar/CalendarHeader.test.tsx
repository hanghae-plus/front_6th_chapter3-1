import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CalendarHeader } from './CalendarHeader';

describe('<CalendarHeader />', () => {
  it('이전/다음 버튼 클릭 시 onNavigate가 올바른 인자로 호출된다', async () => {
    const user = userEvent.setup();
    const setView = vi.fn();
    const onNavigate = vi.fn();

    render(<CalendarHeader view="week" setView={setView} onNavigate={onNavigate} />);

    await user.click(screen.getByRole('button', { name: /Previous/i }));
    await user.click(screen.getByRole('button', { name: /Next/i }));

    expect(onNavigate).toHaveBeenCalledTimes(2);
    expect(onNavigate).toHaveBeenNthCalledWith(1, 'prev');
    expect(onNavigate).toHaveBeenNthCalledWith(2, 'next');
  });

  it('주간에서 월간으로 뷰 변경 시 월간 뷰로 변경된다', async () => {
    const user = userEvent.setup();
    const setView = vi.fn();
    const onNavigate = vi.fn();

    render(<CalendarHeader view="week" setView={setView} onNavigate={onNavigate} />);

    // 월 별 뷰 선택
    const comboboxes = screen.getAllByRole('combobox');
    const monthCombobox = comboboxes.find((combobox) => combobox.textContent === 'Week');
    expect(monthCombobox!).toBeInTheDocument();
    await user.click(monthCombobox!);

    // Month 선택
    const monthOption = await screen.findByRole('option', { name: /Month/i });
    await user.click(monthOption);
    expect(setView).toHaveBeenCalledWith('month');
  });

  it('월간에서 주간으로 뷰 변경 시 주간 뷰로 변경된다', async () => {
    const user = userEvent.setup();
    const setView = vi.fn();
    const onNavigate = vi.fn();

    render(<CalendarHeader view="month" setView={setView} onNavigate={onNavigate} />);

    // 주 별 뷰 선택
    const comboboxes = screen.getAllByRole('combobox');
    const weekCombobox = comboboxes.find((combobox) => combobox.textContent === 'Month');
    expect(weekCombobox!).toBeInTheDocument();
    await user.click(weekCombobox!);

    // Week 선택
    const weekOption = await screen.findByRole('option', { name: /Week/i });
    await user.click(weekOption);
    expect(setView).toHaveBeenCalledWith('week');
  });
});
