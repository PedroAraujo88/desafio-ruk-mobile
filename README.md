# 📱 DESAFIO RUK - APP MOBILE

Este repositório contém o aplicativo mobile desenvolvido com React Native (Expo) e Apollo Client. Ele implementa os fluxos de Login e visualização do Cartão de Identificação.

## 🛠️ Tecnologias Utilizadas

-   **Framework:** React Native (Expo)
-   **Gerenciamento de Estado/API:** Apollo Client
-   **Estilização:** Estilos inline (para máxima compatibilidade e evitar erros de Metro Bundler).

## ⚠️ Configuração de Rede Essencial

O aplicativo mobile deve se conectar ao seu Backend na rede local.

1.  **Obtenha seu IP:** Descubra o IP de rede da sua máquina (ex: `192.168.1.10`).
2.  **Ajuste o IP:** Abra o arquivo **`App.js`** e substitua a variável `YOUR_IP` pela sua URL de rede.
    ```javascript
    // app/App.js - Linha 19
    const YOUR_IP = 'SEU_IP_DE_REDE'; 
    ```

## ⚙️ Como Iniciar o App Mobile

### Pré-requisitos

1.  O serviço **Backend API** deve estar rodando em `http://SEU_IP_DE_REDE:3000`.
2.  Instalação global do `expo-cli`.

### Passos de Execução

1.  **Navegue** para a pasta raiz deste repositório.
2.  **Instale as dependências:**
    ```bash
    npm install
    ```
3.  **Inicie o servidor do Expo:**
    ```bash
    npx expo start
    ```
4.  **Teste:** Pressione `w` no terminal para abrir o aplicativo no navegador (Web) ou utilize o aplicativo Expo Go no seu celular.

---
## 🔑 Credenciais de Teste

| Email | Senha |
| `teste8@desafio.com` | `SenhaSegura123` |
