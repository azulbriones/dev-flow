import { NavLink } from 'react-router-dom';
import './Navbar.scss';

interface NavbarProps {
  isOpen: boolean;
  onToggle: () => void;
  onSearchClick?: () => void;
}

export type ReadonlyNavbarProps = Readonly<NavbarProps>;

const navItems = [
  { id: 'dashboard', label: 'Tablero', path: '/' },
  { id: 'workflows', label: 'Flujos de trabajo', path: '/workflows' },
  { id: 'executions', label: 'Ejecuciones', path: '/executions' },
];

export const Navbar = ({ isOpen, onToggle, onSearchClick }: ReadonlyNavbarProps) => {
  return (
    <>
      {/* Backdrop for mobile drawer */}
      <div
        className={`navbar-backdrop ${isOpen ? 'navbar-backdrop--visible' : ''}`}
        onClick={onToggle}
      />

      {/* Top Navbar */}
      <header className="navbar">
        <div className="navbar__container">
          {/* Logo */}
          <div className="navbar__brand">
            <NavLink to="/" className="navbar__logo">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <span>DevFlow</span>
            </NavLink>
          </div>

          {/* Desktop Nav Links */}
          <nav className="navbar__nav">
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  `navbar__link ${isActive ? 'navbar__link--active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="navbar__actions">
            {/* Search trigger - keyboard shortcut shown on desktop */}
            <button
              className="navbar__search-btn"
              onClick={onSearchClick}
              aria-label="Buscar (⌘K)"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <span className="navbar__search-text">Buscar...</span>
              <kbd className="navbar__kbd">⌘K</kbd>
            </button>

            {/* Mobile menu toggle */}
            <button
              className="navbar__menu-btn"
              onClick={onToggle}
              aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {isOpen ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <aside className={`navbar-drawer ${isOpen ? 'navbar-drawer--open' : ''}`}>
        <nav className="navbar-drawer__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `navbar-drawer__item ${isActive ? 'navbar-drawer__item--active' : ''}`
              }
              onClick={onToggle}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar-drawer__footer">
          <div className="navbar-drawer__version">v1.0.0</div>
        </div>
      </aside>
    </>
  );
};
