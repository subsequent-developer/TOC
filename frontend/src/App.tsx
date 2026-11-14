import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/layout/Layout';

// Pages
import { Dashboard } from './pages/Dashboard';
import { DFAExplorer } from './pages/DFAExplorer';
import { Analyze } from './pages/Analyze';
import { BatchAnalyze } from './pages/BatchAnalyze';
import { AnalysesHistory } from './pages/AnalysesHistory';
import { AnalysisDetail } from './pages/AnalysisDetail';
import { OrderHistory } from './pages/OrderHistory';
import { MLInsights } from './pages/MLInsights';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="dfa" element={<DFAExplorer />} />
            <Route path="analyze" element={<Analyze />} />
            <Route path="batch" element={<BatchAnalyze />} />
            <Route path="history" element={<AnalysesHistory />} />
            <Route path="analyses/:id" element={<AnalysisDetail />} />
            <Route path="orders" element={<OrderHistory />} />
            <Route path="ml" element={<MLInsights />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#f9fafb',
            fontSize: '13px',
            borderRadius: '8px',
          },
        }}
      />
    </QueryClientProvider>
  );
}
