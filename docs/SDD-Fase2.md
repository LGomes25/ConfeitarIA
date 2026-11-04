# 📋 SDD — Especificação de Detalhamento de Software
## Fase 2 — Autenticação, Usuários e Permissões

**Projeto:** ConfeitarIA
**Versão:** 2.0
**Data:** 03/11/2026
**Status:** Definido — Em Desenvolvimento

---

## 1. Visão Geral

Esta fase implementa o sistema de segurança, gestão de usuários e controle de acesso baseado em perfis, garantindo que cada área do sistema seja acessível apenas por quem tem permissão.

---

## 2. Perfis de Acesso

| Nível | Perfil | Código | Permissões |
|---|---|---|---|
| 1 | **Administrador** | `Admin` | Acesso completo a tudo + gestão de usuários e perfis |
| 2 | **Gestor** | `Manager` | Acesso a todos os recursos operacionais, SEM gestão de perfis |
| 3 | **Equipe** | `Team` | Visualiza receitas e interage com pedidos (módulos futuros) |
| 4 | **Cliente** | `Customer` | Visualiza produtos, realiza pedidos, gerencia seus dados |
| 5 | **Visitante** | — | Navegação pública, visualização de produtos — sem cadastro |

**Regras:**
- Novos cadastros recebem **automaticamente** o perfil `Customer`
- Perfil superior só pode ser atribuído pelo `Admin`
- Um usuário pode ter múltiplos perfis
- Insumos e Compras da Fase 1: visíveis **apenas** para `Admin` e `Manager`

---

## 3. Modelo de Dados

### 3.1 Tabela: `AspNetUsers` (extensão do Identity)
| Campo | Tipo | Regra |
|---|---|---|
| `Id` | PK | Identificador único |
| `NomeApelido` | `varchar(100)` | Obrigatório — como a pessoa quer ser chamada |
| `Email` | `varchar(150)` | Único, **pode ser NULL** se cadastrado só com telefone |
| `Telefone` | `varchar(20)` | Único, formato `(XX) XXXXX-XXXX`, **pode ser NULL** |
| `NotificarPorWhatsApp` | `boolean` | `true` por padrão |
| `NotificarPorEmail` | `boolean` | `true` por padrão |
| `AccessFailedCount` | `int` | Contagem de tentativas de login erradas |
| `LockoutEnd` | `datetimeoffset?` | Bloqueio temporário — 10 min após 5 falhas |
| `Ativo` | `boolean` | `true` por padrão |
| `SenhaTemporaria` | `boolean` | Força troca no próximo acesso |
| `DataCriacao` | `timestamp` | Automático |

### 3.2 Tabela: `Enderecos`
| Campo | Tipo | Regra |
|---|---|---|
| `Id` | PK | |
| `UsuarioId` | FK → Usuários | Obrigatório |
| `Tipo` | `varchar(20)` | `Residencial` ou `Entrega` |
| `Logradouro` | `varchar(200)` | Opcional |
| `Numero` | `varchar(20)` | Opcional |
| `Bairro` | `varchar(100)` | Opcional |
| `Cidade` | `varchar(100)` | Opcional |
| `UF` | `char(2)` | Opcional |
| `CEP` | `varchar(10)` | Opcional |
| `Complemento` | `text` | Campo livre para detalhes/observações |

**Regras:**
- Apenas **um** endereço de entrega por usuário
- Endereço de entrega **obrigatório** apenas no momento do pedido
- Botão "Copiar endereço residencial" preenche automaticamente os campos de entrega

### 3.3 Tabela: `RefreshTokens`
| Campo | Tipo | Regra |
|---|---|---|
| `Id` | PK | |
| `UsuarioId` | FK | |
| `Token` | `text` | Hash do refresh token |
| `ExpiraEm` | `datetime` | 7 dias |
| `RevogadoEm` | `datetime?` | Null = ativo |

---

## 4. Autenticação e Segurança

