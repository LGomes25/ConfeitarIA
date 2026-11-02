---
name: evolucao-precos
description: Exibir último preço registrado e gráfico de variação de preço do insumo — período de 1 ano.
---

# Habilidade: Evolução de Preços

## Responsabilidades
- Destacar último registro do insumo: data, valor unitário, quantidade
- Gerar gráfico de variação — últimos 12 meses
- Eixo X: datas das compras; Eixo Y: valor unitário
- Calcular variação percentual entre registros (opcional)

## Regras de Negócio
- Gráfico mostra apenas últimos 12 meses
- Último registro = data_compra mais recente
- Se insumo inativo: histórico continua visível, sem novos pontos
