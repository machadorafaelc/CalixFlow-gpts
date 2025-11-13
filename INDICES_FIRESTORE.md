# Índices Necessários no Firestore

Para o CalixFlow funcionar corretamente, você precisa criar os seguintes índices compostos no Firestore:

## 1. Índice para Mensagens
**Coleção:** `messages`
**Campos:**
- `conversationId` (Ascending)
- `createdAt` (Ascending)
- `__name__` (Ascending)

**Link direto:**
https://console.firebase.google.com/v1/r/project/calixflow-70215/firestore/indexes?create_composite=ClBwcm9qZWN0cy9jYWxpeGZsb3ctNzAyMTUvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL21lc3NhZ2VzL2luZGV4ZXMvXxABGhIKDmNvbnZlcnNhdGlvbklkEAEaDQoJY3JlYXRlZEF0EAEaDAoIX19uYW1lX18QAQ

---

## 2. Índice para Conversas (por cliente e usuário)
**Coleção:** `conversations`
**Campos:**
- `clientId` (Ascending)
- `userId` (Ascending)
- `updatedAt` (Descending)
- `__name__` (Descending)

**Como criar:**
1. Acesse: https://console.firebase.google.com/project/calixflow-70215/firestore/indexes
2. Clique em "Create Index"
3. Collection ID: `conversations`
4. Adicione os campos na ordem acima
5. Clique em "Create"

---

## 3. Índice para Conversas (apenas por cliente) - OPCIONAL
**Coleção:** `conversations`
**Campos:**
- `clientId` (Ascending)
- `updatedAt` (Descending)
- `__name__` (Descending)

**Link direto:**
https://console.firebase.google.com/v1/r/project/calixflow-70215/firestore/indexes?create_composite=ClVwcm9qZWN0cy9jYWxpeGZsb3ctNzAyMTUvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2NvbnZlcnNhdGlvbnMvaW5kZXhlcy9fEAEaDAoIY2xpZW50SWQQARoNCgl1cGRhdGVkQXQQAhoMCghfX25hbWVfXxAC

---

## Status dos Índices

- [x] Índice 1 (Mensagens) - Criado
- [ ] Índice 2 (Conversas por cliente e usuário) - **PENDENTE**
- [x] Índice 3 (Conversas por cliente) - Criado

---

## Como Verificar se os Índices Foram Criados

1. Acesse: https://console.firebase.google.com/project/calixflow-70215/firestore/indexes
2. Veja a lista de índices compostos
3. Aguarde o status mudar de "Building" para "Enabled" (pode levar 2-5 minutos)

---

## Tempo de Criação

- Índices pequenos: ~2 minutos
- Índices médios: ~5 minutos
- Índices grandes: ~10-15 minutos

**Nota:** O sistema vai mostrar erros até os índices serem criados. Isso é normal!
