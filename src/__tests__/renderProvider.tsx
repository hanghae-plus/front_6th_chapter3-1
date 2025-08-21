import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { ReactElement } from 'react';
import { Provider } from '../Provider';

export function renderWithProvider(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult {
  return render(ui, {
    wrapper: ({ children }) => <Provider>{children}</Provider>,
    ...options,
  });
}
