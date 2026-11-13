import { useState, type ReactNode } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import { useAuth } from '../../context/AuthContext';
import { Header } from './Header';

const drawerWidth = 250;
const navigationItems = [
  { label: 'Insumos', path: '/insumos', icon: <Inventory2OutlinedIcon /> },
  { label: 'Compras', path: '/compras', icon: <ReceiptLongOutlinedIcon /> },
];

function NavigationContent({ onNavigate, items }: { onNavigate?: () => void; items: typeof navigationItems }) {
  return (
    <Box sx={{ px: 2, py: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.3, px: 1.3, py: 1.5, mb: 2.5 }}>
        <Box
          sx={{
            width: 42,
            height: 42,
            display: 'grid',
            placeItems: 'center',
            color: 'primary.dark',
            bgcolor: '#fbe5ed',
            borderRadius: 3,
          }}
        >
          <CakeOutlinedIcon />
        </Box>
        <Box>
          <Typography fontWeight={800} letterSpacing="-0.03em">
            ConfeitarIA
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Gestão de confeitaria
          </Typography>
        </Box>
      </Box>
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ px: 1.5, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em' }}
      >
        MENU PRINCIPAL
      </Typography>
      <List sx={{ mt: 0.7 }}>
        {items.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            onClick={onNavigate}
            sx={{
              mb: 0.5,
              minHeight: 46,
              color: 'text.secondary',
              '&.active': { bgcolor: '#fbe9ef', color: 'primary.dark' },
              '&.active .MuiListItemIcon-root': { color: 'primary.dark' },
              borderRadius: 2.5,
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }} />
          </ListItemButton>
        ))}
      </List>
      <Box
        sx={{
          mt: 4,
          p: 2,
          borderRadius: 3,
          bgcolor: '#fff5ef',
          border: '1px solid #f6e8df',
        }}
      >
        <Typography fontWeight={700} fontSize={13}>
          Um toque mais doce 🍰
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, lineHeight: 1.5 }}>
          Acompanhe seus custos para cuidar de cada receita.
        </Typography>
      </Box>
    </Box>
  );
}

export interface AppLayoutProps {
  children?: ReactNode;
  mostrarBarraLateral?: boolean;
}

export function AppLayout({ children, mostrarBarraLateral }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { sessao } = useAuth();

  // Perfis autorizados a visualizar a barra lateral: Admin, Manager e Team
  const temPerfilBarraLateral = sessao?.usuario.perfis.some((role) => {
    const r = role.toLowerCase();
    return r === 'admin' || r === 'manager' || r === 'team';
  }) ?? false;

  // Regra fundamental:
  // - Usuário deslogado: sidebar desabilitada (false)
  // - Perfil Customer: sidebar SEMPRE desabilitada (false)
  // - Perfis Admin, Manager e Team: sidebar HABILITADA ao fazer login (true)
  const exibirBarraLateral = Boolean(sessao && temPerfilBarraLateral && (mostrarBarraLateral ?? true));

  // Insumos e Compras: exclusivos para Admin e Manager (Team NÃO tem acesso a insumos/compras)
  const canAccessInsumosCompras = sessao?.usuario.perfis.some((role) => {
    const r = role.toLowerCase();
    return r === 'admin' || r === 'manager';
  }) ?? false;
  const isAdmin = sessao?.usuario.perfis.some((role) => role.toLowerCase() === 'admin') ?? false;
  const canAccessRecipes = sessao?.usuario.perfis.some((role) => {
    const r = role.toLowerCase();
    return r === 'admin' || r === 'manager' || r === 'team';
  }) ?? false;
  const canAccessProductAdmin = sessao?.usuario.perfis.some((role) => {
    const r = role.toLowerCase();
    return r === 'admin' || r === 'manager';
  }) ?? false;

  const items = [
    ...(canAccessInsumosCompras ? navigationItems : []),
    ...(canAccessRecipes ? [
      { label: 'Componentes', path: '/receitas/componentes', icon: <LayersOutlinedIcon /> },
      { label: 'Receitas', path: '/receitas/completas', icon: <MenuBookOutlinedIcon /> },
    ] : []),
    ...(canAccessProductAdmin ? [
      { label: 'Produtos', path: '/admin/produtos', icon: <SellOutlinedIcon /> },
      { label: 'Custos e preços', path: '/relatorios/custos-e-precos', icon: <AssessmentOutlinedIcon /> },
    ] : []),
    { label: 'Meu perfil', path: '/perfil', icon: <AccountCircleOutlinedIcon /> },
    ...(isAdmin
      ? [{ label: 'Usuários', path: '/admin/usuarios', icon: <AdminPanelSettingsOutlinedIcon /> }]
      : []),
  ];

  const closeMobile = () => setMobileOpen(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Cabeçalho unificado com controle da barra lateral */}
      <Header
        mostrarBarraLateral={exibirBarraLateral}
        onAbrirBarraLateral={() => setMobileOpen(true)}
        drawerWidth={drawerWidth}
      />

      {/* Barra lateral condicional — visível apenas se exibirBarraLateral for true */}
      {exibirBarraLateral && (
        <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={closeMobile}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
            }}
          >
            <NavigationContent onNavigate={closeMobile} items={items} />
          </Drawer>
          <Drawer
            variant="permanent"
            open
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
                borderRight: '1px solid #f0e7e0',
                bgcolor: '#fffdfb',
              },
            }}
          >
            <NavigationContent items={items} />
          </Drawer>
        </Box>
      )}

      {/* Conteúdo principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: exibirBarraLateral ? { md: `calc(100% - ${drawerWidth}px)` } : '100%',
        }}
      >
        <Toolbar sx={{ minHeight: '68px !important' }} />
        <Box
          sx={{
            maxWidth: exibirBarraLateral ? 1440 : 1200,
            mx: 'auto',
            p: { xs: 2, sm: 3, lg: 4 },
          }}
        >
          {children ?? <Outlet />}
        </Box>
      </Box>
    </Box>
  );
}
