/**
 * Script para salvar PDFs extraídos do BRB no Firestore
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

// PDFs extraídos
const pdfDocuments = [
  {
    fileName: '05-Manual-BRB-CARD.pdf',
    extractedFile: '05-Manual-BRB-CARD.extracted.txt',
    description: 'Manual do BRB Card - Diretrizes e especificações',
    tags: ['manual', 'cartão', 'brb-card', 'diretrizes']
  },
  {
    fileName: '07-Manual-Financeira-BRB.pdf',
    extractedFile: '07-Manual-Financeira-BRB.extracted.txt',
    description: 'Manual da Financeira BRB - Produtos e serviços financeiros',
    tags: ['manual', 'financeira', 'produtos', 'serviços']
  },
  {
    fileName: 'Manual-de-Identidade-2022.pdf',
    extractedFile: 'Manual-de-Identidade-2022.extracted.txt',
    description: 'Manual de Identidade Visual 2022 - Branding e aplicações',
    tags: ['manual', 'identidade-visual', 'branding', 'design', 'logo']
  },
  {
    fileName: 'Manual-de-Marca-BRB-Seguros-Versao-Publica.pdf',
    extractedFile: 'Manual-de-Marca-BRB-Seguros-Versao-Publica.extracted.txt',
    description: 'Manual de Marca BRB Seguros - Identidade visual e aplicações',
    tags: ['manual', 'seguros', 'branding', 'identidade-visual', 'design']
  }
];

async function saveDocument(doc: typeof pdfDocuments[0]) {
  try {
    const filePath = path.join(__dirname, '../documents/brb', doc.extractedFile);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Arquivo não encontrado: ${doc.extractedFile}`);
      return null;
    }
    
    // Ler conteúdo extraído
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileSize = content.length;
    
    console.log(`📄 Salvando: ${doc.fileName} (${(fileSize / 1024).toFixed(2)} KB texto extraído)`);
    
    // Salvar no Firestore
    const documentData = {
      clientId: BRB_CLIENT_ID,
      name: doc.fileName,
      type: 'application/pdf',
      size: fileSize,
      content: content,
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
  console.log('🚀 Salvando PDFs do BRB no Firestore...\n');
  console.log(`Cliente ID: ${BRB_CLIENT_ID}\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const doc of pdfDocuments) {
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
  console.log(`📁 Total: ${pdfDocuments.length}`);
}

// Executar
saveAllDocuments()
  .then(() => {
    console.log('\n🎉 PDFs salvos!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erro fatal:', error);
    process.exit(1);
  });
