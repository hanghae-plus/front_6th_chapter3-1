import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { BasicFields } from './BasicFields';

describe('<BasicFields />', () => {
  const setup = () => {
    const setTitle = vi.fn();
    const setDate = vi.fn();
    const setDescription = vi.fn();
    const setLocation = vi.fn();

    render(
      <BasicFields
        title="팀 회의"
        setTitle={setTitle}
        date="2025-10-01"
        setDate={setDate}
        description="주간 보고"
        setDescription={setDescription}
        location="회의실 A"
        setLocation={setLocation}
      />
    );

    return { setTitle, setDate, setDescription, setLocation };
  };

  it('모든 필드 라벨이 화면에 표시된다', () => {
    setup();

    expect(screen.getByLabelText('제목')).toBeInTheDocument();
    expect(screen.getByLabelText('날짜')).toBeInTheDocument();
    expect(screen.getByLabelText('설명')).toBeInTheDocument();
    expect(screen.getByLabelText('위치')).toBeInTheDocument();
  });

  it('라벨과 초기값이 올바르게 렌더링된다', () => {
    setup();

    expect(screen.getByLabelText('제목')).toHaveValue('팀 회의');
    expect(screen.getByLabelText('날짜')).toHaveValue('2025-10-01');
    expect(screen.getByLabelText('설명')).toHaveValue('주간 보고');
    expect(screen.getByLabelText('위치')).toHaveValue('회의실 A');
  });
});
