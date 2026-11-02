import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { LoadingState } from './components/feedback/AsyncStates';

const ComprasPage = lazy(async () => {
  const module = await import('./pages/ComprasPage');
  return { default: module.ComprasPage };
});
const InsumoDetalhePage = lazy(async () => {
  const module = await import('./pages/InsumoDetalhePage');
  return { default: module.InsumoDetalhePage };
});
const InsumosPage = lazy(async () => {
  const module = await import('./pages/InsumosPage');
  return { default: module.InsumosPage };
});

function App() {
  return (
    <Routes>
      <Route
        element={
          <Suspense fallback={<LoadingState />}>
            <AppLayout />
          </Suspense>
        }
      >
        <Route index element={<Navigate to="/insumos" replace />} />
        <Route path="/insumos" element={<Suspense fallback={<LoadingState />}><InsumosPage /></Suspense>} />
        <Route path="/insumos/:id" element={<Suspense fallback={<LoadingState />}><InsumoDetalhePage /></Suspense>} />
        <Route path="/compras" element={<Suspense fallback={<LoadingState />}><ComprasPage /></Suspense>} />
        <Route path="*" element={<Navigate to="/insumos" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
