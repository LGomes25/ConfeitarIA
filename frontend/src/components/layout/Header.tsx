import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function Header() {
  const { sessao, sair } = useAuth();
  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      <Toolbar sx={{ maxWidth: 1200, width: '100%', mx: 'auto', gap: 1.5 }}>
        <CakeOutlinedIcon color="primary" />
        <Typography component={Link} to="/" variant="h6" color="text.primary" fontWeight={800}>
          ConfeitarIA
        </Typography>
        <Box sx={{ flex: 1 }} />
        {sessao ? (
          <>
            <Button component={Link} to="/perfil" color="inherit">{sessao.usuario.nomeApelido}</Button>
            <Button onClick={() => void sair()} color="primary">Sair</Button>
          </>
        ) : (
          <>
            <Button component={Link} to="/login" color="inherit">Entrar</Button>
            <Button component={Link} to="/cadastro" variant="contained">Criar conta</Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
