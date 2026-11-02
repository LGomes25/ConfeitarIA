# 🧁 ConfeitarIA

> Sistema de gestão de insumos e custos para confeitaria — com histórico de compras e acompanhamento de evolução de preços.

---

## O que é o ConfeitarIA

O ConfeitarIA é uma aplicação desenvolvida para substituir o controle manual em planilhas, oferecendo clareza sobre custos de insumos e permitindo acompanhar como os preços variam ao longo do tempo. O sistema foi projetado para ser simples, confiável e escalável.

## Para que serve

- Cadastrar e manter o cadastro de insumos ativos
- Registrar cada compra com data, quantidade e valor
- Visualizar o histórico de preços e a variação em gráfico
- Consultar rapidamente o valor da última compra de cada insumo
- Preservar o histórico de forma permanente, sem perda de dados

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| **Frontend** | React 18 + TypeScript + Vite |
| **Backend** | C# / .NET 8+ Web API |
| **Banco de Dados** | PostgreSQL |
| **ORM** | Entity Framework Core 8 |
| **Gráficos** | Biblioteca de visualização de dados |
| **Desenvolvimento** | VS Code, Git, Antigravity |

### Ambiente
- Desenvolvimento executado localmente antes da publicação
- Hospedagem em serviços gratuitos: Vercel (frontend), Render (backend), Supabase/Neon (banco)

---

## Fases do Projeto

| Fase | Período | Foco Principal |
|---|---|---|
| **Fase 1** | Em desenvolvimento | Gestão de insumos, histórico de compras, evolução de preços e importação de dados |
| **Fase 2** | A definir | Segurança, usuários e permissões |
| **Fase 3** | A definir | Cadastro de produtos e composição de custos |
| **Fase 4** | A definir | Pedidos, clientes e operação de vendas |
| **Fase 5** | A definir | Painéis gerenciais e relatórios |
| **Fase 6** | A definir | Funcionalidades avançadas e integrações |

> Cada fase será detalhada em documento próprio quando iniciada.
> A Fase 1 é a única ativa no momento — escopo fechado.

---

## Estrutura do Projeto

confeitaria-app/
├── .agents/ # Agentes e regras de desenvolvimento
├── backend/ # API C# .NET
├── frontend/ # Interface React + TS
├── docs/ # Documentação técnica e regras
├── README.md # Este arquivo
└── .gitignore

---

## Documentação Complementar
- 📋 **Regras de Negócio e Modelo de Dados** → em `docs/SDD-Fase1.md`
- 📋 **Histórico de Requisitos** → em `docs/requisitos-fase1.md`

---

*ConfeitarIA — Gestão inteligente para sua confeitaria.*
