# ✅ Checklist para Testar o CalixFlow

## 📋 Passo a Passo Rápido

### 1️⃣ Atualizar o Projeto

```bash
cd ~/Downloads/CalixFlow-gpts
git pull
```

**Você deve ver:**
- ✅ `CONFIGURAR_OPENAI.md` (novo)
- ✅ `RELATORIO_TESTES.md` (novo)
- ✅ `.env` (atualizado)

---

### 2️⃣ Adicionar Chave OpenAI

```bash
nano .env
```

**Encontre esta linha:**
```
VITE_OPENAI_API_KEY=sua-nova-chave-openai-aqui
```

**Substitua por sua nova chave:**
```
VITE_OPENAI_API_KEY=sk-proj-SUA-CHAVE-AQUI
```

**Salvar:**
- `Ctrl + O` → `Enter`
- `Ctrl + X`

---

### 3️⃣ Rodar o Projeto

```bash
pnpm dev
```

**Deve abrir automaticamente:** http://localhost:3000

---

### 4️⃣ Testar Login

**Credenciais de teste:**
- Email: `usuario@calix.com`
- Senha: `calix2025`

**Você deve ver:**
- ✅ Tela de login bonita com logo Calix
- ✅ Após login, sidebar com menu

---

### 5️⃣ Testar Checagem de Documentos

1. **Clique em "Checagem de Documentos"** no menu
2. **Faça upload de 2 arquivos de texto**
3. **Clique em "Iniciar Checagem"**
4. **Aguarde a análise**

**Você deve ver:**
- ✅ Barra de progresso
- ✅ Análise com IA
- ✅ Comparação de campos
- ✅ Status (aprovado/rejeitado/warning)

---

### 6️⃣ Verificar Console

**Abrir DevTools:**
- `Cmd + Option + I` (Mac)
- Ir na aba "Console"

**Verificar:**
- ✅ Sem erros vermelhos do Firebase
- ✅ Logs de "Cliente criado", "Login realizado", etc.

---

## 🎯 O Que Testar

### ✅ Deve Funcionar

- [ ] Login com credenciais corretas
- [ ] Erro ao usar credenciais erradas
- [ ] Upload de documentos (PDF, TXT, imagens)
- [ ] Análise de documentos com IA
- [ ] Navegação entre telas
- [ ] Responsividade (redimensionar janela)

### ❌ Ainda Não Funciona (Normal)

- [ ] Registro de novos usuários (Etapa 2)
- [ ] Chat com GPT (Etapa 3)
- [ ] Upload de documentos do cliente (Etapa 4)
- [ ] RAG/Busca vetorial (Etapa 5)

---

## 📸 Me Mande

Quando terminar de testar, me mande:

1. **Print da tela funcionando** ✅
2. **Se deu erro, qual foi?** ❌
3. **Console do navegador** (se tiver erros)

---

## 🆘 Problemas Comuns

### Erro: "OpenAI API key not found"

**Solução:**
1. Verifique se adicionou a chave no `.env`
2. Reinicie o servidor (`Ctrl+C` e `pnpm dev`)

### Erro: "Firebase configuration error"

**Solução:**
1. Verifique se fez `git pull`
2. Verifique se o `.env` tem as credenciais Firebase
3. Me mande o erro completo

### Tela em branco

**Solução:**
1. Abra o console (`Cmd + Option + I`)
2. Veja qual erro aparece
3. Me mande o erro

### Porta 3000 já em uso

**Solução:**
```bash
lsof -ti:3000 | xargs kill -9
pnpm dev
```

---

## 🎉 Tudo Funcionando?

**Próximos passos:**
1. Me avise que está tudo OK
2. Vou continuar com a Etapa 2 (AuthContext + UI)
3. Depois vem o chat com GPT!

---

**Boa sorte!** 🚀
