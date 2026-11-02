import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined';

const drawerWidth = 250;
const navigationItems = [
  { label: 'Insumos', path: '/insumos', icon: <Inventory2OutlinedIcon /> },
  { label: 'Compras', path: '/compras', icon: <ReceiptLongOutlinedIcon /> },
];

function NavigationContent({ onNavigate }: { onNavigate?: () => void }) {
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
        {navigationItems.map((item) => (
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

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const pageName = location.pathname.startsWith('/compras') ? 'Compras' : 'Insumos';
  const closeMobile = () => setMobileOpen(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'rgba(255, 250, 245, 0.92)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <Toolbar sx={{ minHeight: '68px !important', px: { xs: 2, md: 4 } }}>
          <IconButton
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
            sx={{ display: { md: 'none' }, mr: 1 }}
          >
            <MenuRoundedIcon />
          </IconButton>
          <Typography color="text.secondary" fontSize={14}>
            {pageName}
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Typography sx={{ fontSize: 13, color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}>
            Feito com carinho para sua confeitaria
          </Typography>
        </Toolbar>
      </AppBar>

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
          <NavigationContent onNavigate={closeMobile} />
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
          <NavigationContent />
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}>
        <Toolbar sx={{ minHeight: '68px !important' }} />
        <Box sx={{ maxWidth: 1440, mx: 'auto', p: { xs: 2, sm: 3, lg: 4 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
