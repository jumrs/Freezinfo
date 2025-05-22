import React, { ReactNode } from 'react';
import { Paper, Typography, IconButton, Box } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

interface DraggableWidgetProps {
    title: string;
    children: ReactNode;
    isDragging?: boolean;
    dragHandleProps?: any;
}

export const DraggableWidget: React.FC<DraggableWidgetProps> = ({ 
    title, 
    children, 
    isDragging = false,
    dragHandleProps
}) => {
    return (
        <Paper 
            sx={{ 
                p: 2, 
                mb: 3,
                opacity: isDragging ? 0.6 : 1,
                transition: 'all 0.2s',
                boxShadow: isDragging ? 5 : 1,
                transform: isDragging ? 'scale(1.02)' : 'scale(1)',
                position: 'relative',
                zIndex: isDragging ? 1100 : 1
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                    {title}
                </Typography>
                <Box 
                    component="div"
                    sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        '&:focus': {
                            outline: 'none'
                        }
                    }}
                    {...dragHandleProps}
                >
                    <DragIndicatorIcon 
                        sx={{ 
                            cursor: 'grab', 
                            '&:active': { cursor: 'grabbing' },
                            color: 'text.secondary',
                            fontSize: '1.8rem'
                        }} 
                    />
                </Box>
            </Box>
            {children}
        </Paper>
    );
}; 