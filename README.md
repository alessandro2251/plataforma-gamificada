## Português-BR

# 🎓 Plataforma de Estudos Gamificada (MVP)

> Protótipo de Alta Fidelidade desenvolvido como Trabalho de Conclusão de Curso (TCC) em Engenharia de Software.

Este projeto é uma plataforma educacional focada no engajamento de alunos através de técnicas de **Gamificação**. O sistema conta com painéis distintos para Alunos e Administradores, sistema de _Streak_ (ofensiva diária), desafios semanais e módulos de estudo dinâmicos com a temática visual _Vaporwave/Cyberpunk_.

## 🛠️ Tecnologias Utilizadas

O projeto foi construído utilizando as melhores práticas do ecossistema front-end atual:

- **React.js:** Biblioteca principal para construção da interface.
- **Tailwind CSS:** Framework utilitário para a estilização ágil e responsiva.
- **JSON Server:** Mock de backend para simular uma API REST de forma local.
- **React Hook Form:** Gerenciamento de formulários complexos.
- **Lucide React:** Biblioteca de ícones.

---

## ⚙️ Pré-requisitos

- [Node.js](https://nodejs.org/) (Versão 16 ou superior)
- Um terminal de comandos (Git Bash, CMD, PowerShell, etc.)

---

## 🚀 Como rodar o projeto localmente

OBS: dependendo de quando você esteja vendo esse repositório, o streak (sequência da ofensiva) do Victor (usuário que recomendo usar para testar a feature de desafio semanal) muito provavelmente terá quebrado e os desafios semanais também (pois ao virara semana de sábado para domingo, a contagem reseta e pede para que se conclua mais 5 desafios diários para liberar o desafio semanal).

Nesse caso, você precisa navegar até src/data/db.json e alterar a data de conclusão dos ultimos desafios concluídos pelo aluno-3 (Victor) dentro do array "completed_challenges", mais precisamente essa linha **"completionDate": "2026-05-16T16:54:05.103Z"** troque 2026-05-16 (que corresponde à data do ultimo desafio feito, o horário não é importante) pela sua data atual e dos desafios anteriores você deve subtrair os dias de acordo (você pode apenas alterar todos para sua data atual, mas isso pode causar um bug na interface de streak que à colocará sempre como 0), altere também "lastRewardClaimDate" para data atual (ou do dia anterior)

Siga o passo a passo abaixo ao clonar o repositório para executar a plataforma na sua máquina.

1. Instale as dependências

Com o Node.js instalado, abra o terminal na pasta raiz do projeto e execute o comando abaixo. Isso fará o download do React, Tailwind e todas as ferramentas necessárias automaticamente para dentro da pasta node_modules:

Bash

npm install

2. Inicie o Banco de Dados (Backend)

O projeto utiliza o json-server para simular o banco de dados. Você precisará abrir um terminal, garantir que está na pasta do projeto e rodar o comando:

Bash

npm run server

O servidor ficará rodando na porta http://localhost:3001.

3. Inicie a Aplicação (Frontend)

Abra uma nova aba no terminal (mantenha a aba do servidor rodando) e execute:

Bash

npm run dev

Acesse a aplicação no seu navegador padrão através do link fornecido no terminal (geralmente http://localhost:5173).
🔑 Contas de Teste

O banco de dados de teste (db.json) já vem pré-configurado com alguns usuários para facilitar a navegação nos diferentes painéis da plataforma:

Painel do Administrador (Gestão de Disciplinas e Desafios):

    E-mail: admin@admin

    Senha: 123

Painel do Aluno (Gamificação e Aulas):

    Usuários: ana@aluno, carlos@aluno ou victor@aluno (use victor@aluno para testar o desafio semanal)

    Senha: 123

🧠 Funcionalidades Principais

    Gamificação: Sistema de Streak (ofensivas) que reseta caso o aluno perca um dia de estudo.

    Desafios: Check-ins diários e auditoria de desafios semanais.

    Gestão (Admin): Criação e deleção lógica (Soft Delete) de módulos e aulas com atualização em cascata no banco de dados.

    Responsividade: Interface 100% adaptável para dispositivos móveis e desktops.

Desenvolvido para o TCC de Engenharia de Software de Alessandro Albino Guimarães Silva RU:4109432

## English

# 🎓 Gamified Study Platform (MVP)

> High-Fidelity Prototype developed as a Capstone Project (TCC) in Software Engineering.

This project is an educational platform focused on student engagement through **Gamification** techniques. The system features distinct dashboards for Students and Administrators, a _Streak_ system (daily streak), weekly challenges, and dynamic study modules with a _Vaporwave/Cyberpunk_ visual theme.

## 🛠️ Technologies Used

The project was built using best practices from the current front-end ecosystem:

- **React.js:** Main library for building the user interface.
- **Tailwind CSS:** Utility-first framework for agile and responsive styling.
- **JSON Server:** Backend mock to simulate a REST API locally.
- **React Hook Form:** Complex form management.
- **Lucide React:** Icon library.

---

## ⚙️ Prerequisites

- [Node.js](https://nodejs.org/) (Version 16 or higher)
- A command terminal (Git Bash, CMD, PowerShell, etc.)

---

## 🚀 How to run the project locally

NOTE: Depending on when you are viewing this repository, Victor's streak (the user recommended to test the weekly challenge feature) will most likely have broken, and the weekly challenges as well. This happens because when the week transitions from Saturday to Sunday, the count resets, requiring the user to complete 5 more daily challenges to unlock the weekly challenge.

In this case, you will need to navigate to src/data/db.json and change the completion date of the latest challenges completed by aluno-3 (Victor) inside the "completed_challenges" array. More precisely, locate this line: "completionDate": "2026-05-16T16:54:05.103Z" and replace 2026-05-16 (which corresponds to the date of the last completed challenge; the time is not important) with your current date. For the previous challenges, you should subtract the days accordingly (you could just change all of them to your current date, but this might cause a bug in the streak interface, setting it to 0). Also, update the "lastRewardClaimDate" to your current date (or the previous day).

Follow the step-by-step guide below to clone and run the platform on your machine.

**1. Install the dependencies**

With Node.js installed, open the terminal in the project's root folder and run the command below. This will automatically download React, Tailwind, and all necessary tools into the `node_modules` folder:

```bash
npm install

```

**2. Start the Database (Backend)**

The project uses `json-server` to simulate the database. You will need to open a terminal, ensure you are in the project folder, and run the command:

```bash
npm run server

```

The server will be running on port `http://localhost:3001`.

**3. Start the Application (Frontend)**

Open a new tab in the terminal (keep the server tab running) and execute:

```bash
npm run dev

```

Access the application in your default browser using the link provided in the terminal (usually `http://localhost:5173`).

---

## 🔑 Test Accounts

The test database (`db.json`) comes pre-configured with some users to facilitate navigation across the platform's different dashboards:

**Administrator Dashboard (Subject and Challenge Management):**

- **E-mail:** `admin@admin`
- **Password:** `123`

**Student Dashboard (Gamification and Classes):**

- **E-mail:** `carlos@aluno` (or `ana@aluno`)
- **Password:** `123`

---

## 🧠 Main Features

- **Gamification:** Streak system that resets if the student misses a study day.
- **Challenges:** Daily check-ins and weekly challenge auditing (Review Mode locked).
- **Management (Admin):** Creation and logical deletion (Soft Delete) of modules and classes with cascading updates in the database.
- **Responsiveness:** 100% adaptable interface for mobile devices and desktops.

---

Developed for the Software Engineering Capstone Project by Alessandro Albino Guimarães Silva, RU: 4109432
