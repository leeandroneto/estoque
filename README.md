# Controle de Estoque - StatuS Distribuidora

Sistema interno para controle de entrada de mercadorias (produtos prontos) da StatuS Distribuidora de Alimentos.

## 📋 Sobre o Projeto

Este projeto é uma Web App desenvolvida com foco em dispositivos móveis ("Mobile First") para facilitar o lançamento de entradas de estoque pelos funcionários no galpão. O sistema utiliza uma planilha do Google Sheets como banco de dados.

## 🚀 Funcionalidades

- **Registro de Entrada:** Formulário simples para lançar responsável, produto e quantidade.
- **Busca Inteligente:** Campo de produto com autocomplete para facilitar a seleção.
- **Histórico em Tempo Real:** Visualização dos últimos lançamentos na tela inicial.
- **Histórico Completo:** Modal para visualização de todos os registros com status (Pendente/Lançado).
- **Feedback Visual:** Mensagens de sucesso/erro (Toasts) e indicadores de carregamento.

## 🛠️ Tecnologias Utilizadas

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla).
- **Backend:** Google Apps Script (API REST).
- **Banco de Dados:** Google Sheets.

## 📦 Como Configurar

1. **Backend (Google Sheets + Apps Script):**
   - Crie uma planilha com as abas `Produtos` e `Lancamentos`.
   - Implemente o código do backend no editor de script da planilha.
   - Faça o deploy como "Web App" com permissão de acesso para "Qualquer pessoa".

2. **Frontend:**
   - Clone este repositório.
   - No arquivo `script.js`, atualize a constante `API_URL` com o link do seu Web App gerado no passo anterior.
   - Hospede os arquivos (`index.html`, `style.css`, `script.js`) em qualquer serviço de hospedagem estática (ex: Vercel, GitHub Pages).

## 📱 Uso

Acesse o link da aplicação pelo navegador do celular. Selecione seu nome, busque o produto digitando parte do nome, insira a quantidade e confirme.