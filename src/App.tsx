import React, { useState, useMemo } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { FreezerManager } from './components/FreezerManager';

// Create context for theme mode
export const ColorModeContext = React.createContext({
    toggleColorMode: () => {},
    mode: 'light'
});

export const App: React.FC = () => {
    const [mode, setMode] = useState<'light' | 'dark'>('light');

    const colorMode = useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
            },
            mode,
        }),
        [mode],
    );

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    primary: {
                        main: mode === 'light' ? '#757575' : '#9e9e9e',
                        light: mode === 'light' ? '#a4a4a4' : '#cfcfcf',
                        dark: mode === 'light' ? '#494949' : '#707070',
                        contrastText: mode === 'light' ? '#ffffff' : '#000000',
                    },
                    secondary: {
                        main: mode === 'light' ? '#9e9e9e' : '#757575',
                        light: mode === 'light' ? '#cfcfcf' : '#a4a4a4',
                        dark: mode === 'light' ? '#707070' : '#494949',
                        contrastText: mode === 'light' ? '#000000' : '#ffffff',
                    },
                    background: {
                        default: mode === 'light' ? '#ffffff' : '#121212',
                        paper: mode === 'light' ? '#f5f5f5' : '#1e1e1e',
                    },
                    text: {
                        primary: mode === 'light' ? '#424242' : '#e0e0e0',
                        secondary: mode === 'light' ? '#757575' : '#9e9e9e',
                    },
                    action: {
                        hover: mode === 'light' ? '#eeeeee' : '#2c2c2c',
                    }
                },
                components: {
                    MuiPaper: {
                        styleOverrides: {
                            root: {
                                backgroundColor: mode === 'light' ? '#ffffff' : '#1e1e1e',
                                '&.MuiPaper-elevation1': {
                                    boxShadow: mode === 'light' 
                                        ? '0px 2px 1px -1px rgba(0,0,0,0.08),0px 1px 1px 0px rgba(0,0,0,0.06),0px 1px 3px 0px rgba(0,0,0,0.04)'
                                        : '0px 2px 1px -1px rgba(255,255,255,0.05),0px 1px 1px 0px rgba(255,255,255,0.03),0px 1px 3px 0px rgba(255,255,255,0.02)'
                                }
                            }
                        }
                    }
                }
            }),
        [mode],
    );

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <FreezerManager />
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
}; 