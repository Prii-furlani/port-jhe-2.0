# Criação da Estrutura Inicial do "Portfólio Empresarial JHE"

O objetivo é criar a estrutura inicial do projeto full-stack, dividida em `frontend` e `backend`, além de definir a arquitetura do banco de dados com script DDL e estilos CSS globais.

## Proposed Changes

A estrutura do projeto será criada sob o diretório `jhe-portfolio-system`.

### Estrutura Base e Banco de Dados
- **[NEW]** `jhe-portfolio-system/arquitetura_banco_de_dados.txt`: Conterá o script DDL MySQL (`CREATE DATABASE`, `CREATE TABLE`), documentação das tabelas, inserts iniciais para teste e uma seção para futuros `ALTER TABLE`.

### Backend
Configuração inicial da API em Node.js.
- **[NEW]** `jhe-portfolio-system/backend/config/db.js`
- **[NEW]** `jhe-portfolio-system/backend/controllers/authController.js`
- **[NEW]** `jhe-portfolio-system/backend/controllers/projectController.js`
- **[NEW]** `jhe-portfolio-system/backend/controllers/clientController.js`
- **[NEW]** `jhe-portfolio-system/backend/controllers/serviceController.js`
- **[NEW]** `jhe-portfolio-system/backend/controllers/telemetryController.js`
- **[NEW]** `jhe-portfolio-system/backend/middlewares/authMiddleware.js`
- **[NEW]** `jhe-portfolio-system/backend/middlewares/auditMiddleware.js`
- **[NEW]** `jhe-portfolio-system/backend/routes/api.js`
- **[NEW]** `jhe-portfolio-system/backend/.env.example`
- **[NEW]** `jhe-portfolio-system/backend/package.json`
- **[NEW]** `jhe-portfolio-system/backend/server.js`

### Frontend
Estrutura inicial React/Vite com centralização de estilos.
- **[NEW]** `jhe-portfolio-system/frontend/src/components/Button.jsx`
- **[NEW]** `jhe-portfolio-system/frontend/src/components/Card.jsx`
- **[NEW]** `jhe-portfolio-system/frontend/src/components/Menu.jsx`
- **[NEW]** `jhe-portfolio-system/frontend/src/components/Modal.jsx`
- **[NEW]** `jhe-portfolio-system/frontend/src/components/Form.jsx`
- **[NEW]** `jhe-portfolio-system/frontend/src/components/Table.jsx`
- **[NEW]** `jhe-portfolio-system/frontend/src/pages/Home.jsx`
- **[NEW]** `jhe-portfolio-system/frontend/src/pages/DashboardMaster.jsx`
- **[NEW]** `jhe-portfolio-system/frontend/src/styles/global.css`: CSS global com variáveis de tema (Primary, Secondary, Accent, Shadow) e suporte a Dark/Light Mode.
- **[NEW]** `jhe-portfolio-system/frontend/src/App.jsx`
- **[NEW]** `jhe-portfolio-system/frontend/src/main.jsx`
- **[NEW]** `jhe-portfolio-system/frontend/package.json`
- **[NEW]** `jhe-portfolio-system/frontend/index.html`

## User Review Required
> [!IMPORTANT]
> Verifique se as versões do Node.js e ferramentas a serem descritas no `package.json` atendem às expectativas da sua infraestrutura atual, e se os nomes de tabelas no banco de dados estão alinhados aos padrões vigentes da JHE Consultores.

## Verification Plan
1. Após a aprovação, as pastas e arquivos serão gerados.
2. Confirmaremos que a estrutura reflete exatamente o esquema de diretórios especificado na solicitação.
