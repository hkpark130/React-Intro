import React from 'react';
import { Alert } from '@mui/material';

const normalizeSeverity = (val) => {
  const allowed = new Set(['info', 'warning', 'error']);
  const s = String(val || '').toLowerCase();
  return allowed.has(s) ? s : 'info';
};

export default function AlertBlock({ severity = 'info', children }) {
  const sev = normalizeSeverity(severity);

  // base style + severity-specific
  const base = { mt: 2, fontSize: '0.875rem' };
  const sx =
    sev === 'info'
      ? { ...base, bgcolor: 'rgba(25, 118, 210, 0.05)', borderLeft: '4px solid #1976d2' }
      : sev === 'warning'
      ? { ...base, bgcolor: 'rgba(237, 108, 2, 0.05)', borderLeft: '4px solid #ed6c02' }
      : { ...base, bgcolor: 'rgba(215, 65, 65, 0.05)', borderLeft: '4px solid #D74141' };

  return (
    <Alert severity={sev} sx={sx}>
      {children}
    </Alert>
  );
}
