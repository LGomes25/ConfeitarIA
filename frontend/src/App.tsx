import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { LoadingState } from './components/feedback/AsyncStates';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Inicio } from './pages/Inicio';
import { Login } from './pages/Login';
import { Cadastro } from './pages/Cadastro';
import { RecuperarSenha } from './pages/RecuperarSenha';
import { Perfil } from './pages/Perfil';
import { Header } from './components/layout/Header';
import { Alert, Container } from '@mui/material';

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
const UsuariosPage = lazy(async () => {
  const module = await import('./pages/admin/Usuarios');
  return { default: module.UsuariosPage };
});

function SemPermissao() {
  return (
    <>
      <Header />
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="warning">Você não tem permissão para acessar este recurso.</Alert>
      </Container>
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/recuperar-senha" element={<RecuperarSenha />} />
      <Route path="/sem-permissao" element={<SemPermissao />} />
      <Route
        element={
          <Suspense fallback={<LoadingState />}>
            <AppLayout />
          </Suspense>
        }
      >
        <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
        <Route path="/admin/usuarios" element={<ProtectedRoute perfis={['Admin']}><Suspense fallback={<LoadingState />}><UsuariosPage /></Suspense></ProtectedRoute>} />
        <Route path="/insumos" element={<ProtectedRoute perfis={['Admin', 'Manager']}><Suspense fallback={<LoadingState />}><InsumosPage /></Suspense></ProtectedRoute>} />
        <Route path="/insumos/:id" element={<ProtectedRoute perfis={['Admin', 'Manager']}><Suspense fallback={<LoadingState />}><InsumoDetalhePage /></Suspense></ProtectedRoute>} />
        <Route path="/compras" element={<ProtectedRoute perfis={['Admin', 'Manager']}><Suspense fallback={<LoadingState />}><ComprasPage /></Suspense></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
