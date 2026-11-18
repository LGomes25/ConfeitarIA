import { Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import type { ProdutoPublico } from '../../types/produto.types';

export function ProdutoCardPublico({ produto }: { produto: ProdutoPublico }) {
  const hasEspeciais = produto.semLactose || produto.semGluten || produto.vegano;

  return (
    <Card component="article" sx={{ height: '100%', border: '1px solid #f0e7e0', borderRadius: 3, display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ p: 2.5, flex: 1 }}>
        <Typography component="h2" variant="h2" sx={{ fontSize: 20, mb: 1.2 }}>
          {produto.nomePublico}
        </Typography>

        {produto.descricaoPublica && (
          <Typography color="text.secondary" sx={{ lineHeight: 1.7, mb: 1.5 }}>
            {produto.descricaoPublica}
          </Typography>
        )}

        {/* Características Especiais abaixo da descrição */}
        {hasEspeciais && (
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
            {produto.semLactose && (
              <Chip size="small" label="Sem Lactose" color="success" variant="outlined" />
            )}
            {produto.semGluten && (
              <Chip size="small" label="Sem Glúten" color="success" variant="outlined" />
            )}
            {produto.vegano && (
              <Chip size="small" label="Vegano" color="success" variant="outlined" />
            )}
          </Stack>
        )}

        {/* Especificações adicionais */}
        {produto.especificacoesAdicionais && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.2, fontStyle: 'italic' }}>
            {produto.especificacoesAdicionais}
          </Typography>
        )}

        {/* Ingredientes Principais */}
        {produto.ingredientesPrincipais && (
          <Typography variant="body2" sx={{ mt: 1 }}>
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
