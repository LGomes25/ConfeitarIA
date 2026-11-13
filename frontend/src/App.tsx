import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { LoadingState } from './components/feedback/AsyncStates';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Login } from './pages/Login';
import { Cadastro } from './pages/Cadastro';
import { RecuperarSenha } from './pages/RecuperarSenha';
import { Perfil } from './pages/Perfil';
import { Header } from './components/layout/Header';
import { Alert, Container } from '@mui/material';

// Páginas Públicas — Fase 3
import { PaginaInicial } from './components/publico/PaginaInicial';
import { PaginaProdutos } from './components/publico/PaginaProdutos';
import { PaginaQuemSomos } from './components/publico/PaginaQuemSomos';
import { PaginaContato } from './components/publico/PaginaContato';

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
const ComponentesListaPage = lazy(async () => {
  const module = await import('./pages/receitas/Fase4Receitas');
  return { default: module.ComponentesListaPage };
});
const ComponentesFormPage = lazy(async () => {
  const module = await import('./pages/receitas/Fase4Receitas');
  return { default: module.ComponentesFormPage };
});
const ReceitasCompletasListaPage = lazy(async () => {
  const module = await import('./pages/receitas/Fase4Receitas');
  return { default: module.ReceitasCompletasListaPage };
});
const ReceitasCompletasFormPage = lazy(async () => {
  const module = await import('./pages/receitas/Fase4Receitas');
  return { default: module.ReceitasCompletasFormPage };
});
const ProdutosListaPage = lazy(async () => {
  const module = await import('./pages/admin/Produtos');
  return { default: module.ProdutosListaPage };
});
const ProdutoFormPage = lazy(async () => {
  const module = await import('./pages/admin/Produtos');
  return { default: module.ProdutoFormPage };
});
const ProdutoDetalhePage = lazy(async () => {
  const module = await import('./pages/admin/Produtos');
  return { default: module.ProdutoDetalhePage };
});
const PrecificacaoPage = lazy(async () => {
  const module = await import('./pages/admin/PrecificacaoPage');
  return { default: module.PrecificacaoPage };
});
const RelatorioCustosEPrecos = lazy(async () => {
  const module = await import('./components/relatorios/RelatorioCustosEPrecos');
  return { default: module.RelatorioCustosEPrecos };
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
      {/* Páginas públicas — SEM proteção e SEM barra lateral */}
      <Route path="/" element={<PaginaInicial />} />
      <Route path="/produtos" element={<PaginaProdutos />} />
      <Route path="/quem-somos" element={<PaginaQuemSomos />} />
      <Route path="/contato" element={<PaginaContato />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/recuperar-senha" element={<RecuperarSenha />} />
      <Route path="/sem-permissao" element={<SemPermissao />} />

      {/* Páginas protegidas — COM barra lateral condicional por perfil */}
      <Route
        element={
          <Suspense fallback={<LoadingState />}>
            <AppLayout />
          </Suspense>
        }
      >
        <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
        <Route path="/meu-perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
        <Route path="/admin/usuarios" element={<ProtectedRoute perfis={['Admin']}><Suspense fallback={<LoadingState />}><UsuariosPage /></Suspense></ProtectedRoute>} />
        <Route path="/usuarios" element={<ProtectedRoute perfis={['Admin']}><Suspense fallback={<LoadingState />}><UsuariosPage /></Suspense></ProtectedRoute>} />
        <Route path="/insumos" element={<ProtectedRoute perfis={['Admin', 'Manager']}><Suspense fallback={<LoadingState />}><InsumosPage /></Suspense></ProtectedRoute>} />
        <Route path="/insumos/:id" element={<ProtectedRoute perfis={['Admin', 'Manager']}><Suspense fallback={<LoadingState />}><InsumoDetalhePage /></Suspense></ProtectedRoute>} />
        <Route path="/compras" element={<ProtectedRoute perfis={['Admin', 'Manager']}><Suspense fallback={<LoadingState />}><ComprasPage /></Suspense></ProtectedRoute>} />
        <Route path="/receitas/componentes" element={<ProtectedRoute perfis={['Admin', 'Manager', 'Team']}><Suspense fallback={<LoadingState />}><ComponentesListaPage /></Suspense></ProtectedRoute>} />
        <Route path="/receitas/componentes/novo" element={<ProtectedRoute perfis={['Admin', 'Manager', 'Team']}><Suspense fallback={<LoadingState />}><ComponentesFormPage /></Suspense></ProtectedRoute>} />
        <Route path="/receitas/componentes/:id/editar" element={<ProtectedRoute perfis={['Admin', 'Manager', 'Team']}><Suspense fallback={<LoadingState />}><ComponentesFormPage /></Suspense></ProtectedRoute>} />
        <Route path="/receitas/completas" element={<ProtectedRoute perfis={['Admin', 'Manager', 'Team']}><Suspense fallback={<LoadingState />}><ReceitasCompletasListaPage /></Suspense></ProtectedRoute>} />
        <Route path="/receitas/completas/novo" element={<ProtectedRoute perfis={['Admin', 'Manager', 'Team']}><Suspense fallback={<LoadingState />}><ReceitasCompletasFormPage /></Suspense></ProtectedRoute>} />
        <Route path="/receitas/completas/:id/editar" element={<ProtectedRoute perfis={['Admin', 'Manager', 'Team']}><Suspense fallback={<LoadingState />}><ReceitasCompletasFormPage /></Suspense></ProtectedRoute>} />
        <Route path="/admin/produtos" element={<ProtectedRoute perfis={['Admin', 'Manager']}><Suspense fallback={<LoadingState />}><ProdutosListaPage /></Suspense></ProtectedRoute>} />
        <Route path="/admin/produtos/:id/editar" element={<ProtectedRoute perfis={['Admin', 'Manager']}><Suspense fallback={<LoadingState />}><ProdutoFormPage /></Suspense></ProtectedRoute>} />
        <Route path="/admin/produtos/:id/precificacao" element={<ProtectedRoute perfis={['Admin', 'Manager']}><Suspense fallback={<LoadingState />}><PrecificacaoPage /></Suspense></ProtectedRoute>} />
        <Route path="/admin/produtos/:id" element={<ProtectedRoute perfis={['Admin', 'Manager']}><Suspense fallback={<LoadingState />}><ProdutoDetalhePage /></Suspense></ProtectedRoute>} />
        <Route path="/relatorios/custos-e-precos" element={<ProtectedRoute perfis={['Admin', 'Manager']}><Suspense fallback={<LoadingState />}><RelatorioCustosEPrecos /></Suspense></ProtectedRoute>} />
      </Route>

      {/* Rota padrão para rotas não mapeadas */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
