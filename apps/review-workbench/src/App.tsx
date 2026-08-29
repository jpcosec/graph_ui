import { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AppShell } from './components/layouts/AppShell';
import { AntoniaFlowPage } from './features/antonia-flow/AntoniaFlowPage';
import { HumBodyPage } from './features/hum-body/HumBodyPage';
import { registerDefaultNodeTypes } from './schema/register-defaults';

import './styles.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

type AppView = 'hum' | 'antonia';

function getInitialView(): AppView {
  if (typeof window === 'undefined') {
    return 'hum';
  }

  const view = new URLSearchParams(window.location.search).get('view');
  return view === 'antonia' ? 'antonia' : 'hum';
}

function setUrlView(view: AppView) {
  if (typeof window === 'undefined') {
    return;
  }

  const url = new URL(window.location.href);
  if (view === 'antonia') {
    url.searchParams.set('view', 'antonia');
  } else {
    url.searchParams.delete('view');
  }
  window.history.replaceState({}, '', url);
}

function App() {
  const [view, setView] = useState<AppView>(() => getInitialView());

  useEffect(() => {
    registerDefaultNodeTypes();
  }, []);

  useEffect(() => {
    setUrlView(view);
  }, [view]);

  const page = useMemo(() => (view === 'antonia' ? <AntoniaFlowPage /> : <HumBodyPage />), [view]);

  return (
    <QueryClientProvider client={queryClient}>
      <AppShell>
        <div className="pointer-events-auto fixed right-8 top-6 z-[60] flex items-center gap-1 rounded-2xl border border-white/10 bg-slate-950/85 p-1 shadow-[0_20px_40px_rgba(0,0,0,0.35)] backdrop-blur">
          <button
            type="button"
            data-testid="app-view-hum"
            className={`rounded-xl px-3 py-2 text-xs font-medium transition ${view === 'hum' ? 'bg-primary text-slate-950' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
            onClick={() => setView('hum')}
          >
            HUM view
          </button>
          <button
            type="button"
            data-testid="app-view-antonia"
            className={`rounded-xl px-3 py-2 text-xs font-medium transition ${view === 'antonia' ? 'bg-primary text-slate-950' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
            onClick={() => setView('antonia')}
          >
            Antonia flow
          </button>
        </div>
        {page}
      </AppShell>
    </QueryClientProvider>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
