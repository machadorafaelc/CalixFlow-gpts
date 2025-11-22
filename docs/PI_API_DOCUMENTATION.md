# API de Integração de PIs - CalixFlow

## Visão Geral

Esta API permite que sistemas ERP externos enviem Planos de Inserção (PIs) para o CalixFlow de forma automatizada.

---

## Endpoint

```
POST https://us-central1-calix-flow-gpts.cloudfunctions.net/importPI
```

**Nota:** Este endpoint será criado como Cloud Function no Firebase.

---

## Autenticação

A API utiliza **API Key** para autenticação. Inclua o header:

```
Authorization: Bearer YOUR_API_KEY
```

---

## Formato da Requisição

### Headers

```
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY
```

### Body (JSON)

```json
{
  "agencyId": "string (required)",
  "clientId": "string (optional)",
  "pis": [
    {
      "numero": "string (required)",
      "cliente": "string (required)",
      "campanha": "string (required)",
      "meio": "TV | Rádio | Digital | Impresso | OOH | Cinema (required)",
      "veiculo": "string (required)",
      "responsavel": "string (optional)",
      "valor": "number (required)",
      "dataEntrada": "string (ISO 8601 date, required)",
      "prazo": "string (ISO 8601 date, required)",
      "erpId": "string (optional - ID no sistema ERP)",
      "metadata": "object (optional - dados adicionais)"
    }
  ]
}
```

### Exemplo de Requisição

```json
{
  "agencyId": "agency_123456",
  "clientId": "client_789",
  "pis": [
    {
      "numero": "60001",
      "cliente": "Banco da Amazônia",
      "campanha": "Campanha Institucional 2025",
      "meio": "TV",
      "veiculo": "Globo",
      "responsavel": "Ana Silva",
      "valor": 150000.00,
      "dataEntrada": "2025-11-21T00:00:00Z",
      "prazo": "2025-12-15T00:00:00Z",
      "erpId": "ERP-2025-001",
      "metadata": {
        "contrato": "CT-2025-456",
        "observacoes": "Campanha prioritária"
      }
    },
    {
      "numero": "60002",
      "cliente": "BRB",
      "campanha": "Natal 2025",
      "meio": "Digital",
      "veiculo": "Google Ads",
      "responsavel": "Carlos Mendes",
      "valor": 85000.00,
      "dataEntrada": "2025-11-21T00:00:00Z",
      "prazo": "2025-12-20T00:00:00Z",
      "erpId": "ERP-2025-002"
    }
  ]
}
```

---

## Resposta

### Sucesso (200 OK)

```json
{
  "success": true,
  "message": "PIs importados com sucesso",
  "result": {
    "total": 2,
    "imported": 2,
    "failed": 0,
    "errors": []
  },
  "piIds": [
    "pi_abc123",
    "pi_def456"
  ]
}
```

### Erro de Validação (400 Bad Request)

```json
{
  "success": false,
  "error": "Validation error",
  "details": [
    {
      "field": "pis[0].meio",
      "message": "Meio inválido. Valores aceitos: TV, Rádio, Digital, Impresso, OOH, Cinema"
    }
  ]
}
```

### Erro de Autenticação (401 Unauthorized)

```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "API Key inválida ou ausente"
}
```

### Erro Interno (500 Internal Server Error)

```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Erro ao processar requisição"
}
```

---

## Campos Obrigatórios

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `agencyId` | string | ID da agência no CalixFlow |
| `pis` | array | Lista de PIs a serem importados |
| `pis[].numero` | string | Número do PI |
| `pis[].cliente` | string | Nome do cliente |
| `pis[].campanha` | string | Nome da campanha |
| `pis[].meio` | string | Meio de comunicação (TV, Rádio, Digital, Impresso, OOH, Cinema) |
| `pis[].veiculo` | string | Nome do veículo |
| `pis[].valor` | number | Valor do PI em reais |
| `pis[].dataEntrada` | string | Data de entrada (ISO 8601) |
| `pis[].prazo` | string | Data de prazo (ISO 8601) |

---

## Campos Opcionais

| Campo | Tipo | Descrição | Padrão |
|-------|------|-----------|--------|
| `clientId` | string | ID do cliente/GPT no CalixFlow | null |
| `pis[].responsavel` | string | Nome do responsável | "Não atribuído" |
| `pis[].erpId` | string | ID do PI no sistema ERP | null |
| `pis[].metadata` | object | Dados adicionais do ERP | {} |

---

## Valores Aceitos para `meio`

- `TV`
- `Rádio`
- `Digital`
- `Impresso`
- `OOH` (Out of Home)
- `Cinema`

---

## Status Inicial dos PIs

Todos os PIs importados via API são criados com:

- **Status:** `checking_analise` (Checking: Em Análise)
- **Departamento:** `midia` (Mídia)
- **createdBy:** `api`

---

## Limites

- **Máximo de PIs por requisição:** 100
- **Taxa de requisições:** 60 requisições por minuto por API Key
- **Tamanho máximo do payload:** 1 MB

---

## Exemplo de Integração (Python)

```python
import requests
import json
from datetime import datetime, timedelta

API_URL = "https://us-central1-calix-flow-gpts.cloudfunctions.net/importPI"
API_KEY = "your_api_key_here"

def import_pis(agency_id, pis_data):
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    
    payload = {
        "agencyId": agency_id,
        "pis": pis_data
    }
    
    response = requests.post(API_URL, headers=headers, json=payload)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Sucesso: {result['result']['imported']} PIs importados")
        return result
    else:
        print(f"❌ Erro: {response.status_code}")
        print(response.json())
        return None

# Exemplo de uso
pis = [
    {
        "numero": "60001",
        "cliente": "Banco da Amazônia",
        "campanha": "Campanha Institucional 2025",
        "meio": "TV",
        "veiculo": "Globo",
        "responsavel": "Ana Silva",
        "valor": 150000.00,
        "dataEntrada": datetime.now().isoformat(),
        "prazo": (datetime.now() + timedelta(days=30)).isoformat(),
        "erpId": "ERP-2025-001"
    }
]

result = import_pis("agency_123456", pis)
```

---

## Exemplo de Integração (Node.js)

```javascript
const axios = require('axios');

const API_URL = 'https://us-central1-calix-flow-gpts.cloudfunctions.net/importPI';
const API_KEY = 'your_api_key_here';

async function importPIs(agencyId, pisData) {
  try {
    const response = await axios.post(
      API_URL,
      {
        agencyId,
        pis: pisData
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );
    
    console.log('✅ Sucesso:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
    return null;
  }
}

// Exemplo de uso
const pis = [
  {
    numero: '60001',
    cliente: 'Banco da Amazônia',
    campanha: 'Campanha Institucional 2025',
    meio: 'TV',
    veiculo: 'Globo',
    responsavel: 'Ana Silva',
    valor: 150000.00,
    dataEntrada: new Date().toISOString(),
    prazo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    erpId: 'ERP-2025-001'
  }
];

importPIs('agency_123456', pis);
```

---

## Webhook de Notificação (Futuro)

Em breve, o CalixFlow poderá enviar notificações via webhook quando:

- Um PI mudar de status
- Um PI mudar de departamento
- Um PI for faturado
- Um PI for cancelado

---

## Suporte

Para obter uma API Key ou reportar problemas:

- **Email:** suporte@calixflow.com
- **Documentação:** https://docs.calixflow.com

---

## Changelog

### v1.0.0 (2025-11-21)
- ✅ Endpoint inicial de importação de PIs
- ✅ Suporte a múltiplos PIs por requisição
- ✅ Validação de campos obrigatórios
- ✅ Autenticação via API Key
