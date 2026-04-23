import React from 'react';
import { Alert } from '@mui/material';

const normalizeSeverity = (val) => {
  const allowed = new Set(['info', 'warning', 'error']);
  const s = String(val || '').toLowerCase();
  return allowed.has(s) ? s : 'info';
};

const STYLE_MAP = {
  info: {
    bgcolor: 'var(--accent-bg)',
    borderLeft: '3px solid var(--accent)',
  },
  warning: {
    bgcolor: 'rgba(234, 179, 8, 0.08)',
    borderLeft: '3px solid #eab308',
  },
  error: {
    bgcolor: 'rgba(239, 68, 68, 0.08)',
    borderLeft: '3px solid #ef4444',
  },
};

export default function AlertBlock({ severity = 'info', children }) {
  const sev = normalizeSeverity(severity);
  return (
    <Alert
      severity={sev}
      sx={{
        mt: 2,
        fontSize: '0.875rem',
        color: 'var(--ink)',
        bgcolor: STYLE_MAP[sev].bgcolor,
        borderLeft: STYLE_MAP[sev].borderLeft,
        borderRadius: 'var(--radius-sm)',
        '& .MuiAlert-icon': { color: 'var(--ink-muted)' },
      }}
    >
      {children}
    </Alert>
  );
}
