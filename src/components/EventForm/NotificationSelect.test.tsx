import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { NotificationSelect } from './NotificationSelect';
import { notificationOptions } from '../../constants/notificationOptions';

describe('<NotificationSelect />', () => {
  it('라벨 텍스트와 현재 선택값이 렌더링된다', () => {
    render(<NotificationSelect value={10} onChange={vi.fn()} />);

    // FormLabel 텍스트만 확인
    expect(screen.getByText('알림 설정')).toBeInTheDocument();

    // Select는 combobox 역할로 확인
    expect(screen.getByRole('combobox')).toHaveTextContent(
      notificationOptions.find((o) => o.value === 10)!.label
    );
  });

  it('옵션 선택 시 combobox 텍스트가 바뀐다', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<NotificationSelect value={10} onChange={onChange} />);
    // combobox 열기
    await user.click(screen.getByRole('combobox'));

    // 옵션 클릭
    await user.click(await screen.findByRole('option', { name: notificationOptions[1].label }));

    // combobox 텍스트가 바뀌었는지 확인
    expect(screen.getByRole('combobox')).toHaveTextContent(notificationOptions[1].label);
  });
});
