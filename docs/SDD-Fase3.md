# 📋 SDD — Especificação de Detalhamento de Software
## Fase 3 — Navegação Pública e Estrutura de Apresentação

**Projeto:** ConfeitarIA
**Versão:** 3.1
**Data:** 08/11/2026
**Status:** Em Desenvolvimento
**Alinhamento:** Estrutura de componentes existente preservada

---

## 1. Visão Geral

Esta fase implementa a **navegação livre e pública** do sistema, mantendo integralmente o design, os componentes e a estrutura de pastas JÁ EXISTENTES. O objetivo é permitir que visitantes acessem e conheçam o projeto sem exigir login, preservando todas as funcionalidades internas protegidas.

**Princípios fundamentais:**
- ✅ **NÃO recriar nem renomear arquivos existentes** — evoluir o que já está construído
- ✅ **Login é opcional** — não há redirecionamento forçado na entrada
- ✅ **Conteúdo estruturado** — páginas prontas com mensagem de "Em Construção"
- ✅ **Barra lateral condicional** — visível apenas em áreas internas
- ✅ **Componentização mantida** — cada arquivo com responsabilidade única

---

## 2. Estrutura Real de Arquivos — O Que Já Existe

frontend/src/components/
├── auth/
│   └── ProtectedRoute.tsx          ✅ Pronto para uso
├── common/
│   ├── PageHeader.tsx              ✅ Reutilizar
│   ├── ConfirmDialog.tsx           ✅ Mantido
│   ├── StatusChip.tsx               ✅ Mantido
│   └── AvisoConstrucao.tsx          ➕ NOVO — mensagem padrão
├── layout/
│   ├── AppLayout.tsx                ✅ ATUALIZAR — controlar barra lateral
│   └── Header.tsx                   ✅ ATUALIZAR — adicionar navegação pública
├── publico/                         ➕ NOVA PASTA
│   ├── PaginaInicial.tsx
│   ├── PaginaProdutos.tsx
│   ├── PaginaQuemSomos.tsx
│   └── PaginaContato.tsx
├── data/                            ✅ Mantido
├── forms/                           ✅ Mantido
└── usuarios/                        ✅ Mantido


---

## 3. Navegação e Rotas

### 3.1 Comportamento de Acesso
| Rota | Tipo | Barra Lateral | Exige Login |
|---|---|---|---|
| `/` | Pública | ❌ Oculta | Não |
| `/produtos` | Pública | ❌ Oculta | Não |
| `/quem-somos` | Pública | ❌ Oculta | Não |
| `/contato` | Pública | ❌ Oculta | Não |
| `/insumos` | Protegida | ✅ Visível | Sim |
| `/compras` | Protegida | ✅ Visível | Sim |
| `/usuarios` | Protegida | ✅ Visível | Sim |
| `/meu-perfil` | Protegida | ✅ Visível | Sim |
| `/login` | Pública | ❌ Oculta | Não |

### 3.2 Atualização do Header.tsx
O arquivo `components/layout/Header.tsx` será **atualizado**, não substituído:
| Seção | Conteúdo |
|---|---|
| Esquerda | Logo + "ConfeitarIA" → link para `/` |
| Centro | Início · Produtos · Quem Somos · Contato |
| Direita | Campo de busca + botão "Entrar" / Nome do usuário + menu (Perfil / Sair) |
| Responsivo | Em telas pequenas: links viram menu hambúrguer; busca visível |

### 3.3 Atualização do AppLayout.tsx
Adicionada propriedade de controle:
```tsx
interface AppLayoutProps {
  children: React.ReactNode
  mostrarBarraLateral?: boolean  // padrão: true
}
```
- Páginas públicas → `mostrarBarraLateral={false}`
- Páginas internas → mantém comportamento atual
- Estado de recolhimento da barra preservado

---

## 4. Páginas Públicas — Nova Pasta `components/publico/`

### 4.1 PaginaInicial.tsx (`/`)

- Apresentação convidativa alinhada ao tema de confeitaria artesanal
- Sem preços, sem dados internos
- Inclui `AvisoConstrucao` — mensagem de desenvolvimento
- Chamada: "Conheça nossos produtos" → link para `/produtos`
- Usa `PageHeader` existente

### 4.2 PaginaProdutos.tsx (`/produtos`)

- Estrutura de vitrine com cards responsivos
- Sem dados sensíveis ou mockados
- Inclui `AvisoConstrucao`
- Preparada para receber lista real na Fase 4

### 4.3 PaginaQuemSomos.tsx (`/quem-somos`)

- Estrutura de texto: apresentação, propósito, valores
- Inclui `AvisoConstrucao`
- Espaço reservado para conteúdo institucional

### 4.4 PaginaContato.tsx (`/contato`)

- Estrutura: telefone, WhatsApp, email, localização
- Links funcionais
- Formulário com campos: nome, mensagem
- Inclui `AvisoConstrucao`

### 4.5 AvisoConstrucao.tsx — `components/common/`

- Componente reutilizável em todas as páginas públicas
- Estilo alinhado ao tema visual existente
- Mensagem: 🚧 *"Estamos preparando algo especial... Em breve novidades!"*

---

## 5. Fluxo de Autenticação

- Botão "Entrar" no Header → navega para `/login`
- Após login → retorna automaticamente para a página de origem
- Acesso a rota protegida sem login → mensagem amigável + botão de login com retorno
- Após login: Header atualiza — mostra nome do usuário
- Logout → retorna para página inicial

---

## 6. Busca

- Campo no Header visível em todas as páginas
- Páginas públicas: busca de produtos → mensagem "Em Construção"
- Páginas internas: busca de insumos/compras → funcionalidade existente inalterada

---

## 7. Manutenção do Existente

- `ProtectedRoute.tsx` — reutilizado nas rotas protegidas
- `PageHeader.tsx` — reutilizado nas páginas públicas
- `App.tsx` — rotas atualizadas, sem exclusão das existentes
- Insumos, Compras, Usuários, Perfil — inalterados
- Estilo, paleta, responsividade — mantidos
- Fases 1 e 2 — 100% funcionais

---

## 8. Manutenção do Existente
- [ ] Fase 1 — Insumos e Compras: **100% inalteradas**
- [ ] Fase 2 — Usuários, perfis, autenticação: **100% inalteradas**
- [ ] Proteções `[Authorize]` mantidas no backend
- [ ] Estilo, paleta de cores, fontes e espaçamentos preservados
- [ ] Responsividade em celular e laptop mantida

---

## 8. Critérios de Aceite
- [ ] Acessar `localhost:porta/` → página inicial, sem redirecionamento para login
- [ ] Navegar entre as 4 páginas públicas: Início, Produtos, Quem Somos, Contato sem login
- [ ] Barra lateral NÃO aparece em nenhuma página pública
- [ ] Cabeçalho fixo visível em todas as telas e atualizado com links e busca
- [ ] Botão "Entrar" funciona → após login retorna para a página de origem
- [ ] Mensagem de "Em Construção" padronizada nas 4 páginas
- [ ] Busca visível e funcional no cabeçalho
- [ ] Em páginas internas: barra lateral recolhível aparece normalmente
- [ ] Estilo visual idêntico ao padrão estabelecido
- [ ] Sem erros no console do navegador
- [ ] Todas as funcionalidades anteriores continuam funcionando
- [ ]  Sem duplicação de arquivos existentes
- [ ]  Sem erros no console
- [ ]  Fases 1 e 2 intactas

---

*ConfeitarIA — Fase 3: Porta aberta para o visitante*
