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
                    ...(mode === 'light'
                        ? {
                            // Light Mode Palette
                            primary: {
                                main: '#333333', // Darker Gray
                                light: '#5c5c5c',
                                dark: '#1a1a1a',
                                contrastText: '#ffffff',
                            },
                            secondary: {
                                main: '#757575', // Medium Gray
                                light: '#a4a4a4',
                                dark: '#494949',
                                contrastText: '#ffffff',
                            },
                            background: {
                                default: '#f9f9f9', // Very light gray
                                paper: '#ffffff',   // White
                            },
                            text: {
                                primary: '#212121', // Very dark gray
                                secondary: '#757575', // Medium gray
                            },
                            action: {
                                hover: 'rgba(0, 0, 0, 0.04)', // Subtle dark hover
                            },
                        }
                        : {
                            // Dark Mode Palette
                            primary: {
                                main: '#bbbbbb', // Light Gray
                                light: '#e7e7e7',
                                dark: '#8c8c8c',
                                contrastText: '#121212',
                            },
                            secondary: {
                                main: '#757575', // Medium Gray (can be adjusted if needed for more contrast)
                                light: '#a4a4a4',
                                dark: '#494949',
                                contrastText: '#e0e0e0',
                            },
                            background: {
                                default: '#121212', // Standard dark
                                paper: '#1e1e1e',   // Slightly lighter dark for paper
                            },
                            text: {
                                primary: '#e0e0e0', // Light gray
                                secondary: '#b3b3b3', // Slightly darker light gray
                            },
                            action: {
                                hover: 'rgba(255, 255, 255, 0.08)', // Subtle light hover
                            },
                        }),
                },
                components: {
                    MuiPaper: {
                        styleOverrides: {
                            root: {
                                backgroundColor: mode === 'light' ? '#ffffff' : '#1e1e1e', // Consistent with new paper bg
                                '&.MuiPaper-elevation1': {
                                    boxShadow: mode === 'light'
                                        ? '0px 2px 6px rgba(0, 0, 0, 0.04)' // Softer shadow for light mode
                                        : '0px 2px 8px rgba(0, 0, 0, 0.25)', // Adjusted shadow for dark mode
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