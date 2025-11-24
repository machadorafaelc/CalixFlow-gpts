# Sistema de Times e Clientes - CalixFlow

## 📋 Visão Geral

Sistema modular de **Times por Cliente e Departamento** que permite alocação flexível de colaboradores em múltiplos times com 4 cargos hierárquicos.

---

## 🏗️ Arquitetura

```
AGÊNCIA
  └── CLIENTES
       ├── Cliente A (Banco da Amazônia)
       │    ├── TIME DE MÍDIA
       │    │    ├── Gerente: João Silva
       │    │    ├── Supervisor: Maria Santos
       │    │    ├── Coordenador: Pedro Oliveira
       │    │    └── Analista: Ana Costa
       │    │
       │    ├── TIME DE CHECKING
       │    │    ├── Gerente: Carlos Mendes
       │    │    ├── Supervisor: Fernanda Lima
       │    │    └── Analista: Paulo Souza
       │    │
       │    └── TIME DE FINANCEIRO
       │         ├── Gerente: Roberto Alves
       │         └── Coordenador: Julia Rocha
       │
       └── Cliente B (BRB)
            ├── TIME DE MÍDIA
            │    ├── Gerente: João Silva (MESMO do Cliente A!)
            │    └── Analista: Lucas Pereira (DIFERENTE)
            │
            ├── TIME DE CHECKING
            │    └── (USA O MESMO TIME do Cliente A!)
            │
            └── TIME DE FINANCEIRO
                 └── Gerente: Mariana Costa (DIFERENTE)
```

---

## 📊 Estrutura de Dados

### **Client (Cliente)**

```typescript
interface Client {
  id: string;
  agencyId: string;          // Agência dona do cliente
  name: string;              // Nome do cliente
  description?: string;
  logo?: string;
  status: 'active' | 'inactive';
  createdAt: Timestamp;
  createdBy: string;
  updatedAt: Timestamp;
  piCount: number;           // Número de PIs do cliente
}
```

### **Team (Time)**

```typescript
interface Team {
  id: string;
  agencyId: string;          // Agência
  clientId: string;          // Cliente associado
  department: Department;    // 'midia' | 'checking' | 'financeiro'
  
  // Membros do time por cargo
  members: {
    gerente: string[];       // UIDs dos gerentes
    supervisor: string[];    // UIDs dos supervisores
    coordenador: string[];   // UIDs dos coordenadores
    analista: string[];      // UIDs dos analistas
  };
  
  createdAt: Timestamp;
  createdBy: string;
  updatedAt: Timestamp;
}
```

### **TeamMember (Membro de Time)**

```typescript
interface TeamMember {
  userId: string;
  teamId: string;
  clientId: string;
  department: Department;
  role: TeamRole;            // 'gerente' | 'supervisor' | 'coordenador' | 'analista'
  addedAt: Timestamp;
  addedBy: string;
}
```

---

## 🎯 Conceitos-Chave

### **1. Modularidade Total**

- ✅ Um colaborador pode estar em **VÁRIOS times**
- ✅ Times podem ser **compartilhados entre clientes**
- ✅ Times podem ser **únicos por cliente**

**Exemplo:**
```
João Silva (Gerente):
  - Time de Mídia do Banco da Amazônia
  - Time de Mídia do BRB
  - Time de Mídia do Governo de Minas
```

### **2. Hierarquia de Cargos**

```
1. Gerente      (Mais alto)
2. Supervisor
3. Coordenador
4. Analista     (Mais baixo)
```

### **3. Departamentos**

```
- Mídia       (Criação e planejamento)
- Checking    (Verificação e conformidade)
- Financeiro  (Faturamento e pagamentos)
```

---

## 🛠️ Serviços Implementados

### **ClientService**

```typescript
// Criar cliente
await ClientService.createClient({
  agencyId: 'agency123',
  name: 'Banco da Amazônia',
  description: 'Cliente bancário',
  logo: 'https://...',
  createdBy: 'user123'
});

// Listar clientes da agência
const clients = await ClientService.listClients('agency123');

// Atualizar cliente
await ClientService.updateClient('client123', {
  name: 'Novo Nome',
  status: 'inactive'
});

// Incrementar contador de PIs
await ClientService.incrementPICount('client123', 1);
```

### **TeamService**

