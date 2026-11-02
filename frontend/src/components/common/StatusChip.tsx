import { Chip } from '@mui/material';

export function StatusChip({ active }: { active: boolean }) {
  return (
    <Chip
      size="small"
      label={active ? 'Ativo' : 'Inativo'}
      color={active ? 'success' : 'default'}
      sx={{
        fontWeight: 600,
        bgcolor: active ? '#e6f5ee' : '#f1efed',
        color: active ? '#4f806a' : '#82736d',
      }}
    />
  );
}