### 4.1 Fluxo de Cadastro
- Campos: `NomeApelido` + (`Email` OU `Telefone`) + `Senha`
- Validação: pelo menos um dos contatos deve ser informado
- Mensagem de confirmação visual imediata: *"Conta criada com sucesso! Já pode entrar."*
- Sem confirmação por email obrigatória

### 4.2 Fluxo de Login
- Escolha: "Entrar com Email" ou "Entrar com Telefone"
- Dados + Senha → validação
- 5 tentativas erradas → bloqueio por 10 minutos → desbloqueia automaticamente
- Retorna: `accessToken` (30 min) + `refreshToken` (7 dias)
- **Sessão na memória** — ao fechar o navegador, faz login novamente

### 4.3 Recuperação de Senha
- **Pessoa recupera sozinha:** envia link por email OU código por WhatsApp (conforme cadastrado)
- **Admin redefine:** gera senha temporária → usuário é forçado a trocar no primeiro acesso

### 4.4 JWT e Autorização
- Token no header: `Authorization: Bearer {token}`
- `[Authorize(Roles = "Admin")]` — restrição por perfil
- Endpoints da Fase 1 (`/api/insumos`, `/api/compras`): permissão apenas `Admin,Manager`
- Rotas sem permissão → retorno amigável: *"Você não tem permissão para acessar este recurso"*

---

## 5. Endpoints da Fase 2

| Método | Rota | Perfil | Descrição |
|---|---|---|---|
| POST | `/api/auth/cadastro` | Público | Cria conta → perfil `Customer` |
| POST | `/api/auth/login` | Público | Autentica e retorna tokens |
| POST | `/api/auth/refresh` | Público (com token) | Renova access token |
| POST | `/api/auth/logout` | Autenticado | Revoga token |
| POST | `/api/auth/esqueci-senha` | Público | Envia link/código de redefinição |
| POST | `/api/auth/redefinir-senha` | Público | Cria nova senha |
| GET | `/api/usuarios` | `Admin` | Lista todos usuários |
| PATCH | `/api/usuarios/{id}/perfil` | `Admin` | Altera perfil do usuário |
| POST | `/api/usuarios/{id}/senha-temporaria` | `Admin` | Gera senha temporária |
| PATCH | `/api/usuarios/{id}/bloquear` | `Admin` | Bloqueia conta |
| PATCH | `/api/usuarios/{id}/desbloquear` | `Admin` | Desbloqueia conta |
| GET/PUT | `/api/meu-perfil` | Autenticado | Lê/atualiza dados próprios |
| POST/PUT | `/api/meu-perfil/endereco-entrega` | Autenticado | Salva endereço de entrega |

---

## 6. Frontend — Telas e Fluxo

### 6.1 Página Inicial (Boas-Vindas)
- Apresentação visual amigável
- Botão "Entrar" no cabeçalho
- Sem redirecionamento forçado
- Futuramente: painel principal conforme perfil

### 6.2 Autenticação
- Modal/tela de login com escolha: Email ou Telefone
- Formulário de cadastro
- Recuperação de senha
- Mensagens claras de erro e sucesso
- Bloqueio: mensagem com tempo estimado de desbloqueio

### 6.3 Gestão de Usuários (Admin)
- Lista com filtro por perfil/status
- Alteração de perfil (radio buttons)
- Redefinição de senha
- Bloquear/desbloquear

### 6.4 Perfil do Usuário
- Dados pessoais e contato
- Endereço residencial e entrega
- Botão "Copiar endereço residencial"
- Alteração de senha

### 6.5 Navegação Condicional
- Menus e botões aparecem de acordo com o perfil
- Insumos/Compras: ocultos para `Team`, `Customer`, visitantes
- Responsivo: celular e laptop
- Paleta de cores confeitaria mantida

---

## 7. Migrações e Banco
- Usar **Entity Framework Core Migrations**
- Aplicar `Update-Database` após criação
- Preservar dados existentes da Fase 1
- Novas tabelas: compatíveis com PostgreSQL

---

*ConfeitarIA — Fase 2: Segurança e Controle de Acesso*
