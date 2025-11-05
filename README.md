# Delivery Control - Frontend

Interface web moderna para o sistema de controle de entregas, desenvolvida com React, TypeScript e Tailwind CSS.

## Tecnologias

- **React 18** com TypeScript
- **Vite** para build rápido
- **Tailwind CSS** para estilização
- **FullCalendar** para visualização de entregas
- **React Router** para navegação
- **Axios** para requisições HTTP
- **Zustand** para gerenciamento de estado
- **React Hook Form** + Zod para formulários
- **Lucide React** para ícones

## Instalação e Execução

### Opção 1: Localmente (requer Node.js 20+)

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

### Opção 2: Com Docker

```bash
# Certifique-se de que o backend está rodando primeiro
docker-compose up -d
```

## Variáveis de Ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```
VITE_API_URL=http://localhost:8000/api
```

## Funcionalidades Implementadas

### Autenticação
- Login de usuários
- Registro de empresa e usuário admin
- Proteção de rotas privadas
- Gerenciamento de token JWT

### Dashboard
- **Calendário Grande**: Visualização mensal, semanal e diária das entregas
- Cards com estatísticas (total, em trânsito, entregues, pendentes)
- Legenda de cores por status de entrega
- Modal com detalhes da entrega ao clicar em um evento

### Calendário de Entregas

O calendário é o componente principal da aplicação:

- **Visualizações**: Mês, Semana e Dia
- **Interativo**: Clique em eventos para ver detalhes
- **Colorido**: Cada status tem sua cor:
  - Cinza: Pendente
  - Azul: Atribuída
  - Amarelo: Em trânsito
  - Verde: Entregue
  - Vermelho: Falhou
  - Cinza escuro: Cancelada
- **Responsivo**: Adapta-se a diferentes tamanhos de tela
- **Localizado**: Interface em português

## Estrutura de Pastas

```
src/
├── components/          # Componentes reutilizáveis
│   └── Calendar.tsx    # Componente principal do calendário
├── contexts/           # Contexts React
│   └── AuthContext.tsx # Context de autenticação
├── pages/              # Páginas da aplicação
│   ├── Login.tsx       # Página de login
│   └── Dashboard.tsx   # Dashboard principal
├── services/           # Serviços de API
│   ├── api.ts          # Configuração do Axios
│   ├── auth.service.ts # Serviço de autenticação
│   ├── delivery.service.ts      # Serviço de entregas
│   └── deliverer.service.ts     # Serviço de entregadores
├── types/              # TypeScript types
│   └── index.ts        # Interfaces e tipos
├── App.tsx             # Componente raiz com rotas
├── main.tsx            # Entry point
└── index.css           # Estilos globais + Tailwind
```

## Como Usar

1. **Certifique-se de que o backend está rodando** em `http://localhost:8000`
2. **Inicie o frontend** com `npm run dev`
3. **Acesse** `http://localhost:5173`
4. **Faça login** ou registre uma nova empresa
5. **Visualize o calendário** com todas as entregas
6. **Clique em uma entrega** para ver detalhes

## Integração com Backend

O frontend se comunica com o backend Laravel através da API REST:

- **Base URL**: Configurada em `.env` (padrão: `http://localhost:8000/api`)
- **Autenticação**: Bearer Token (Laravel Sanctum)
- **Formato**: JSON

Certifique-se de que o backend está rodando antes de iniciar o frontend.

## Scripts Disponíveis

```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Cria build de produção
npm run preview      # Preview do build de produção
npm run lint         # Roda o linter
```

## Troubleshooting

### Erro de CORS
Certifique-se de que o backend está configurado para aceitar requisições do frontend.

### Token inválido
Limpe o localStorage e faça login novamente:
```javascript
localStorage.clear()
```

### Calendário não carrega
1. Verifique se o backend está rodando
2. Verifique se há entregas cadastradas
3. Veja o console do navegador para erros
