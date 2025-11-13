# 🔑 Configurar Chave OpenAI

## ⚠️ AÇÃO NECESSÁRIA

Você precisa adicionar sua **nova chave OpenAI** ao arquivo `.env` antes de rodar o projeto.

---

## 📝 Passo a Passo

### 1. Abra o Terminal no Mac

```bash
cd ~/Downloads/CalixFlow-gpts
```

### 2. Faça o Pull das Atualizações

```bash
git pull
```

### 3. Edite o Arquivo .env

```bash
nano .env
```

### 4. Substitua o Placeholder

Encontre esta linha:
```
VITE_OPENAI_API_KEY=sua-nova-chave-openai-aqui
```

Substitua por:
```
VITE_OPENAI_API_KEY=sk-proj-SUA-CHAVE-AQUI
```

**Cole a nova chave que você criou!**

### 5. Salve o Arquivo

- `Ctrl + O` → `Enter`
- `Ctrl + X`

### 6. Rode o Projeto

```bash
pnpm dev
```

### 7. Acesse no Navegador

http://localhost:3000

---

## ✅ Firebase Já Está Configurado!

As credenciais do Firebase já foram adicionadas ao `.env`:

- ✅ API Key
- ✅ Auth Domain
- ✅ Project ID
- ✅ Storage Bucket
- ✅ Messaging Sender ID
- ✅ App ID

**Você só precisa adicionar a chave OpenAI!**

---

## 🧪 Testar

1. Abra o console do navegador (`Cmd + Option + I`)
2. Clique em "Checagem de Documentos"
3. Faça upload de 2 arquivos
4. Veja a mágica acontecer! ✨

---

## 🆘 Se Tiver Problemas

**Erro: "OpenAI API key not found"**
- Verifique se adicionou a chave no `.env`
- Reinicie o servidor (`Ctrl+C` e `pnpm dev`)

**Erro: "Firebase configuration error"**
- Me avise que eu verifico as credenciais

**Tela em branco:**
- Abra o console (`Cmd + Option + I`)
- Me mande o erro que aparece

---

## 📸 Quando Funcionar

Me manda um print! Quero ver funcionando! 🚀
