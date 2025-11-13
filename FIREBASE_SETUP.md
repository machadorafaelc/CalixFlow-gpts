# 🔥 Configuração do Firebase

Este guia te ajuda a configurar o Firebase para o CalixFlow-gpts.

---

## 📋 Pré-requisitos

- Conta Google
- Projeto criado no [Firebase Console](https://console.firebase.google.com/)

---

## 🚀 Passo a Passo

### 1. Criar Projeto no Firebase

1. Acesse: https://console.firebase.google.com/
2. Clique em **"Adicionar projeto"**
3. Nome do projeto: `CalixFlow` (ou o que preferir)
4. Desabilite Google Analytics (não é necessário)
5. Clique em **"Criar projeto"**

### 2. Ativar Autenticação

1. No menu lateral, clique em **"Authentication"**
2. Clique em **"Começar"**
3. Aba **"Sign-in method"**
4. Clique em **"Email/Password"**
5. **Ative** a opção "Email/Password"
6. Clique em **"Salvar"**

### 3. Criar Banco de Dados (Firestore)

1. No menu lateral, clique em **"Firestore Database"**
2. Clique em **"Criar banco de dados"**
3. Selecione **"Iniciar no modo de produção"**
4. Escolha a localização: **`southamerica-east1` (São Paulo)**
5. Clique em **"Ativar"**

### 4. Configurar Regras do Firestore

1. Vá em **"Regras"**
2. Cole as seguintes regras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários podem ler e escrever seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Clientes: todos autenticados podem ler, apenas admins podem escrever
    match /clients/{clientId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Conversas: apenas o dono pode ler/escrever
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Mensagens: apenas o dono da conversa pode ler/escrever
    match /conversations/{conversationId}/messages/{messageId} {
      allow read, write: if request.auth != null && get(/databases/$(database)/documents/conversations/$(conversationId)).data.userId == request.auth.uid;
    }
    
    // Documentos: todos autenticados podem ler, apenas admins podem escrever
    match /documents/{documentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

3. Clique em **"Publicar"**

### 5. Criar Storage

1. No menu lateral, clique em **"Storage"**
2. Clique em **"Começar"**
3. Clique em **"Avançar"** (regras padrão)
4. Escolha a localização: **`southamerica-east1` (São Paulo)**
5. Clique em **"Concluir"**

### 6. Configurar Regras do Storage

1. Vá em **"Regras"**
2. Cole as seguintes regras:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Documentos dos clientes: apenas admins podem fazer upload
    match /clients/{clientId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Uploads temporários de conversas
    match /temp/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Clique em **"Publicar"**

### 7. Obter Credenciais

1. No menu lateral, clique no **ícone de engrenagem** ⚙️ → **"Configurações do projeto"**
2. Role até **"Seus aplicativos"**
3. Clique no ícone **"Web"** `</>`
4. Apelido do app: `CalixFlow Web`
5. **NÃO** marque Firebase Hosting
6. Clique em **"Registrar app"**
7. Copie as credenciais que aparecem:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "calixflow-xxxxx.firebaseapp.com",
  projectId: "calixflow-xxxxx",
  storageBucket: "calixflow-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

### 8. Configurar Variáveis de Ambiente

1. No projeto, copie `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edite `.env` e adicione as credenciais:
   ```bash
   nano .env
   ```

3. Cole as credenciais do Firebase:
   ```
   VITE_FIREBASE_API_KEY=AIza...
   VITE_FIREBASE_AUTH_DOMAIN=calixflow-xxxxx.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=calixflow-xxxxx
   VITE_FIREBASE_STORAGE_BUCKET=calixflow-xxxxx.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
   ```

4. Salve: `Ctrl+O` → `Enter` → `Ctrl+X`

---

## ✅ Verificar Configuração

Rode o projeto:
```bash
pnpm dev
```

Se não aparecer erros no console relacionados ao Firebase, está tudo certo! 🎉

---

## 👤 Criar Primeiro Usuário Admin

1. Acesse o sistema e registre-se
2. Vá no Firebase Console → Authentication → Users
3. Copie o UID do usuário
4. Vá em Firestore Database
5. Abra a coleção `users`
6. Clique no documento do seu usuário
7. Edite o campo `role` de `user` para `admin`
8. Salve

Pronto! Agora você é admin e pode gerenciar clientes e documentos! 🎯

---

## 💰 Custos

**Plano Spark (Grátis):**
- ✅ 50.000 leituras/dia
- ✅ 20.000 escritas/dia
- ✅ 1 GB de storage
- ✅ 10 GB de transferência/mês

**Para 40 usuários:**
- Estimativa: **$0/mês** (dentro do free tier)

Se ultrapassar, o Firebase para de funcionar até você ativar billing.

---

## 🆘 Problemas Comuns

### Erro: "Firebase: Error (auth/configuration-not-found)"
- Verifique se as variáveis de ambiente estão corretas no `.env`
- Reinicie o servidor (`Ctrl+C` e `pnpm dev`)

### Erro: "Missing or insufficient permissions"
- Verifique as regras do Firestore/Storage
- Certifique-se de estar autenticado

### Erro: "CORS"
- Adicione seu domínio em Authentication → Settings → Authorized domains

---

## 📚 Próximos Passos

Após configurar o Firebase:
1. ✅ Criar primeiro usuário
2. ✅ Tornar usuário admin
3. ✅ Adicionar clientes
4. ✅ Fazer upload de documentos
5. ✅ Testar chat com GPT

---

**Firebase configurado com sucesso!** 🔥
