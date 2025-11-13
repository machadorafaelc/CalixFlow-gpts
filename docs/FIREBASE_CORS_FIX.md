# Como Corrigir Erro de CORS no Firebase Storage

## 🐛 Problema

Erro ao fazer upload de anexos no chat:
```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/...' 
has been blocked by CORS policy
```

## ✅ Solução

Você precisa configurar CORS no Firebase Storage para permitir uploads do domínio Vercel.

---

## 📋 Opção 1: Via Google Cloud Console (Mais Fácil)

### 1. Acessar Google Cloud Console
- Acesse: https://console.cloud.google.com/
- Selecione o projeto: `calixflow-70215`

### 2. Abrir Cloud Storage
- No menu lateral, vá em: **Storage** > **Browser**
- Você verá o bucket: `calixflow-70215.firebasestorage.app`

### 3. Configurar CORS
- Clique nos **3 pontinhos (⋮)** ao lado do bucket
- Selecione **"Edit bucket permissions"** ou **"Configurações"**
- Procure por **"CORS configuration"**
- Cole esta configuração:

```json
[
  {
    "origin": ["*"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization", "Content-Length", "User-Agent", "X-Requested-With"]
  }
]
```

- Clique em **"Save"** ou **"Salvar"**

---

## 📋 Opção 2: Via Google Cloud Shell (Mais Rápido)

### 1. Abrir Cloud Shell
- Acesse: https://console.cloud.google.com/
- Clique no ícone **">_"** no canto superior direito
- Aguarde o terminal abrir

### 2. Criar arquivo CORS
```bash
cat > cors.json << 'EOF'
[
  {
    "origin": ["*"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization", "Content-Length", "User-Agent", "X-Requested-With"]
  }
]
EOF
```

### 3. Aplicar CORS ao bucket
```bash
gcloud storage buckets update gs://calixflow-70215.firebasestorage.app --cors-file=cors.json
```

### 4. Verificar
```bash
gcloud storage buckets describe gs://calixflow-70215.firebasestorage.app --format="default(cors_config)"
```

---

## 🔒 Opção 3: CORS Mais Restritivo (Produção)

Se quiser permitir apenas o domínio Vercel (mais seguro):

```json
[
  {
    "origin": [
      "https://calix-flow-gpts.vercel.app",
      "http://localhost:5173",
      "http://localhost:3000"
    ],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization", "Content-Length", "User-Agent", "X-Requested-With"]
  }
]
```

---

## ✅ Testar

Depois de aplicar CORS:

1. Acesse: https://calix-flow-gpts.vercel.app/
2. Login: `teste@manus.ai` / `teste123456`
3. Abra "GPT do BRB"
4. Clique em 📎
5. Selecione um arquivo
6. Envie
7. **Deve funcionar sem erro de CORS!**

---

## 📚 Referências

- [Firebase Storage CORS](https://firebase.google.com/docs/storage/web/download-files#cors_configuration)
- [Google Cloud Storage CORS](https://cloud.google.com/storage/docs/configuring-cors)
