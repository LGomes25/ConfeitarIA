import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        mb: 3.5,
      }}
    >
      <Box>
        <Typography variant="h1" sx={{ fontSize: { xs: '1.65rem', sm: '2rem' } }}>
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.7 }}>
          {description}
        </Typography>
      </Box>
      {action}
    </Box>
  );
}
