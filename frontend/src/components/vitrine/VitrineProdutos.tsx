import { useCallback } from 'react';
import { Alert, Button, Grid } from '@mui/material';
import { PageHeader } from '../common/PageHeader';
import { EmptyState, LoadingState } from '../feedback/AsyncStates';
import { useAsyncData } from '../../hooks/useAsyncData';
import { fase4Service } from '../../services/fase4Service';
import { ProdutoCardPublico } from './ProdutoCardPublico';

export function VitrineProdutos() {
  const carregar = useCallback(() => fase4Service.listarProdutosAtivos(), []);
  const { data: produtos, loading, error, reload } = useAsyncData(carregar);
  return (
    <>
      <PageHeader title="Nossos Produtos" description="Conheça nossas criações artesanais, preparadas com ingredientes selecionados." />
      {loading && <LoadingState label="Carregando produtos..." />}
      {!loading && error && <Alert severity="error" action={<Button color="inherit" onClick={reload}>Tentar novamente</Button>}>{error}</Alert>}
      {!loading && !error && !produtos?.length && <EmptyState>Nenhum produto disponível no momento.</EmptyState>}
      {!loading && !error && Boolean(produtos?.length) && (
        <Grid container spacing={2.5}>
          {produtos?.map((produto, index) => (
            <Grid item xs={12} sm={6} md={4} key={`${produto.nomePublico}-${index}`}>
              <ProdutoCardPublico produto={produto} />
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
}
