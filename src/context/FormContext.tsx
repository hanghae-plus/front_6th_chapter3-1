import React from 'react';
import { createContext, useContext } from 'react';

import { useEventForm } from '../hooks/useEventForm';

const FormContext = createContext<ReturnType<typeof useEventForm> | null>(null);

export function EventFormProvider({ children }: { children: React.ReactNode }) {
  const formValue = useEventForm();
  return <FormContext.Provider value={formValue}>{children}</FormContext.Provider>;
}

export function useFormContext() {
  const context = useContext(FormContext);
  if (!context) throw new Error('useFormContext must be used inside FormProvider');
  return context;
}
