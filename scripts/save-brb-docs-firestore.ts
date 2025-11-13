/**
 * Script para salvar documentos do BRB no Firestore como texto
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBSDWSZuCAFRBwlpQy2F0DKV6K5NVeSZso",
  authDomain: "calixflow-70215.firebaseapp.com",
  projectId: "calixflow-70215",
  storageBucket: "calixflow-70215.firebasestorage.app",
  messagingSenderId: "786155299178",
  appId: "1:786155299178:web:711cd14dda686b3ffa4513"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const BRB_CLIENT_ID = 'RN7AmYsNtDdFJa3rlYpA';

// Documentos TXT (que podemos salvar como texto)
const textDocuments = [
  {
    fileName: 'ManualdeMidiaDigital.txt',
    description: 'Manual de Mídia Digital - Especificações técnicas para anúncios em Meta, LinkedIn, TikTok, Google, Spotify',
    tags: ['manual', 'mídia-digital', 'anúncios', 'especificações', 'meta', 'linkedin', 'tiktok', 'google', 'spotify']
  },
  {
    fileName: 'manualtecnicogoogle-spotify-uber1.txt',
    description: 'Manual Técnico Google, Spotify e Uber - Especificações de anúncios',
    tags: ['manual', 'google', 'spotify', 'uber', 'especificações', 'anúncios']
  },
  {
    fileName: 'OrientaçõesparaBriefing.txt',
    description: 'Orientações para Briefing - Processo e diretrizes',
    tags: ['briefing', 'orientações', 'processo', 'diretrizes']
  },
  {
    fileName: 'SobreoBanco-geral.txt',
    description: 'Informações gerais sobre o Banco BRB - História, missão, valores',
    tags: ['banco', 'informações-gerais', 'institucional', 'história', 'missão']
  }
];

async function saveDocument(doc: typeof textDocuments[0]) {
  try {
    const filePath = path.join(__dirname, '../documents/brb', doc.fileName);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Arquivo não encontrado: ${doc.fileName}`);
      return null;
    }
    
    // Ler conteúdo do arquivo
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileSize = fs.statSync(filePath).size;
    
    console.log(`📝 Salvando: ${doc.fileName} (${(fileSize / 1024).toFixed(2)} KB, ${content.length} caracteres)`);
    
    // Salvar no Firestore
    const documentData = {
      clientId: BRB_CLIENT_ID,
      name: doc.fileName,
      type: 'text/plain',
      size: fileSize,
      content: content, // Salvar conteúdo completo
      uploadedAt: Timestamp.now(),
      description: doc.description,
      tags: doc.tags,
    };
    
    const docRef = await addDoc(collection(db, 'documents'), documentData);
    
    console.log(`✅ Salvo: ${doc.fileName} (ID: ${docRef.id})`);
    
    return docRef.id;
    
  } catch (error) {
    console.error(`❌ Erro ao salvar ${doc.fileName}:`, error);
    return null;
  }
}

async function saveAllDocuments() {
  console.log('🚀 Salvando documentos do BRB no Firestore...\n');
  console.log(`Cliente ID: ${BRB_CLIENT_ID}\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const doc of textDocuments) {
    const result = await saveDocument(doc);
    if (result) {
      successCount++;
    } else {
      failCount++;
    }
    console.log('');
  }
  
  console.log('📊 Resumo:');
  console.log(`✅ Sucesso: ${successCount}`);
  console.log(`❌ Falhas: ${failCount}`);
  console.log(`📁 Total: ${textDocuments.length}`);
  console.log('\n⚠️  Nota: PDFs não foram salvos (requerem extração de texto)');
}

// Executar
saveAllDocuments()
  .then(() => {
    console.log('\n🎉 Documentos salvos!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erro fatal:', error);
    process.exit(1);
  });
