import React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { FreezerManager } from './components/FreezerManager';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#2196f3',
        },
        secondary: {
            main: '#f50057',
        },
    },
});

export const App: React.FC = () => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <FreezerManager />
        </ThemeProvider>
    );
}; 