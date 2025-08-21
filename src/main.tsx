import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.tsx';
import { EventFormProvider } from './context/FormContext.tsx';

const theme = createTheme();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <EventFormProvider>
        <SnackbarProvider>
          <App />
        </SnackbarProvider>
      </EventFormProvider>
    </ThemeProvider>
  </React.StrictMode>
);
