import { createContext } from 'react';
// Shared by the restored portfolio shell and its original sidebar.
export const SidebarContext = createContext({ open: true, setOpen: () => {} });
