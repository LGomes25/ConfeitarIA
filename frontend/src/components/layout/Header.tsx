import { useState, type FormEvent, type MouseEvent } from 'react';
import {
  Alert,
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Snackbar,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  mostrarBarraLateral?: boolean;
  onAbrirBarraLateral?: () => void;
  drawerWidth?: number;
}

const publicLinks = [
  { label: 'Início', path: '/' },
  { label: 'Produtos', path: '/produtos' },
  { label: 'Quem Somos', path: '/quem-somos' },
  { label: 'Contato', path: '/contato' },
];

export function Header({
  mostrarBarraLateral = false,
  onAbrirBarraLateral,
  drawerWidth = 250,
}: HeaderProps) {
  const { sessao, sair } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [termoBusca, setTermoBusca] = useState('');
  const [avisoBusca, setAvisoBusca] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = async () => {
    handleCloseUserMenu();
    await sair();
    navigate('/');
  };

  const handleSearchSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (termoBusca.trim()) {
      setAvisoBusca(true);
    }
  };

  return (
    <>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          width: mostrarBarraLateral ? { md: `calc(100% - ${drawerWidth}px)` } : '100%',
          ml: mostrarBarraLateral ? { md: `${drawerWidth}px` } : 0,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'rgba(255, 250, 245, 0.95)',
          backdropFilter: 'blur(12px)',
          zIndex: (theme) => theme.zIndex.appBar,
        }}
      >
        <Toolbar sx={{ minHeight: '68px !important', px: { xs: 1.5, sm: 3 }, gap: 1.5 }}>
          {/* Botão de abrir barra lateral em telas pequenas quando ativa */}
          {mostrarBarraLateral && onAbrirBarraLateral && (
            <IconButton
              onClick={onAbrirBarraLateral}
              aria-label="Abrir menu lateral"
              sx={{ display: { md: 'none' }, mr: 0.5 }}
            >
              <MenuRoundedIcon />
            </IconButton>
          )}

          {/* Logo e Nome da Aplicação */}
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              textDecoration: 'none',
              color: 'inherit',
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                display: 'grid',
                placeItems: 'center',
                color: 'primary.dark',
                bgcolor: '#fbe5ed',
                borderRadius: 2.5,
              }}
            >
              <CakeOutlinedIcon fontSize="small" />
            </Box>
            <Typography variant="h6" fontWeight={800} letterSpacing="-0.03em" sx={{ display: { xs: 'none', sm: 'block' } }}>
              ConfeitarIA
            </Typography>
          </Box>

          {/* Navegação Central: Início · Produtos · Quem Somos · Contato */}
          <Box
            component="nav"
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              gap: 0.5,
              mx: 'auto',
            }}
          >
            {publicLinks.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  component={NavLink}
                  to={item.path}
                  size="small"
                  sx={{
                    px: 1.8,
                    py: 0.8,
                    fontWeight: isActive ? 700 : 600,
                    fontSize: 14,
                    color: isActive ? 'primary.dark' : 'text.secondary',
                    bgcolor: isActive ? '#fbe9ef' : 'transparent',
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: isActive ? '#fbe5ed' : 'rgba(217, 116, 147, 0.08)',
                      color: 'primary.dark',
                    },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>

          <Box sx={{ flex: { xs: 1, md: '0 0 auto' } }} />

          {/* Campo de Busca à Direita */}
          <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Buscar..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: { xs: 120, sm: 170, md: 200 },
                '& .MuiOutlinedInput-root': {
                  height: 38,
                  bgcolor: '#ffffff',
                  fontSize: 13,
                  borderRadius: 2.5,
                },
              }}
            />
          </Box>

          {/* Lado Direito: Entrar / Perfil do Usuário */}
          {sessao ? (
            <>
              <Button
                onClick={handleOpenUserMenu}
                color="inherit"
                size="small"
                endIcon={<KeyboardArrowDownRoundedIcon />}
                startIcon={<AccountCircleOutlinedIcon color="primary" />}
                sx={{
                  fontWeight: 600,
                  fontSize: 13,
                  textTransform: 'none',
                  px: 1.5,
                  borderRadius: 2,
                }}
              >
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  {sessao.usuario.nomeApelido}
                </Box>
              </Button>
              <Menu
                anchorEl={anchorElUser}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                  paper: {
                    elevation: 3,
                    sx: { minWidth: 170, mt: 1, borderRadius: 2.5 },
                  },
                }}
              >
                <MenuItem
                  component={Link}
                  to="/perfil"
                  onClick={handleCloseUserMenu}
                  sx={{ fontSize: 14, gap: 1.2 }}
                >
                  <AccountCircleOutlinedIcon fontSize="small" />
                  Meu perfil
                </MenuItem>
                <MenuItem
                  onClick={handleLogout}
                  sx={{ fontSize: 14, gap: 1.2, color: 'error.main' }}
                >
                  <LogoutOutlinedIcon fontSize="small" />
                  Sair
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                component={Link}
                to="/login"
                state={{ from: location }}
                variant="outlined"
                color="primary"
                size="small"
                sx={{ borderRadius: 2 }}
              >
                Entrar
              </Button>
            </Box>
          )}

          {/* Menu Hambúrguer para Telas Pequenas (< md) */}
          <IconButton
            onClick={() => setMobileNavOpen(true)}
            aria-label="Abrir menu de navegação"
            sx={{ display: { xs: 'flex', md: 'none' }, ml: 0.5 }}
          >
            <MenuRoundedIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer Móvel de Navegação Pública */}
      <Drawer
        anchor="right"
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: 260, p: 2, boxSizing: 'border-box' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, pb: 2, mb: 1.5, borderBottom: '1px solid #f0e7e0' }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              display: 'grid',
              placeItems: 'center',
              color: 'primary.dark',
              bgcolor: '#fbe5ed',
              borderRadius: 2,
            }}
          >
            <CakeOutlinedIcon />
          </Box>
          <Typography fontWeight={800} letterSpacing="-0.03em">
            ConfeitarIA
          </Typography>
        </Box>
        <List sx={{ pt: 0 }}>
          {publicLinks.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItemButton
                key={item.path}
                component={NavLink}
                to={item.path}
                onClick={() => setMobileNavOpen(false)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  bgcolor: isActive ? '#fbe9ef' : 'transparent',
                  color: isActive ? 'primary.dark' : 'text.primary',
                }}
              >
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: isActive ? 700 : 500 }}
                />
              </ListItemButton>
            );
          })}
        </List>
        {!sessao && (
          <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid #f0e7e0' }}>
            <Button
              component={Link}
              to="/login"
              state={{ from: location }}
              onClick={() => setMobileNavOpen(false)}
              fullWidth
              variant="contained"
              sx={{ mb: 1 }}
            >
              Entrar
            </Button>
            <Button
              component={Link}
              to="/cadastro"
              onClick={() => setMobileNavOpen(false)}
              fullWidth
              variant="outlined"
            >
              Criar conta
            </Button>
          </Box>
        )}
      </Drawer>

      {/* Notificação amigável para busca */}
      <Snackbar
        open={avisoBusca}
        autoHideDuration={3000}
        onClose={() => setAvisoBusca(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="info" onClose={() => setAvisoBusca(false)} sx={{ width: '100%', borderRadius: 2 }}>
          Busca em desenvolvimento
        </Alert>
      </Snackbar>
    </>
  );
}
