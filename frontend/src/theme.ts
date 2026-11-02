import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#d97493', light: '#f8c8dc', dark: '#b95274' },
    secondary: { main: '#bd9169', light: '#f5f0e6', dark: '#886447' },
    success: { main: '#629b81', light: '#a8e6cf' },
    warning: { main: '#c88753', light: '#ffd3b6' },
    error: { main: '#d66c68', light: '#ffaaa5' },
    background: { default: '#fffaf5', paper: '#ffffff' },
    text: { primary: '#493b37', secondary: '#82736d' },
    divider: '#f0e7e0',
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: '"Inter", "Segoe UI", Arial, sans-serif',
    h1: { fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.04em' },
    h2: { fontSize: '1.45rem', fontWeight: 700, letterSpacing: '-0.03em' },
    h3: { fontSize: '1.1rem', fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { minHeight: 42, borderRadius: 11, paddingInline: 16 },
        containedPrimary: { boxShadow: '0 5px 14px rgba(217, 116, 147, 0.2)' },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: { borderRadius: 18 },
        elevation1: { boxShadow: '0 8px 28px rgba(101, 72, 59, 0.055)' },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: { root: { borderRadius: 11 } },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { color: '#82736d', fontWeight: 700, whiteSpace: 'nowrap' },
        root: { borderColor: '#f0e7e0' },
      },
    },
  },
});
