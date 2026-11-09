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
| **Frontend** | React 18 + TypeScript + Vite | Interface responsiva, com carregamento otimizado por página |
| **Componentes visuais** | Material UI (MUI) | Componentes prontos, tema personalizado e navegação responsiva |
| **Gráficos** | Recharts | Evolução do custo unitário dos últimos 12 meses |
| **Consumo da API** | Axios | Comunicação com a API e tratamento de erros |
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
| **Fase 1** | Mantida | Gestão de insumos, histórico de compras, evolução de preços e importação de dados |
| **Fase 2** | Mantida | Autenticação, usuários e permissões |
| **Fase 3** | Implementada | Navegação pública, vitrine e estrutura de apresentação |
| **Fase 4** | A definir | Cadastro de produtos e composição de custos |
| **Fase 5** | A definir | Pedidos, clientes e operação de vendas |
| **Fase 6** | A definir | Painéis gerenciais, relatórios e integrações |

> A Fase 3 adiciona navegação pública e acolhedora sem login obrigatório. Ao autenticar, a barra lateral é habilitada automaticamente para os perfis operacionais (`Admin`, `Manager` e `Team`) e permanece desabilitada para o perfil `Customer` e visitantes:
> - **`Admin`:** Acesso total a Insumos, Compras, Gestão de Usuários e Meu Perfil (barra lateral habilitada).
> - **`Manager`:** Acesso a Insumos, Compras e Meu Perfil (barra lateral habilitada).
> - **`Team`:** Barra lateral habilitada com Meu Perfil; preparado para a futura página de Receitas (sem acesso a Insumos e Compras).
> - **`Customer`:** Acesso ao Meu Perfil com navegação pública limpa (barra lateral sempre desabilitada).
> - **Visitante (deslogado):** Acesso às páginas institucionais e vitrine (barra lateral sempre desabilitada).

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
├── frontend/                           # Interface React 18 + TS + Vite
│   ├── src/
│   │   ├── components/                 # Layout, formulários, tabelas, gráfico e estados
│   │   ├── hooks/                      # Hooks reutilizáveis
│   │   ├── pages/                      # Insumos, compras e detalhes do insumo
│   │   ├── services/                   # Axios e chamadas à API
│   │   ├── types/                      # Tipos de insumos, compras e gráfico
│   │   ├── utils/                      # Formatação de datas e valores
│   │   ├── App.tsx                     # Rotas da aplicação
│   │   └── theme.ts                    # Tema e paleta do MUI
│   ├── package.json
│   └── vite.config.ts
├── docs/                               # Documentação técnica e especificações
│   ├── SDD-Fase1.md                    # Especificação de Detalhamento de Software (Fase 1)
│   ├── SDD-Fase2.md                    # Especificação de autenticação e permissões
│   └── Fase2-Instrucoes.md              # Regras complementares da Fase 2
├── README.md                           # Este arquivo
└── .gitignore
```

---

## Frontend — Execução

### Pré-requisitos
- [Node.js](https://nodejs.org/) instalado
- API do backend em execução na porta `5000`

### Instalar dependências e iniciar
Na raiz do projeto:
```bash
cd frontend
npm install
npm run dev
```
O Vite disponibiliza a aplicação em [http://localhost:5173](http://localhost:5173).

Por padrão, o frontend consome a API em `http://localhost:5000/api`. Para utilizar outro endereço, defina `VITE_API_URL` em `frontend/.env.local`, por exemplo:
```env
VITE_API_URL=http://localhost:5000/api
```

### Gerar build de produção
```bash
cd frontend
npm run build
```

### Funcionalidades disponíveis
- Listagem de insumos com filtros por ativos, inativos ou todos
- Cadastro, edição, inativação e reativação de insumos
- Registro de compras de insumos ativos; o valor unitário é calculado pela API
- Detalhes do insumo com custo atual, última compra, histórico e gráfico de preços dos últimos 12 meses
- Exclusão de compras individuais, mantendo o insumo e os demais registros
- Layout responsivo para celular e laptop, com mensagens de carregamento e erro
- Cadastro e login por email ou telefone, perfil pessoal e endereços
- Administração de usuários, perfis, bloqueios e senha temporária
- Access/refresh tokens mantidos somente em memória no navegador

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

### Autenticação e notificações (Fase 2)
- Em desenvolvimento, a API gera uma chave JWT efêmera se `Jwt:Secret` não estiver definida. As sessões expiram quando a API reinicia.
- Em outros ambientes, configure `Jwt__Secret` como variável de ambiente (mínimo 32 bytes). Nunca versione esse segredo.
- No primeiro início após a migration, um Admin é criado com email `admin@confeitaria.local`; a senha temporária é exibida uma única vez no console da API e deve ser alterada no primeiro acesso.
- O envio de recuperação por email exige `Notifications__Email__SmtpHost`, `Notifications__Email__Sender` e os demais parâmetros SMTP. Configure credenciais via ambiente, não em arquivos versionados.
- O adaptador WhatsApp envia `{ "to": "...", "message": "..." }` para `Notifications__WhatsApp__Endpoint`, com bearer token em `Notifications__WhatsApp__AccessToken`.
- Sem um provedor configurado, o endpoint de recuperação informa erro de envio; configure os canais antes de habilitar recuperação em produção.

As configurações correspondentes e os valores padrão não secretos estão em `backend/ConfeitarIA.API/appsettings.json`.

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
| `GET` | `/api/insumos?status=ativos` | Lista insumos cadastrados incluindo o custo unitário da última compra (`custoUnitario`) (filtro: `ativos`, `inativos` ou `todos`) |
| `POST` | `/api/insumos` | Cadastra novo insumo (validação de unicidade de nome) |
| `GET` | `/api/insumos/{id}` | Detalhes do insumo com custo unitário atual e dados da última compra (com `unidadeMedida`) |
| `PUT` | `/api/insumos/{id}` | Atualiza nome e unidade de medida do insumo |
| `DELETE` | `/api/insumos/{id}` | Inativação lógica (*soft delete*, nunca exclusão física) |
| `PATCH` | `/api/insumos/{id}/reativar` | Restaura insumo para status ativo |
| `GET` | `/api/insumos/{id}/compras` | Histórico cronológico de compras vinculadas incluindo unidade de medida (`unidadeMedida`) e custo unitário |
| `GET` | `/api/insumos/{id}/grafico-precos` | Série temporal de preços nos últimos 12 meses |

### Compras (`/api/compras`)
| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/compras` | Registra compra vinculada com unidade de medida (valor unitário calculado no banco: `valor_total / quantidade`) |
| `DELETE` | `/api/compras/{id}` | Exclui registro individual de compra (preserva o insumo) |

---

## Documentação Complementar
- 📋 **Regras de Negócio e Modelo de Dados** → em `docs/SDD-Fase1.md`
- 🔐 **Autenticação e permissões** → em `docs/SDD-Fase2.md` e `docs/Fase2-Instrucoes.md`
- 🍰 **Navegação pública e vitrine** → em `docs/SDD-Fase3.md` e `docs/Fase3-Instrucoes.md`
- 📋 **Histórico de Requisitos** → em `docs/requisitos-fase1.md`

---

*ConfeitarIA — Gestão inteligente para sua confeitaria.*
