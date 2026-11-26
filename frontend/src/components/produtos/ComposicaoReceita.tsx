import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { useEffect, useState } from 'react';
import { fase4Service } from '../../services/fase4Service';
import type { Produto } from '../../types/produto.types';
import type { Componente } from '../../types/componente.types';
import type { ReceitaCompleta } from '../../types/receitaCompleta.types';
import { EmptyState, ErrorState, LoadingState } from '../feedback/AsyncStates';

interface OrigemComposicao {
  chave: string;
  titulo: string;
  insumos: Array<{ nome: string; quantidade: number; unidade?: string }>;
  componentes?: Array<{
    nome: string;
    insumos: Array<{ nome: string; quantidade: number; unidade?: string }>;
  }>;
  insumosDiretos?: Array<{ nome: string; quantidade: number; unidade?: string }>;
  descricao?: string | null;
  tempoPreparo?: number | null;
}

export function ComposicaoReceita({ produto }: { produto: Produto }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blocos, setBlocos] = useState<OrigemComposicao[]>([]);
  const [insumosExtras, setInsumosExtras] = useState<Array<{ nome: string; quantidade: number }>>([]);
  const [itensLivres, setItensLivres] = useState<Array<{ nome: string; quantidade: number }>>([]);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        setLoading(true);
        setError(null);

        const receitas = new Map<number, ReceitaCompleta>();
        const componentes = new Map<number, Componente>();
        const blocosGerados: OrigemComposicao[] = [];
        const montarReceita = (receita: ReceitaCompleta): OrigemComposicao => ({
          chave: `receita-${receita.id}`,
          titulo: `Receita — ${receita.nome}`,
          insumos: [],
          componentes: receita.itens
            .filter((item) => item.componenteId)
            .map((item) => ({
              nome: item.componenteNome ?? 'Componente',
              insumos: (item.itensComponente ?? []).map((sub) => ({
                nome: sub.insumoNome ?? 'Insumo',
                quantidade: sub.quantidade * item.quantidade,
                unidade: sub.unidadeMedida,
              })),
            })),
          insumosDiretos: receita.itens
            .filter((item) => item.insumoId && item.insumoNome)
            .map((item) => ({
              nome: item.insumoNome ?? 'Insumo',
              quantidade: item.quantidade,
              unidade: item.unidadeMedida,
            })),
          descricao: receita.descricao,
          tempoPreparo: receita.tempoPreparoMinutos,
        });

        if (produto.receitaCompletaId) {
          const receita = await fase4Service.obterReceita('receita', produto.receitaCompletaId) as ReceitaCompleta;
          receitas.set(receita.id, receita);
          blocosGerados.push(montarReceita(receita));
        }

        for (const link of produto.componentes ?? []) {
          if (link.receitaCompletaId) {
            if (receitas.has(link.receitaCompletaId)) continue;
            const receita = await fase4Service.obterReceita('receita', link.receitaCompletaId) as ReceitaCompleta;
            receitas.set(receita.id, receita);
            blocosGerados.push(montarReceita(receita));
          }
          if (link.componenteId) {
            if (componentes.has(link.componenteId)) continue;
            const componente = await fase4Service.obterReceita('componente', link.componenteId) as Componente;
            componentes.set(componente.id, componente);
            blocosGerados.push({
              chave: `componente-${componente.id}`,
              titulo: `Componente — ${componente.nome}`,
              insumos: componente.itens
                .filter((item) => item.insumoId && item.insumoNome)
                .map((item) => ({
                  nome: item.insumoNome ?? 'Insumo',
                  quantidade: item.quantidade,
                  unidade: item.unidadeMedida,
                })),
              descricao: componente.descricao,
              tempoPreparo: componente.tempoPreparoMinutos,
            });
          }
        }

        if (active) {
          setBlocos(blocosGerados);
          setInsumosExtras((produto.itensExtras ?? [])
            .filter((extra) => extra.insumoId)
            .map((extra) => ({
              nome: extra.insumoNome ?? 'Insumo',
              quantidade: extra.quantidade ?? 1,
            })));
          setItensLivres((produto.itensExtras ?? [])
            .filter((extra) => !extra.insumoId)
            .map((extra) => ({
              nome: extra.descricaoItem ?? 'Item',
              quantidade: extra.quantidade ?? 1,
            })));
        }
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : 'Não foi possível carregar a composição.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [produto]);

  if (loading) return <LoadingState label="Carregando composição da receita..." />;
  if (error) return <ErrorState message={error} />;

  const origensComDescricao = blocos.filter((bloco) =>
    Boolean(bloco.descricao?.trim()),
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
    <Paper sx={{ p: { xs: 2, sm: 2.5 }, border: '1px solid #f0e7e0', borderRadius: 3 }}>
      <Typography variant="h2" sx={{ fontSize: 18, mb: 1 }}>
        Composição da Receita
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Esta é a composição completa da receita, com todos os ingredientes e quantidades utilizados no preparo.
      </Typography>

      {blocos.length === 0 && insumosExtras.length === 0 && itensLivres.length === 0
        ? <EmptyState>A receita ainda não possui insumos cadastrados.</EmptyState>
        : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {blocos.map((bloco) => (
              <Accordion key={bloco.chave} disableGutters variant="outlined">
                <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                  <Typography fontWeight={700}>
                    {bloco.chave.startsWith('componente') ? '🧩' : '📦'} {bloco.titulo}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 0, pt: 0 }}>
                  {bloco.chave.startsWith('receita') ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, px: 2, py: 1 }}>
                      {(bloco.componentes?.length ?? 0) > 0 && (
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.75 }}>
                            Componentes
                          </Typography>
                          {bloco.componentes?.map((componente, componenteIndex) => (
                            <Box key={`${componente.nome}-${componenteIndex}`} sx={{ mb: 1 }}>
                              <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>
                                🧩 Componente — {componente.nome}
                              </Typography>
                              {componente.insumos.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                  Nenhum insumo informado neste componente.
                                </Typography>
                              ) : (
                                <Table size="small" aria-label={`Insumos do componente ${componente.nome}`}>
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Insumo</TableCell>
                                      <TableCell align="right">Quantidade</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {componente.insumos.map((item, index) => (
                                      <TableRow key={`${item.nome}-${index}`}>
                                        <TableCell>{item.nome}</TableCell>
                                        <TableCell align="right">
                                          {item.quantidade}{item.unidade ? ` ${item.unidade}` : ''}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              )}
                            </Box>
                          ))}
                        </Box>
                      )}

                      <Box>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.75 }}>
                          Insumos da Receita
                        </Typography>
                        {(bloco.insumosDiretos?.length ?? 0) === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            Nenhum insumo direto informado nesta receita.
                          </Typography>
                        ) : (
                          <Table size="small" aria-label={`Insumos da receita ${bloco.titulo}`}>
                            <TableHead>
                              <TableRow>
                                <TableCell>Insumo</TableCell>
                                <TableCell align="right">Quantidade</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {bloco.insumosDiretos?.map((item, index) => (
                                <TableRow key={`${item.nome}-${index}`}>
                                  <TableCell>{item.nome}</TableCell>
                                  <TableCell align="right">
                                    {item.quantidade}{item.unidade ? ` ${item.unidade}` : ''}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </Box>
                    </Box>
                  ) : bloco.insumos.length === 0 ? (
                    <Typography px={2} py={1} color="text.secondary">Nenhum insumo informado.</Typography>
                  ) : (
                    <Table size="small" aria-label={bloco.titulo}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Insumo</TableCell>
                          <TableCell align="right">Quantidade</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {bloco.insumos.map((item, index) => (
                          <TableRow key={`${item.nome}-${index}`}>
                            <TableCell>{item.nome}</TableCell>
                            <TableCell align="right">
                              {item.quantidade}{item.unidade ? ` ${item.unidade}` : ''}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}

            {insumosExtras.length > 0 && (
              <Accordion disableGutters variant="outlined">
                <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                  <Typography fontWeight={700}>📝 Insumos Adicionais</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 0, pt: 0 }}>
                  <Table size="small" aria-label="Insumos adicionais">
                    <TableHead><TableRow><TableCell>Insumo</TableCell><TableCell align="right">Quantidade</TableCell></TableRow></TableHead>
                    <TableBody>
                      {insumosExtras.map((item, index) => (
                        <TableRow key={`${item.nome}-${index}`}>
                          <TableCell>{item.nome}</TableCell>
                          <TableCell align="right">{item.quantidade}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionDetails>
              </Accordion>
            )}

            {itensLivres.length > 0 && (
              <Accordion disableGutters variant="outlined">
                <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                  <Typography fontWeight={700}>✏️ Itens de Texto Livre</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 0, pt: 0 }}>
                  <Table size="small" aria-label="Itens de texto livre">
                    <TableHead><TableRow><TableCell>Item</TableCell><TableCell align="right">Quantidade</TableCell></TableRow></TableHead>
                    <TableBody>
                      {itensLivres.map((item, index) => (
                        <TableRow key={`${item.nome}-${index}`}>
                          <TableCell>{item.nome}</TableCell>
                          <TableCell align="right">{item.quantidade}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionDetails>
              </Accordion>
            )}
          </Box>
        )}
    </Paper>

    <Paper sx={{ p: { xs: 2, sm: 2.5 }, border: '1px solid #f0e7e0', borderRadius: 3 }}>
      <Typography variant="h2" sx={{ fontSize: 18, mb: 1.5 }}>
        Descrição e Modo de Preparo
      </Typography>
      {origensComDescricao.length === 0 ? (
        <Typography color="text.secondary">
          Nenhum modo de preparo informado para os componentes desta composição.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {origensComDescricao.map((bloco) => (
            <Box key={`preparo-${bloco.chave}`}>
              <Typography fontWeight={700} sx={{ mb: 0.5 }}>
                {bloco.titulo.replace(/^Receita — |^Componente — /, '')}
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {bloco.descricao}
              </Typography>
            </Box>
          ))}
        </Stack>
      )}
    </Paper>
    </Box>
  );
}
