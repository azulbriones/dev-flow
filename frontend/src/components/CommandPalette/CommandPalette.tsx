import {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react';

import type { CommandPaletteProps } from './types';
import './commandPalette.scss';

export const CommandPalette = ({
  isOpen,
  onClose,
  groups,
  placeholder = 'Escribí un comando o buscá...',
}: Readonly<CommandPaletteProps>) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Aplanar items para navegación
  const allItems = useMemo(() => {
    return groups.flatMap((group) => group.items);
  }, [groups]);

  // Filtrar items por consulta
  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      return allItems;
    }
    const lowerQuery = query.toLowerCase();
    return allItems.filter(
      (item) =>
        item.label.toLowerCase().includes(lowerQuery) ||
        item.description?.toLowerCase().includes(lowerQuery)
    );
  }, [allItems, query]);

  // Derivar grupos filtrados (grupos con al menos un item filtrado)
  const filteredGroups = useMemo(() => {
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => filteredItems.includes(item)),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, filteredItems]);

  // Resetear la selección cuando cambia la consulta
  // para que ocurra antes del siguiente render.
  const handleQueryChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSelectedIndex(0);
  };

  // Enfocar el input al abrir
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Atajo global de teclado (Cmd+K o Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Manejar navegación por teclado
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, filteredItems.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredItems[selectedIndex]) {
            filteredItems[selectedIndex].action();
            onClose();
          }
          break;
      }
    },
    [filteredItems, selectedIndex, onClose]
  );

  if (!isOpen) return null;

  return (
    <div className="command-overlay" onClick={onClose} role="presentation">
      <div
        className="command-palette"
        role="dialog"
        aria-modal="true"
        aria-label="Paleta de comandos"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="command-palette__header">
          <svg
            className="command-palette__search-icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="command-palette__input"
            placeholder={placeholder}
            value={query}
            onChange={handleQueryChange}
            onKeyDown={handleKeyDown}
          />
          <kbd className="command-palette__shortcut">ESC</kbd>
        </div>

        <div className="command-palette__body">
          {filteredGroups.length === 0 ? (
            <div className="command-palette__empty">
              No se encontraron resultados para &quot;{query}&quot;
            </div>
          ) : (
            filteredGroups.map((group) => (
              <div key={group.id} className="command-palette__group">
                <div className="command-palette__group-label">{group.label}</div>
                {group.items.map((item) => {
                  const globalIndex = filteredItems.indexOf(item);
                  const isSelected = globalIndex === selectedIndex;

                  return (
                    <button
                      key={item.id}
                      className={`command-palette__item ${
                        isSelected ? 'command-palette__item--selected' : ''
                      }`}
                      onClick={() => {
                        item.action();
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                    >
                      {item.icon && (
                        <span className="command-palette__item-icon">{item.icon}</span>
                      )}
                      <div className="command-palette__item-content">
                        <span className="command-palette__item-label">
                          {item.label}
                        </span>
                        {item.description && (
                          <span className="command-palette__item-desc">
                            {item.description}
                          </span>
                        )}
                      </div>
                      {item.shortcut && (
                        <div className="command-palette__item-shortcut">
                          {item.shortcut.map((key) => (
                            <kbd key={key}>{key}</kbd>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
