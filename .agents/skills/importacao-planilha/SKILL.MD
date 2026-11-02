---
name: importacao-planilha
description: Importar planilha existente — cada linha = insumo (se novo) + registro de compra. Valida cálculo e preserva histórico.
---

# Habilidade: Importação de Planilha

## Responsabilidades
- Ler arquivo .xlsx com colunas: nome, data, quantidade, valor total, unidade
- Criar insumo se não existir
- Gerar registro de compra para cada linha
- Validar: valor_unitario = valor_total / quantidade
- Relatório de importação: quantos criados, quantos atualizados, erros

## Regras de Negócio
- Importação roda uma vez na migração inicial
- Validação de cálculo antes de persistir
- Nome duplicado → cria novo registro no insumo existente
