import { Alert, Box, CircularProgress, Typography } from '@mui/material';

export function LoadingState({ label = 'Carregando...' }: { label?: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, py: 7 }}>
      <CircularProgress size={22} />
      <Typography color="text.secondary">{label}</Typography>
    </Box>
  );
}

export function ErrorState({ message }: { message: string }) {
  return <Alert severity="error">{message}</Alert>;
}

export function EmptyState({ children }: { children: string }) {
  return (
    <Box sx={{ py: 6, px: 2, textAlign: 'center' }}>
      <Typography color="text.secondary">{children}</Typography>
    </Box>
  );
}
