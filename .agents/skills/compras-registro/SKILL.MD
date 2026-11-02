---
name: compras-registro
description: Registrar compras de insumos e manter histórico. Cálculo do valor unitário é automático — NÃO é digitado pelo usuário.
---

# Habilidade: Registro de Compras

## Responsabilidades
- Vincular compra a um insumo existente
- Registrar: data, quantidade, valor total, fornecedor (opcional)
- Calcular valor unitário = valor_total / quantidade
- Atualizar referência de último registro do insumo
- Impedir compra para insumo inativo

## Regras de Negócio
- valor_unitario NUNCA é entrada do usuário — calculado no banco
- Não registrar compra para insumo inativo
- Exclusão de compra não remove insumo
- Após exclusão, último registro = o mais recente restante

## Campos de Registro
- insumo_id (vínculo obrigatório)
- data_compra (obrigatória)
- quantidade: decimal(12,4)
- valor_total: decimal(10,2)
- valor_unitario: calculado (decimal(12,6))
- fornecedor: opcional
