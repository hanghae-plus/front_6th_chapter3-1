import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { CategorySelect } from './CategorySelect';
import { categories } from '../../constants/categories';

describe('<CategorySelect />', () => {
  it('라벨과 카테고리 옵션들이 렌더링된다', () => {
    render(<CategorySelect value="" onChange={vi.fn()} />);

    // 라벨 확인
    expect(screen.getByText('카테고리')).toBeInTheDocument();

    // 옵션 목록 (Select 내부는 처음엔 닫혀있으므로 열어야 보임)
    const select = within(screen.getByLabelText(/카테고리/)).getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('value props가 선택값으로 반영된다', () => {
    render(<CategorySelect value={categories[0]} onChange={vi.fn()} />);
    expect(within(screen.getByLabelText(/카테고리/)).getByRole('combobox')).toHaveTextContent(
      categories[0]
    );
  });

  it('옵션 선택 시 onChange가 호출된다', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<CategorySelect value="" onChange={onChange} />);

    // 셀렉트 열기
    const select = within(screen.getByLabelText(/카테고리/)).getByRole('combobox');
    await user.click(select);

    // 첫 번째 옵션 클릭
    const option = await screen.findByRole('option', { name: `${categories[0]}-option` });
    await user.click(option);

    expect(onChange).toHaveBeenCalledWith(categories[0]);
  });
});
