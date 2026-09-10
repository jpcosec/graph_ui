import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AppShell } from './components/layouts/AppShell';
import { AntoniaFlowPage } from './features/antonia-flow/AntoniaFlowPage';
import { registerDefaultNodeTypes } from './schema/register-defaults';

import './styles.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

function App() {
  useEffect(() => {
    registerDefaultNodeTypes();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppShell>
        <AntoniaFlowPage />
      </AppShell>
    </QueryClientProvider>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
