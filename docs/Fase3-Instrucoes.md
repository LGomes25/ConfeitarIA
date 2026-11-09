# 📝 Instruções de Implementação — Fase 3
## Navegação Pública e Estrutura de Apresentação

**Projeto:** ConfeitarIA
**Fase:** 3
**Data:** 08/11/2026
**Base:** Estrutura existente preservada

---

## 1. Objetivo
Implementar navegação livre para visitantes, sem exigência de login na entrada. O sistema deve acolher o público e convidar ao acesso restrito apenas quando necessário. **Nada do que já funciona deve ser alterado ou quebrado.**

---

## 2. Princípios de Implementação

### 2.1 Respeitar o Existente
> ✅ **Não crie do zero o que já está construído.**
- `Header.tsx` → **atualizar**, não recriar
- `AppLayout.tsx` → **estender**, não substituir
- `ProtectedRoute.tsx` → **reutilizar**, não duplicar
- `PageHeader.tsx` → **reutilizar** nas páginas novas
- Demais componentes e páginas → **inalterados**

### 2.2 Separação Clara
| Área | Barra Lateral | Exige Login |
|---|---|---|
| Páginas públicas | ❌ Oculta | Não |
| Insumos, Compras, Usuários, Perfil | ✅ Visível | Sim |

---

## 3. Passo a Passo de Implementação

### Passo 1 — Atualizar `components/layout/Header.tsx`
Manter todo o código existente, acrescentar:
- Navegação central: **Início · Produtos · Quem Somos · Contato**
- Campo de busca à direita
- Lado direito condicional:
  - Deslogado → botão **"Entrar"**
  - Logado → nome do usuário + menu suspenso (Perfil / Sair)
- Responsividade: em telas < 768px, links viram menu hambúrguer; busca permanece visível
- NÃO alterar estilos, cores ou espaçamentos — manter o padrão visual

### Passo 2 — Atualizar `components/layout/AppLayout.tsx`
Adicionar propriedade de controle:
```tsx
interface AppLayoutProps {
  children: React.ReactNode
  mostrarBarraLateral?: boolean
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, mostrarBarraLateral = true }) => {
  // ...
  {mostrarBarraLateral && <BarraLateral />}
  // ...
}
- Nas páginas públicas: `<AppLayout mostrarBarraLateral={false}>`
- Nas páginas protegidas: manter sem alteração → padrão `true`
- Estado de recolhimento da barra lateral **preservado**

### Passo 3 — Criar `components/common/AvisoConstrucao.tsx`

- Componente reutilizável
- Mensagem: 🚧 **"Estamos preparando algo especial... Em breve novidades!"**
- Estilo alinhado ao tema existente (cores, fontes, espaçamentos)
- Usado em todas as páginas públicas

### Passo 4 — Criar pasta e páginas `components/publico/`

components/publico/
├── PaginaInicial.tsx       → /
├── PaginaProdutos.tsx      → /produtos
├── PaginaQuemSomos.tsx     → /quem-somos
└── PaginaContato.tsx       → /contato

Cada página segue o mesmo padrão:
<AppLayout mostrarBarraLateral={false}>
  <PageHeader titulo="Título da Página" />
  <AvisoConstrucao />
  {/* Estrutura pronta para conteúdo futuro */}
</AppLayout>

### Passo 5 — Atualizar Rotas em `App.tsx`

// Páginas públicas — SEM proteção
<Route path="/" element={<PaginaInicial />} />
<Route path="/produtos" element={<PaginaProdutos />} />
<Route path="/quem-somos" element={<PaginaQuemSomos />} />
<Route path="/contato" element={<PaginaContato />} />
<Route path="/login" element={<LoginPage />} />

// Páginas protegidas — COM ProtectedRoute
<Route element={<ProtectedRoute />}>
  <Route path="/insumos" element={<InsumosPage />} />
  <Route path="/compras" element={<ComprasPage />} />
  <Route path="/usuarios" element={<UsuariosPage />} />
  <Route path="/meu-perfil" element={<PerfilPage />} />
</Route>

- Após login bem-sucedido → redirecionar para a rota que o usuário tentou acessar (salvar destino no estado de navegação)

### Passo 6 — Funcionalidade de Busca

- Chamada no `Header.tsx`
- Lógica condicional:
  - Página pública → mensagem: **"Busca em desenvolvimento"**
  - Página interna → usar busca existente de insumos/compras
- Manter comportamento atual nas telas internas

---

## 4. Fluxo do Usuário

|Ação	|Comportamento Esperado|
|--- |--- |
|Acessa localhost:porta/	|Abre página inicial, sem redirecionamento|
|Clica em qualquer link do cabeçalho	|Navega livremente, sem bloqueio|
|Clica em "Entrar"	|Vai para /login|
|Faz login com sucesso	|Retorna para a página que estava visitando|
|Tenta acessar /insumos sem login	|Mensagem amigável → botão "Fazer Login" → retorno automático|
|Faz logout	|Retorna para página inicial|

---

## 5. Manutenção do Existente

- Fase 1 — Insumos e Compras: inalterados e funcionando
- Fase 2 — Usuários, perfis, autenticação: inalterados e funcionando
- Estilo visual: sem alteração de cores, fontes ou espaçamentos
- Responsividade: mantida em celular e laptop
- Sem erros no console do navegador

---

## 6. Critérios de Aceite Final

- Página inicial abre sem pedir login
- Quatro páginas públicas navegáveis sem credenciais
- Barra lateral oculta nas páginas públicas
- Barra lateral visível e funcional nas páginas internas
- Cabeçalho com links, busca e menu usuário
- Retorno inteligente após login
- Mensagem padronizada de "Em Construção"
- Nenhum arquivo existente removido ou renomeado
- Nenhuma funcionalidade quebrada
- Sem duplicação de código

---

*ConfeitarIA — Fase 3: Acolher antes de pedir*
