# Equipe de Agentes — ConfeitarIA
## Foco: Fase 1 — Insumos e Histórico de Preços

## 🧑‍💻 Agente Backend
- Responsável: API C# .NET, EF Core, Migrations Postgres
- Prioridade: modelo de dados fiel ao SDD, cálculo automático do valor unitário
- Regra: valor_unitario NUNCA é enviado do frontend — calculado no banco

## 🎨 Agente Frontend
- Responsável: React + TS + Vite, listagem, formulários, gráfico
- Prioridade: interface simples, responsiva, exibição clara do último registro
- Gráfico: período de 1 ano, eixo X=data, eixo Y=valor unitário

## 🗄️ Agente DBA
- Responsável: modelagem Postgres, índices, integridade referencial
- Regra chave: inativação, nunca exclusão física de insumos

## 🧪 Agente QA
- Responsável: validar regras do SDD
- Verificar: insumo inativo não recebe compra, cálculo bate, importação funciona
