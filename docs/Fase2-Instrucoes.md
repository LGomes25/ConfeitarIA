# 📝 Instruções de Implementação — Fase 2
## Regras, Padrões e Diretrizes Complementares

---

## 1. Objetivo
Implementar **autenticação, gestão de usuários e controle de acesso** sem alterar o funcionamento da Fase 1. Foco exclusivo nesta fase.

---

## 2. Alterações no Backend

### 2.1 Camadas Envolvidas
| Camada | O que fazer |
|---|---|
| **Domain** | Nada — entidades já estão definidas |
| **Application** | DTOs de autenticação, serviços de notificação, validações |
| **Infrastructure** | Configurar ASP.NET Identity, JWT, Migrations, Repositórios de usuários |
| **API** | Novos controllers, atributos `[Authorize]`, configuração de autenticação |

### 2.2 Proteção da Fase 1
Adicionar em TODOS os métodos de `InsumosController` e `ComprasController`:
```csharp
[Authorize(Roles = "Admin,Manager")]

### 2.3 Validações Obrigatórias

- `NomeApelido`: obrigatório, 3 a 100 caracteres
- `Email` OU `Telefone`: pelo menos um preenchido
- Se ambos preenchidos → ambos disponíveis para login
- Formato de telefone aceito: `(XX) XXXXX-XXXX` ou similar
- Senha: mínimo 6 caracteres com mistura de letras/números (padrão Identity)

### 2.4 Notificações

- Se `Telefone` presente → enviar WhatsApp
- Se `Email` presente → enviar email
- Se AMBOS → enviar nos dois
- Implementar de forma que o serviço de WhatsApp possa ser conectado depois (interface pronta)

---

## 3. Frontend — Padrões

### 3.1 Estrutura

frontend/src/
├── pages/
│   ├── Inicio.tsx              # Boas-vindas
│   ├── Login.tsx
│   ├── Cadastro.tsx
│   ├── RecuperarSenha.tsx
│   ├── Perfil.tsx
│   └── admin/Usuarios.tsx      # Acesso restrito
├── components/
│   ├── auth/LoginForm.tsx
│   ├── auth/CadastroForm.tsx
│   ├── auth/ProtectedRoute.tsx
│   ├── layout/Header.tsx       # Atualizado com botão Entrar/Nome
│   └── usuarios/UsuarioCard.tsx
├── services/
│   ├── api.ts                  # Incluir interceptor JWT
│   └── auth.service.ts
├── types/
│   └── usuario.ts
└── context/
    └── AuthContext.tsx         # Estado global de autenticação

### 3.2 Comportamento de Sessão

- Token **não persiste no localStorage** → apenas em memória
- `refreshToken` renovado enquanto a aba estiver aberta
- Fechou navegador → perde sessão → volta para botão "Entrar"
- Em tela protegida sem sessão → redireciona para login sem erro brusco

### 3.3 Mensagens ao Usuário

|Situação	|Mensagem|
|----|-----|
|Cadastro ok	|✅ "Conta criada com sucesso! Já pode entrar."|
|5 tentativas erradas	|⚠️ "Conta bloqueada por 10 minutos. Tente novamente mais tarde."|
|Sem permissão	|🔒 "Você não tem permissão para acessar este recurso."|
|Senha temporária	|⚠️ "Crie uma nova senha para continuar."|

## 4. Migração do Banco

1. Criar migração: `dotnet ef migrations add Fase2_Autenticacao`
2. Verificar script gerado
3. Aplicar: `dotnet ef database update`
4. **Preservar** todos os insumos e compras existentes
5. Criar primeiro usuário `Admin` com dados padrão (documentar no console)

---

## 5. Pontos de Verificação Antes de Concluir

- Insumos/compras bloqueados para perfis inferiores
- Login funciona com email e com telefone
- Bloqueio de conta ativa e desbloqueia sozinho
- Sessão encerra ao fechar navegador
- Admin consegue alterar perfil de qualquer usuário
- Endereço de entrega copia dados com um clique
- Nenhum dado da Fase 1 foi perdido
- Frontend responsivo mantido
- Página inicial de boas-vindas apresentada

---

*ConfeitarIA — Fase 2: Implementação Segura*
