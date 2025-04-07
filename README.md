# Sistema de Atribuição de Respostas

## Sobre o Projeto

Este é um sistema de gerenciamento e atribuição automática de respostas, desenvolvido para distribuir equitativamente as respostas do formulário entre os usuários ativos do sistema.

## Tecnologias Utilizadas

- **Frontend:**
  - Vite
  - TypeScript
  - React
  - shadcn-ui
  - Tailwind CSS
  - React Router DOM
  - Recharts (para gráficos)

- **Backend:**
  - Supabase (Banco de dados e autenticação)

## Funcionalidades Principais

- Atribuição automática de respostas baseada em antiguidade
- Dashboard com estatísticas e visualizações
- Gerenciamento de usuários (ativação/desativação)
- Sistema de rotação contínua de atribuições
- Configuração automatizada via Supabase

## Configuração do Ambiente de Desenvolvimento

1. **Pré-requisitos:**
   - Node.js & npm
   - Conta no Supabase

2. **Instalação:**
   ```sh
   # Clone o repositório
   git clone <URL_DO_REPOSITÓRIO>

   # Entre no diretório
   cd <NOME_DO_PROJETO>

   # Instale as dependências
   npm install

   # Configure as variáveis de ambiente
   cp .env.example .env.local
   # Edite .env.local com suas credenciais

   # Inicie o servidor de desenvolvimento
   npm run dev
   ```

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria a build de produção
- `npm run preview` - Visualiza a build localmente
- `npm run lint` - Executa o linter

## Deploy

O projeto está configurado para deploy na Vercel. Cada push na branch main dispara um novo deploy automaticamente.

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.