```typescript
// Criar time
const teamId = await TeamService.createTeam({
  agencyId: 'agency123',
  clientId: 'client123',
  department: 'midia',
  createdBy: 'user123'
});

// Adicionar membro ao time
await TeamService.addMember(
  teamId,
  'user456',      // userId
  'gerente',      // role
  'user123'       // addedBy
);

// Remover membro do time
await TeamService.removeMember(teamId, 'user456', 'gerente');

// Listar times de um cliente
const teams = await TeamService.listTeamsByClient('client123');

// Buscar time específico
const team = await TeamService.getTeamByClientAndDepartment(
  'client123',
  'midia'
);

// Verificar se usuário está no time
const isInTeam = await TeamService.isUserInTeam(teamId, 'user456');

// Obter cargo do usuário no time
const role = await TeamService.getUserRoleInTeam(teamId, 'user456');

// Copiar time para outro cliente
const newTeamId = await TeamService.copyTeam(
  sourceTeamId,
  targetClientId,
  'user123'
);
```

---

## 🎨 Interfaces Implementadas

### **ClientManagementView**

✅ **Funcionalidades:**
- Listar todos os clientes da agência
- Criar novo cliente
- Editar cliente existente
- Deletar cliente
- Ver contador de PIs por cliente
- Upload de logo

✅ **Acesso:**
- `super_admin`: Acesso total
- `agency_admin`: Acesso aos clientes da sua agência

---

## 📍 Integração com Pauta de PIs

### **Como funciona:**

1. **Cliente** tem **Times** (Mídia, Checking, Financeiro)
2. **PI** é atribuído a um **Cliente**
3. **PI** passa por **3 departamentos** (workflow)
4. Em cada departamento, os **membros do time** trabalham no PI
5. **Responsável** do PI é um membro do time

### **Exemplo de Workflow:**

```
PI #61086 - Banco da Amazônia
  ↓
1. MÍDIA (Time de Mídia do Banco)
   Responsável: João Silva (Gerente)
   Status: "Mídia: Em Criação"
  ↓
2. CHECKING (Time de Checking do Banco)
   Responsável: Fernanda Lima (Supervisor)
   Status: "Checking: Em Análise"
  ↓
3. FINANCEIRO (Time de Financeiro do Banco)
   Responsável: Roberto Alves (Gerente)
   Status: "Financeiro: Aguardando Pagamento"
```

---

## 🔄 Próximos Passos

### **Fase 4: View de Gerenciamento de Times**

Criar interface para:
- ✅ Ver times de cada cliente
- ✅ Adicionar/remover membros
- ✅ Definir cargos
- ✅ Copiar times entre clientes

### **Fase 5: Integração com Pauta de PIs**

- ✅ Filtrar PIs por cliente
- ✅ Atribuir responsável do time
- ✅ Workflow por departamento
- ✅ Notificações para membros do time

---

## 📦 Arquivos Criados

```
src/types/firestore.ts (MODIFICADO)
  ├── Client
  ├── Team
  ├── TeamMember
  ├── TeamRole
  └── Department

src/services/clientService.ts (NOVO)
  └── CRUD completo de clientes

src/services/teamService.ts (NOVO)
  └── Gerenciamento completo de times

src/views/ClientManagementView.tsx (NOVO)
  └── Interface de gerenciamento de clientes

src/components/Sidebar.tsx (MODIFICADO)
  └── Adicionado menu "Gerenciar Clientes"

src/App.tsx (MODIFICADO)
  └── Adicionada rota de clientes
```

---

## ✅ Status

- ✅ **Estrutura de dados:** Completa
- ✅ **ClientService:** Completo
- ✅ **TeamService:** Completo
- ✅ **ClientManagementView:** Completa
- ⏭️ **TeamManagementView:** Pendente
- ⏭️ **Integração com PIs:** Pendente

---

## 🌐 Deploy

**Status:** ✅ READY (Production)  
**URL:** https://calix-flow-gpts.vercel.app  
**Versão:** 5.2.0 (Times e Clientes)

---

## 🎓 Benefícios

### **Flexibilidade Total**
- Colaborador pode estar em múltiplos times
- Times podem ser compartilhados
- Fácil reorganização

### **Hierarquia Clara**
- 4 níveis de cargo
- Responsabilidades definidas
- Escalabilidade

### **Isolamento por Cliente**
- Cada cliente tem seus times
- Dados isolados
- Multi-tenant completo

---

**Sistema de Times e Clientes implementado com sucesso!** 🎉
