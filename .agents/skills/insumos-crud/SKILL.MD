---
name: insumos-crud
description: Gestão de cadastro de insumos — criar, listar, editar, inativar. NÃO usar para registro de compras. Regra de ouro: inativar em vez de excluir.
---

# Habilidade: Gestão de Insumos

## Responsabilidades
- Cadastrar insumo: nome, unidade de medida
- Listar insumos — padrão: apenas ativos; permitir filtro (ativos / inativos / todos)
- Editar dados do insumo
- Inativar insumo (`ativo = false`) — NUNCA excluir fisicamente
- Preservar histórico de compras do insumo inativo

## Regras de Negócio
- Nome é obrigatório e único
- Unidade de medida é obrigatória
- Insumo inativo: não aparece em listagem padrão, não recebe novas compras
- Inativo permanece acessível por filtro e histórico

## Campos do Insumo
- nome: varchar(200), único
- unidade_medida: varchar(20) (g, kg, ml, l, un, m, min...)
- ativo: bool = true
- data_criacao: timestamp
