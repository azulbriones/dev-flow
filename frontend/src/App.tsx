import { useState, useEffect, useCallback } from 'react';
import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';

import { queryClient } from './lib/queryClient';
import { Dashboard } from './pages/Dashboard';
import { Workflows } from './pages/Workflows';
import { WorkflowsComposer } from './pages/WorkflowsComposer';
import { Executions } from './pages/Executions';
import { CommandPalette } from './components/CommandPalette';
import type { CommandGroup } from './components/CommandPalette';
import { Navbar } from './components/Navbar/Navbar';
import { DemoBanner } from './components/DemoBanner';
import { getWorkflows } from './features/workflows/api/client';
import './App.css';

/** Build command groups for the palette */
function useCommandGroups(
  navigate: ReturnType<typeof useNavigate>,
  isPaletteOpen: boolean
): CommandGroup[] {
  const { data: workflows } = useQuery({
    queryKey: ['workflows'],
    queryFn: getWorkflows,
    enabled: isPaletteOpen,
    staleTime: 1000 * 60 * 5,
  });

  const groups = [
    {
      id: 'navigation',
      label: 'Navegación',
      items: [
        {
          id: 'go-dashboard',
          label: 'Ir al tablero',
          description: 'Ver todos los flujos de trabajo y estadísticas',
          shortcut: ['G', 'D'],
          category: 'navigation',
          action: () => navigate('/'),
        },
        {
          id: 'go-workflows',
          label: 'Ir a flujos de trabajo',
          description: 'Ver todos los flujos de trabajo',
          shortcut: ['G', 'W'],
          category: 'navigation',
          action: () => navigate('/workflows'),
        },
        {
          id: 'go-executions',
          label: 'Ir a ejecuciones',
          description: 'Ver todas las ejecuciones',
          shortcut: ['G', 'E'],
          category: 'navigation',
          action: () => navigate('/executions'),
        },
      ],
    },
    {
      id: 'workflows',
      label: 'Flujos de trabajo',
      items: (workflows || []).map((wf) => ({
        id: `wf-${wf.id}`,
        label: wf.name,
        description: wf.description || 'Ver detalles del flujo de trabajo',
        category: 'workflows',
        action: () => navigate(`/workflows/${wf.id}`),
      })),
    },
    {
      id: 'actions',
      label: 'Acciones',
      items: [
        {
          id: 'refresh-data',
          label: 'Refrescar datos',
          description: 'Recargar todos los datos de flujos de trabajo',
          shortcut: ['R'],
          category: 'actions',
          action: () => {
            queryClient.invalidateQueries({ queryKey: ['workflows'] });
            queryClient.invalidateQueries({
              queryKey: ['executions'],
            });
          },
        },
      ],
    },
  ];

  return groups;
}

const AppContent = () => {
  const navigate = useNavigate();
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const groups = useCommandGroups(navigate, isPaletteOpen);

  // Global keyboard shortcut (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
    };

    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClosePalette = useCallback(() => {
    setIsPaletteOpen(false);
  }, []);

  const handleToggleDrawer = useCallback(() => {
    setDrawerOpen((prev) => !prev);
  }, []);

  return (
    <div className="app-layout">
      {/* Top Navbar with Mobile Drawer */}
      <Navbar
        isOpen={drawerOpen}
        onToggle={handleToggleDrawer}
        onSearchClick={() => setIsPaletteOpen(true)}
      />

      {/* Main Content */}
      <main className="app__main">
        <DemoBanner />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/workflows" element={<Workflows />} />
          <Route path="/workflows/new" element={<WorkflowsComposer />} />
          <Route path="/workflows/:id" element={<WorkflowsComposer />} />
          <Route path="/executions" element={<Executions />} />
        </Routes>
      </main>

      {/* Command Palette */}
      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={handleClosePalette}
        groups={groups}
        placeholder="Buscá flujos de trabajo o acciones..."
      />

      {/* Toast notifications */}
      <Toaster position="bottom-right" />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
