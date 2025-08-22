import { Button, Stack, Typography } from '@mui/material';
import React from 'react';

import { Event } from '../types';

export const EventForm = ({
  children,
  editingEvent,
  addOrUpdateEvent,
}: {
  children: React.ReactNode;
  editingEvent?: Event | null;
  addOrUpdateEvent: () => Promise<void>;
}) => {
  return (
    <Stack spacing={2} sx={{ width: '20%' }}>
      <Typography variant="h4">{editingEvent ? '일정 수정' : '일정 추가'}</Typography>
      {children}
      <Button
        data-testid="event-submit-button"
        onClick={addOrUpdateEvent}
        variant="contained"
        color="primary"
      >
        {editingEvent ? '일정 수정' : '일정 추가'}
      </Button>
    </Stack>
  );
};
