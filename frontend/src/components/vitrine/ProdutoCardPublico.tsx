import { Card, CardContent, Typography } from '@mui/material';
import type { ProdutoPublico } from '../../types/produto.types';

export function ProdutoCardPublico({ produto }: { produto: ProdutoPublico }) {
  return (
    <Card component="article" sx={{ height: '100%', border: '1px solid #f0e7e0', borderRadius: 3 }}>
      <CardContent sx={{ p: 2.5 }}>
        <Typography component="h2" variant="h2" sx={{ fontSize: 20, mb: 1.2 }}>
          {produto.nomePublico}
        </Typography>
        {produto.descricaoPublica && (
          <Typography color="text.secondary" sx={{ lineHeight: 1.7, mb: produto.ingredientesPrincipais ? 2 : 0 }}>
            {produto.descricaoPublica}
          </Typography>
        )}
        {produto.ingredientesPrincipais && (
          <Typography variant="body2" sx={{ mt: 1.2 }}>
            <BoxLabel>Ingredientes principais:</BoxLabel> {produto.ingredientesPrincipais}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

function BoxLabel({ children }: { children: string }) {
  return <Typography component="span" variant="body2" fontWeight={700}>{children}</Typography>;
}
