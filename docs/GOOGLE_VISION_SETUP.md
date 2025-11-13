# Como Configurar Google Cloud Vision API

Este guia explica como obter uma chave de API do Google Cloud Vision para habilitar OCR (reconhecimento de texto) em documentos escaneados.

## 📋 Pré-requisitos

- Conta Google (Gmail)
- Navegador web

## 🚀 Passo a Passo

### 1. Acessar Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Faça login com sua conta Google
3. Aceite os termos de serviço se solicitado

### 2. Criar um Projeto

1. No topo da página, clique em **"Select a project"** (Selecionar projeto)
2. Clique em **"NEW PROJECT"** (Novo projeto)
3. Nome do projeto: `CalixFlow` (ou qualquer nome)
4. Clique em **"CREATE"** (Criar)
5. Aguarde alguns segundos até o projeto ser criado

### 3. Ativar a API do Cloud Vision

1. No menu lateral, vá em **"APIs & Services"** > **"Library"**
   - Ou acesse: https://console.cloud.google.com/apis/library
2. Na busca, digite: `Cloud Vision API`
3. Clique em **"Cloud Vision API"**
4. Clique em **"ENABLE"** (Ativar)
5. Aguarde a ativação (alguns segundos)

### 4. Criar Chave de API

1. No menu lateral, vá em **"APIs & Services"** > **"Credentials"**
   - Ou acesse: https://console.cloud.google.com/apis/credentials
2. Clique em **"+ CREATE CREDENTIALS"** (Criar credenciais)
3. Selecione **"API key"** (Chave de API)
4. Uma chave será gerada automaticamente
5. **COPIE A CHAVE** (algo como: `AIzaSyD...`)
6. (Opcional) Clique em **"RESTRICT KEY"** para adicionar restrições de segurança:
   - Em "API restrictions", selecione "Restrict key"
   - Marque apenas "Cloud Vision API"
   - Clique em "SAVE"

### 5. Configurar no CalixFlow

#### Opção A: Vercel (Produção)

1. Acesse: https://vercel.com/
2. Vá no seu projeto CalixFlow
3. Settings > Environment Variables
4. Adicione:
   - **Name:** `VITE_GOOGLE_VISION_API_KEY`
   - **Value:** Cole a chave copiada
   - **Environment:** Production, Preview, Development
5. Clique em "Save"
6. Faça um novo deploy (ou aguarde o próximo)

#### Opção B: Local (Desenvolvimento)

1. Abra o arquivo `.env` na raiz do projeto
2. Adicione a linha:
   ```
   VITE_GOOGLE_VISION_API_KEY=AIzaSyD...sua-chave-aqui
   ```
3. Salve o arquivo
4. Reinicie o servidor de desenvolvimento

## ✅ Testar

1. Acesse o CalixFlow
2. Vá em "Checagem de Documentos"
3. Faça upload de um PDF escaneado
4. Clique em "Iniciar Checagem"
5. Abra o Console (F12) e veja os logs:
   ```
   🔍 Tentando extrair texto com OCR...
   ✅ Texto extraído via OCR com sucesso!
   ```

## 💰 Custos

### Tier Gratuito (Sempre Grátis)
- **1.000 páginas por mês** - GRÁTIS
- Sem necessidade de cartão de crédito
- Renovado mensalmente

### Após o Tier Gratuito
- **$1.50 por 1.000 páginas**
- Exemplo: 5.000 páginas/mês = $6/mês
- Você só paga se ultrapassar 1.000 páginas

## 🔒 Segurança

### Boas Práticas:

1. **Nunca commite a chave no Git**
   - O arquivo `.env` já está no `.gitignore`
   
2. **Use restrições de API**
   - Restrinja a chave apenas para Cloud Vision API
   
3. **Monitore o uso**
   - Acesse: https://console.cloud.google.com/apis/dashboard
   - Veja quantas requisições foram feitas

4. **Rotacione a chave periodicamente**
   - Crie uma nova chave a cada 3-6 meses
   - Delete as chaves antigas

## ❓ Problemas Comuns

### "API key not valid"
- Verifique se copiou a chave completa
- Confirme que a Cloud Vision API está ativada
- Aguarde alguns minutos após criar a chave

### "Quota exceeded"
- Você ultrapassou 1.000 páginas no mês
- Aguarde o próximo mês ou adicione billing

### "Permission denied"
- Certifique-se de que o projeto está selecionado
- Verifique se você é owner/editor do projeto

## 📚 Documentação Oficial

- Google Cloud Vision: https://cloud.google.com/vision/docs
- Pricing: https://cloud.google.com/vision/pricing
- API Reference: https://cloud.google.com/vision/docs/reference/rest

## 🆘 Suporte

Se tiver problemas, abra uma issue no GitHub ou entre em contato com o suporte.
