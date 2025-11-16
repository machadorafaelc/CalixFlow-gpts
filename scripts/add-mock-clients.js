/**
 * Script para adicionar clientes mock no Firestore
 * 
 * Uso: node scripts/add-mock-clients.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

// Configuração do Firebase (mesma do projeto)
const firebaseConfig = {
  apiKey: "AIzaSyBKfxoLHSZqEK0jP5rMUQqO6Jt_3v7QQYY",
  authDomain: "calixflow-70215.firebaseapp.com",
  projectId: "calixflow-70215",
  storageBucket: "calixflow-70215.firebasestorage.app",
  messagingSenderId: "1063976398752",
  appId: "1:1063976398752:web:8a0f3d8e9f0b1c2d3e4f5g"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Clientes mock
const mockClients = [
  {
    name: 'Ministério dos Transportes',
    description: 'Órgão federal responsável pela política nacional de transportes',
    createdBy: 'mock',
    documentCount: 0,
    conversationCount: 0
  },
  {
    name: 'Governo de Minas Gerais',
    description: 'Governo do Estado de Minas Gerais',
    createdBy: 'mock',
    documentCount: 0,
    conversationCount: 0
  },
  {
    name: 'Banco da Amazônia',
    description: 'Instituição financeira pública federal',
    createdBy: 'mock',
    documentCount: 0,
    conversationCount: 0
  }
];

async function addMockClients() {
  console.log('🚀 Iniciando criação de clientes mock...\n');

  for (const client of mockClients) {
    try {
      const clientData = {
        ...client,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'clients'), clientData);
      console.log(`✅ Cliente criado: ${client.name} (ID: ${docRef.id})`);
    } catch (error) {
      console.error(`❌ Erro ao criar ${client.name}:`, error);
    }
  }

  console.log('\n✅ Processo concluído!');
  process.exit(0);
}

addMockClients();
