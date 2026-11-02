# 🧁 ConfeitarIA

> Sistema de gestão de insumos e custos para confeitaria — com histórico de compras e acompanhamento de evolução de preços.

---

## O que é o ConfeitarIA

O ConfeitarIA é uma aplicação desenvolvida para substituir o controle manual em planilhas, oferecendo clareza sobre custos de insumos e permitindo acompanhar como os preços variam ao longo do tempo. O sistema foi projetado para ser simples, confiável e escalável.

## Para que serve

- Cadastrar e manter o cadastro de insumos ativos
- Registrar cada compra com data, quantidade e valor
- Visualizar o histórico de preços e a variação em gráfico (últimos 12 meses)
- Consultar rapidamente o valor da última compra de cada insumo
- Preservar o histórico de forma permanente, sem perda de dados (soft delete)

---

## Stack Tecnológica

| Camada | Tecnologia | Detalhes |
|---|---|---|
| **Frontend** | React 18 + TypeScript + Vite | Interface responsiva e visualização gráfica *(a inicializar)* |
| **Backend** | C# / .NET 8 Web API | Arquitetura DDD (Domain, Application, Infrastructure, API) |
| **Banco de Dados** | PostgreSQL | Supabase, Neon ou PostgreSQL local |
| **ORM** | Entity Framework Core 8 | Npgsql, Migrations e coluna calculada STORED |
| **Validação** | FluentValidation | Regras de entrada desacopladas e integradas ao pipeline |
| **Documentação/Testes** | Swagger / OpenAPI (Swashbuckle) | Documentação interativa e comentários XML habilitados |
| **Tratamento de Erros** | RFC 7807 (ProblemDetails) | Middleware global de tratamento padronizado de exceções |

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

```text
ConfeitarIA/
├── .agents/                            # Governança, regras e habilidades dos agentes
│   ├── AGENTS.md                       # Diretrizes por papel (Backend, Frontend, DBA, QA)
│   └── skills/                         # Procedimentos e regras de negócio específicas
├── backend/                            # API C# .NET 8 com Arquitetura DDD
│   ├── ConfeitarIA.sln
│   ├── ConfeitarIA.Domain/             # Model / Domínio Puro: Entidades, Regras e Repositórios
│   ├── ConfeitarIA.Application/        # Service / Casos de Uso: DTOs, Serviços e FluentValidation
│   ├── ConfeitarIA.Infrastructure/     # Persistência / EF Core 8: DbContext, Migrations e Npgsql
│   └── ConfeitarIA.API/                # Controller / Apresentação: Endpoints, Swagger UI e Middlewares
├── frontend/                           # Interface React 18 + TS + Vite (a inicializar)
├── docs/                               # Documentação técnica e especificações
│   └── SDD-Fase1.md                    # Especificação de Detalhamento de Software (Fase 1)
├── README.md                           # Este arquivo
└── .gitignore
```

---

## Backend — Execução e Testes

### Pré-requisitos
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) ou superior instalado
- Instância do **PostgreSQL** ativa (local, Docker ou cloud como Supabase/Neon)
- Ferramenta de linha de comando do EF Core (`dotnet tool install --global dotnet-ef`)

### Configuração do Banco de Dados
A string de conexão padrão encontra-se em `backend/ConfeitarIA.API/appsettings.Development.json`:
```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=confeitaria_dev;Username=postgres;Password=postgres"
}
```

### Aplicar as Migrações
Navegue até a pasta `backend/` e execute:
```bash
cd backend
dotnet ef database update --project ConfeitarIA.Infrastructure --startup-project ConfeitarIA.API
```

### Iniciar a API
Para rodar a API no perfil HTTP padrão (porta `5000`):
```bash
cd backend
dotnet run --project ConfeitarIA.API --launch-profile "http"
```
> **Dica:** O uso do perfil `--launch-profile "http"` é recomendado para testes locais para evitar avisos de certificados SSL autoassinados no navegador. Caso deseje rodar com HTTPS (porta `5001`), utilize `--launch-profile "https"`.

### Testes Interativos via Swagger UI
Com a API em execução, o navegador abrirá automaticamente ou você poderá acessar:
* **Interface Swagger direta:** [http://localhost:5000/swagger/index.html](http://localhost:5000/swagger/index.html)
* **Atalho simplificado:** [http://localhost:5000/swagger](http://localhost:5000/swagger)
* **Raiz da aplicação:** [http://localhost:5000](http://localhost:5000) (redireciona automaticamente para o Swagger UI)
* **Em HTTPS (se utilizado o perfil "https"):** [https://localhost:5001/swagger/index.html](https://localhost:5001/swagger/index.html)

---

## Endpoints Disponíveis (Fase 1)

### Insumos (`/api/insumos`)
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/insumos?status=ativos` | Lista insumos cadastrados (filtro: `ativos`, `inativos` ou `todos`) |
| `POST` | `/api/insumos` | Cadastra novo insumo (validação de unicidade de nome) |
| `GET` | `/api/insumos/{id}` | Detalhes do insumo com valor unitário atual e última compra |
| `PUT` | `/api/insumos/{id}` | Atualiza nome e unidade de medida do insumo |
| `DELETE` | `/api/insumos/{id}` | Inativação lógica (*soft delete*, nunca exclusão física) |
| `PATCH` | `/api/insumos/{id}/reativar` | Restaura insumo para status ativo |
| `GET` | `/api/insumos/{id}/compras` | Histórico cronológico de compras vinculadas |
| `GET` | `/api/insumos/{id}/grafico-precos` | Série temporal de preços nos últimos 12 meses |

### Compras (`/api/compras`)
| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/compras` | Registra compra (valor unitário calculado no banco: `valor_total / quantidade`) |
| `DELETE` | `/api/compras/{id}` | Exclui registro individual de compra (preserva o insumo) |

---

## Documentação Complementar
- 📋 **Regras de Negócio e Modelo de Dados** → em `docs/SDD-Fase1.md`
- 📋 **Histórico de Requisitos** → em `docs/requisitos-fase1.md`

---

*ConfeitarIA — Gestão inteligente para sua confeitaria.*
