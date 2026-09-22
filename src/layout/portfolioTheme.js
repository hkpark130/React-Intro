import { createTheme } from '@mui/material/styles';

export const portfolioTheme = createTheme({
  palette: {
    primary: { main: '#17685e', dark: '#104e46', light: '#eaf3f0' },
    secondary: { main: '#17685e' },
    background: { default: '#f6f8f7', paper: '#ffffff' },
    text: { primary: '#192d2e', secondary: '#5e716e' },
    divider: '#dde5e2',
    yellow: { main: '#82652b' },
    purple: { main: '#17685e' },
  },
  typography: {
    fontFamily: '"Pretendard Variable", Pretendard, "Malgun Gothic", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 740, lineHeight: 1.25, letterSpacing: '-.045em' },
    h2: { fontSize: '1.7rem', fontWeight: 700, lineHeight: 1.4, letterSpacing: '-.035em' },
    h3: { fontSize: '1.35rem', fontWeight: 680, lineHeight: 1.45, letterSpacing: '-.025em' },
    h4: { fontSize: '1.25rem', fontWeight: 650, lineHeight: 1.5, letterSpacing: '-.025em' },
    h5: { fontSize: '1.15rem', fontWeight: 650, lineHeight: 1.5 },
    h6: { fontSize: '1.05rem', fontWeight: 650, lineHeight: 1.6 },
    body1: { fontSize: '1rem', lineHeight: 1.85 },
    body2: { fontSize: '.9rem', lineHeight: 1.75 },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: '-.01em' },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCssBaseline: { styleOverrides: { body: { backgroundColor: '#f6f8f7' } } },
    MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { borderRadius: 6, padding: '8px 16px' } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiLink: { defaultProps: { underline: 'hover' }, styleOverrides: { root: { textUnderlineOffset: '4px' } } },
    MuiChip: { styleOverrides: { root: { fontSize: '.8rem', fontWeight: 550 } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 12, boxShadow: '0 16px 64px #192d2e24' } } },
    MuiOutlinedInput: { styleOverrides: { root: { backgroundColor: '#fff' }, notchedOutline: { borderColor: '#dde5e2' } } },
    MuiTableCell: { styleOverrides: { root: { borderColor: '#dde5e2' }, head: { backgroundColor: '#f6f8f7', fontWeight: 650 } } },
    MuiTooltip: { styleOverrides: { tooltip: { backgroundColor: '#192d2e', fontSize: 12 } } },
  },
});
