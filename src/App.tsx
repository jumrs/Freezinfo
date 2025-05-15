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
                        main: mode === 'light' ? '#757575' : '#666666',
                        light: mode === 'light' ? '#a4a4a4' : '#808080',
                        dark: mode === 'light' ? '#494949' : '#404040',
                        contrastText: mode === 'light' ? '#ffffff' : '#e0e0e0',
                    },
                    secondary: {
                        main: mode === 'light' ? '#9e9e9e' : '#595959',
                        light: mode === 'light' ? '#cfcfcf' : '#737373',
                        dark: mode === 'light' ? '#707070' : '#333333',
                        contrastText: mode === 'light' ? '#000000' : '#e0e0e0',
                    },
                    background: {
                        default: mode === 'light' ? '#ffffff' : '#121212',
                        paper: mode === 'light' ? '#f5f5f5' : '#1a1a1a',
                    },
                    text: {
                        primary: mode === 'light' ? '#424242' : '#b3b3b3',
                        secondary: mode === 'light' ? '#757575' : '#808080',
                    },
                    action: {
                        hover: mode === 'light' ? '#eeeeee' : '#262626',
                    }
                },
                components: {
                    MuiPaper: {
                        styleOverrides: {
                            root: {
                                backgroundColor: mode === 'light' ? '#ffffff' : '#1a1a1a',
                                '&.MuiPaper-elevation1': {
                                    boxShadow: mode === 'light' 
                                        ? '0px 2px 1px -1px rgba(0,0,0,0.08),0px 1px 1px 0px rgba(0,0,0,0.06),0px 1px 3px 0px rgba(0,0,0,0.04)'
                                        : '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)'
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