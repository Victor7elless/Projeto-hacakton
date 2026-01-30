# Sistema de Organização de Documentos

Portal seguro para envio e gestão de arquivos acadêmicos com autenticação por CPF e painel administrativo para a secretaria.

## 🚀 Início Rápido

### Pré-requisitos

- **Node.js** 18+ instalado ([Download](https://nodejs.org/))
- **pnpm** ou **npm** (pnpm é recomendado)

### Instalação

1. **Clone ou extraia o projeto**
   ```bash
   cd sistema-documentos
   ```

2. **Instale as dependências**
   ```bash
   pnpm install
   # ou
   npm install
   ```

3. **Inicie o servidor de desenvolvimento**
   ```bash
   pnpm dev
   # ou
   npm run dev
   ```

4. **Acesse no navegador**
   ```
   http://localhost:5173
   ```

## 📋 Credenciais de Teste

### Alunos
- **CPF:** `123.456.789-00`
- **CPF:** `987.654.321-00`

### Secretaria (Admin)
- **Acesso:** Digite `admin` no campo de CPF

## 🎯 Funcionalidades

### Para Alunos
- ✅ Login com CPF
- ✅ Dashboard com histórico de documentos
- ✅ Upload de documentos (imagens e PDFs)
- ✅ Preview de imagens enviadas
- ✅ Acompanhamento de status (Pendente/Aprovado/Rejeitado)

### Para Secretaria
- ✅ Gerenciamento de alunos pré-cadastrados
- ✅ Cadastro de novos alunos
- ✅ Busca e filtro de documentos agrupados por aluno
- ✅ Preview integrado de PDFs
- ✅ Download de PDFs consolidados
- ✅ Aprovação/Rejeição de documentos
- ✅ Estatísticas de acesso

## 📁 Estrutura do Projeto

```
sistema-documentos/
├── client/
│   ├── public/              # Assets estáticos
│   │   └── images/         # Imagens do projeto
│   ├── src/
│   │   ├── components/     # Componentes React reutilizáveis
│   │   ├── contexts/       # Context API (Autenticação, Documentos, Alunos)
│   │   ├── lib/           # Utilitários e funções auxiliares
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── App.tsx        # Componente principal com rotas
│   │   ├── main.tsx       # Ponto de entrada React
│   │   └── index.css      # Estilos globais e Tailwind
│   └── index.html         # HTML principal

├── package.json           # Dependências do projeto
└── README.md             # Este arquivo
```

## 🔐 Segurança

- Autenticação por CPF com validação de dígitos verificadores
- Pré-cadastro obrigatório pela secretaria
- Proteção de rotas por tipo de usuário (aluno/admin)
- Validação de CPF em formato `XXX.XXX.XXX-XX`
- Dados armazenados localmente (localStorage)

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev          # Inicia servidor de desenvolvimento

# Produção
pnpm build        # Compila para produção
pnpm preview      # Visualiza build de produção

# Verificação
pnpm check        # Verifica tipos TypeScript
pnpm format       # Formata código com Prettier
```

## 🎨 Design

- **Framework:** React 19 + Tailwind CSS 4
- **UI Components:** shadcn/ui
- **Ícones:** Lucide React
- **Notificações:** Sonner
- **Roteamento:** Wouter

## 📊 Dados Mock

O sistema inclui dados de exemplo pré-carregados:

**Alunos:**
- João Silva (Ativo)
- Maria Oliveira (Aguardando)
- Carlos Santos (Ativo)
- Ana Costa (Inativo)

**Documentos:**
- Cada aluno tem documentos em diferentes estados
- Alguns com status de rejeição para teste

## 🔄 Fluxo de Uso

### Primeira Vez (Aluno)

1. Acesse `/` (página de login)
2. Digite seu CPF (ex: `123.456.789-00`)
3. Se cadastrado e ativo, será redirecionado para o dashboard
4. Envie seus documentos na aba "Enviar Documentos"

### Primeira Vez (Secretaria)

1. Acesse `/` e digite `admin`
2. Acesse `/admin/students` para gerenciar alunos
3. Cadastre novos alunos com nome e CPF
4. Acesse `/admin/search` para visualizar documentos
5. Aprove ou rejeite documentos conforme necessário

## 📝 Notas Importantes

- **Dados Locais:** Todos os dados são armazenados em localStorage do navegador
- **Sem Backend Real:** Este é um projeto frontend-only com dados simulados
- **Responsivo:** Funciona em mobile, tablet e desktop
- **Temas:** Suporta tema claro (padrão)

## 🚀 Deploy

### Vercel (Recomendado)

1. Faça push do repositório para GitHub
2. Acesse Vercel e conecte seu repositório
3. Configure Build Command: `npm run build`
4. Configure Output Directory: `dist/public`
5. Clique em Deploy

### Produção Local

1. Execute `pnpm build`
2. O arquivo gerado estará em `dist/public`
3. Faça upload para seu servidor web

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique se Node.js está instalado corretamente
2. Limpe o cache: `pnpm install --force`
3. Verifique se a porta 5173 está disponível

## 📄 Licença

Projeto desenvolvido para fins educacionais.

---

**Desenvolvido com ❤️ usando React + Tailwind CSS**
