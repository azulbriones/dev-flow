/** Command Palette Types */

import type { ReactNode } from 'react';

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  shortcut?: string[];
  action: () => void;
  category?: string;
}

export interface CommandGroup {
  id: string;
  label: string;
  items: CommandItem[];
}

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  groups: CommandGroup[];
  placeholder?: string;
}

export type ReadonlyCommandPaletteProps = Readonly<CommandPaletteProps>;
