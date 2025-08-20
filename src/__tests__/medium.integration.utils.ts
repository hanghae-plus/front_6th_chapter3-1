import { screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { expect } from 'vitest';

export const fillEventForm = async (
  user: ReturnType<typeof userEvent.setup>,
  eventData: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    description: string;
    location: string;
  },
  shouldClear: boolean = false
) => {
  const fieldMappings = [
    { field: '제목', value: eventData.title },
    { field: '날짜', value: eventData.date },
    { field: '시작 시간', value: eventData.startTime },
    { field: '종료 시간', value: eventData.endTime },
    { field: '설명', value: eventData.description },
    { field: '위치', value: eventData.location },
  ];

  for (const { field, value } of fieldMappings) {
    const element = screen.getByLabelText(field);
    if (shouldClear) {
      await user.clear(element);
    }
    await user.type(element, value);
  }
};

export const verifyEventInList = async (
  eventList: HTMLElement,
  eventData: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    description: string;
    location: string;
    category: string;
    notificationTime: string;
  }
) => {
  await within(eventList).findByText(eventData.title);
  expect(within(eventList).getByText(eventData.date)).toBeInTheDocument();
  expect(
    within(eventList).getByText(`${eventData.startTime} - ${eventData.endTime}`)
  ).toBeInTheDocument();
  expect(within(eventList).getByText(eventData.description)).toBeInTheDocument();
  expect(within(eventList).getByText(eventData.location)).toBeInTheDocument();
  expect(within(eventList).getByText(`카테고리: ${eventData.category}`)).toBeInTheDocument();
  expect(within(eventList).getByText(`알림: ${eventData.notificationTime}`)).toBeInTheDocument();
};

export const selectComboboxOption = async (
  user: ReturnType<typeof userEvent.setup>,
  comboboxIndex: number,
  optionName: string
) => {
  const select = screen.getAllByRole('combobox')[comboboxIndex];
  await user.click(select);
  const option = await screen.findByRole('option', { name: new RegExp(optionName) });
  await user.click(option);
};

export const toggleRepeatCheckbox = async (
  user: ReturnType<typeof userEvent.setup>,
  action: 'checked' | 'unchecked'
) => {
  const repeatCheckbox = screen.getByRole('checkbox', { name: '반복 일정' });

  if (action === 'checked') {
    expect(repeatCheckbox).not.toBeChecked();
    await user.click(repeatCheckbox);
    expect(repeatCheckbox).toBeChecked();
  } else {
    expect(repeatCheckbox).toBeChecked();
    await user.click(repeatCheckbox);
    expect(repeatCheckbox).not.toBeChecked();
  }
};
