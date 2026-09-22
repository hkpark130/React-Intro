import { createTheme } from '@mui/material/styles';

export const blogTheme = createTheme({
  palette: {
    primary: { main: '#17685e', dark: '#105349', light: '#eaf2ef' },
    secondary: { main: '#17685e' },
    background: { default: '#f6f8f7', paper: '#ffffff' },
    text: { primary: '#192d2e', secondary: '#5e716e' },
    divider: '#dde5e2',
    yellow: { main: '#946d20' },
    purple: { main: '#635696' },
  },
  typography: {
    fontFamily: '"Pretendard Variable", Pretendard, "Malgun Gothic", sans-serif',
    h1: { fontWeight: 720, letterSpacing: '-.045em', lineHeight: 1.15 },
    h2: { fontWeight: 700, letterSpacing: '-.035em', lineHeight: 1.25 },
    h3: { fontWeight: 700, letterSpacing: '-.035em', lineHeight: 1.3 },
    h4: { fontWeight: 680, letterSpacing: '-.03em', lineHeight: 1.35 },
    h5: { fontWeight: 650, letterSpacing: '-.02em', lineHeight: 1.4 },
    h6: { fontWeight: 650, lineHeight: 1.5 },
    body1: { lineHeight: 1.85 },
    body2: { lineHeight: 1.75 },
    button: { textTransform: 'none', fontWeight: 650, letterSpacing: '-.01em' },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { borderRadius: 8, padding: '10px 20px' } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 18, boxShadow: '0 24px 100px #192d2e33' } } },
    MuiOutlinedInput: { styleOverrides: { root: { backgroundColor: '#fff', borderRadius: 8 }, notchedOutline: { borderColor: '#cbd8d2' } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 550, fontSize: '.78rem' } } },
    MuiTooltip: { styleOverrides: { tooltip: { backgroundColor: '#192d2e', fontSize: 12 } } },
    MuiPaginationItem: { styleOverrides: { root: { borderRadius: 9 } } },
    MuiTableCell: { styleOverrides: { root: { borderColor: '#dde5e2' }, head: { fontWeight: 650, backgroundColor: '#edf3f0' } } },
  },
});
