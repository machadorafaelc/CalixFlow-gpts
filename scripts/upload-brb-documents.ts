/**
 * Script para fazer upload dos documentos do BRB
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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
const storage = getStorage(app);

// ID do cliente BRB (será preenchido após criar o cliente)
const BRB_CLIENT_ID = process.argv[2];

if (!BRB_CLIENT_ID) {
  console.error('❌ Erro: ID do cliente BRB não fornecido');
  console.log('Uso: node upload-brb-documents.js <client-id>');
  process.exit(1);
}

// Documentos do BRB
const documents = [
  {
    fileName: '05-Manual-BRB-CARD.pdf',
    description: 'Manual do BRB Card',
    tags: ['manual', 'cartão', 'brb-card']
  },
  {
    fileName: '07-Manual-Financeira-BRB.pdf',
    description: 'Manual da Financeira BRB',
    tags: ['manual', 'financeira']
  },
  {
    fileName: 'Manual-de-Identidade-2022.pdf',
    description: 'Manual de Identidade Visual 2022',
    tags: ['manual', 'identidade-visual', 'branding']
  },
  {
    fileName: 'Manual-de-Marca-BRB-Seguros-Versao-Publica.pdf',
    description: 'Manual de Marca BRB Seguros',
    tags: ['manual', 'seguros', 'branding']
  },
  {
    fileName: 'ManualdeMidiaDigital.txt',
    description: 'Manual de Mídia Digital - Especificações técnicas para anúncios',
    tags: ['manual', 'mídia-digital', 'anúncios', 'especificações']
  },
  {
    fileName: 'manualtecnicogoogle-spotify-uber1.txt',
    description: 'Manual Técnico Google, Spotify e Uber',
    tags: ['manual', 'google', 'spotify', 'uber', 'especificações']
  },
  {
    fileName: 'OrientaçõesparaBriefing.txt',
    description: 'Orientações para Briefing',
    tags: ['briefing', 'orientações', 'processo']
  },
  {
    fileName: 'SobreoBanco-geral.txt',
    description: 'Informações gerais sobre o Banco BRB',
    tags: ['banco', 'informações-gerais', 'institucional']
  }
];

function getFileType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const types: Record<string, string> = {
    pdf: 'application/pdf',
    txt: 'text/plain',
  };
  return types[ext || ''] || 'application/octet-stream';
}

async function uploadDocument(doc: typeof documents[0]) {
  try {
    const filePath = path.join(__dirname, '../documents/brb', doc.fileName);
    
    // Verificar se arquivo existe
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Arquivo não encontrado: ${doc.fileName}`);
      return null;
    }
    
    // Ler arquivo
    const fileBuffer = fs.readFileSync(filePath);
    const fileSize = fs.statSync(filePath).size;
    
    console.log(`📤 Uploading: ${doc.fileName} (${(fileSize / 1024).toFixed(2)} KB)`);
    
    // Upload para Storage
    const storagePath = `clients/${BRB_CLIENT_ID}/documents/${doc.fileName}`;
    const storageRef = ref(storage, storagePath);
    
    await uploadBytes(storageRef, fileBuffer, {
      contentType: getFileType(doc.fileName)
    });
    
    const downloadURL = await getDownloadURL(storageRef);
    
    // Salvar metadados no Firestore
    const documentData = {
      clientId: BRB_CLIENT_ID,
      name: doc.fileName,
      type: getFileType(doc.fileName),
      size: fileSize,
      storagePath,
      downloadURL,
      uploadedAt: Timestamp.now(),
      description: doc.description,
      tags: doc.tags,
    };
    
    const docRef = await addDoc(collection(db, 'documents'), documentData);
    
    console.log(`✅ Uploaded: ${doc.fileName} (ID: ${docRef.id})`);
    
    return docRef.id;
    
  } catch (error) {
    console.error(`❌ Erro ao fazer upload de ${doc.fileName}:`, error);
    return null;
  }
}

async function uploadAllDocuments() {
  console.log('🚀 Iniciando upload dos documentos do BRB...\n');
  console.log(`Cliente ID: ${BRB_CLIENT_ID}\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const doc of documents) {
    const result = await uploadDocument(doc);
    if (result) {
      successCount++;
    } else {
      failCount++;
    }
    console.log(''); // Linha em branco
  }
  
  console.log('📊 Resumo:');
  console.log(`✅ Sucesso: ${successCount}`);
  console.log(`❌ Falhas: ${failCount}`);
  console.log(`📁 Total: ${documents.length}`);
}

// Executar
uploadAllDocuments()
  .then(() => {
    console.log('\n🎉 Upload concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erro fatal:', error);
    process.exit(1);
  });
