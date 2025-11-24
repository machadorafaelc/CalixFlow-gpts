/**
 * Script para verificar GPTs existentes e atribuir à agência Calix
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, query, where, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDGGMJXKjKQTmhQYzXe6vfgwl4Ov7xXKJo",
  authDomain: "calix-flow-gpts.firebaseapp.com",
  projectId: "calix-flow-gpts",
  storageBucket: "calix-flow-gpts.firebasestorage.app",
  messagingSenderId: "1057734095012",
  appId: "1:1057734095012:web:c4e0a2e0e8e0e0e0e0e0e0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  console.log('🔍 Verificando GPTs no sistema...\n');

  // 1. Listar todos os GPTs
  const gptsRef = collection(db, 'gpts');
  const gptsSnapshot = await getDocs(gptsRef);
  
  console.log(`📋 Total de GPTs encontrados: ${gptsSnapshot.size}\n`);
  
  const gpts = [];
  gptsSnapshot.forEach(doc => {
    const data = doc.data();
    gpts.push({
      id: doc.id,
      name: data.name,
      description: data.description,
      isGlobal: data.isGlobal,
      createdAt: data.createdAt
    });
    console.log(`  ✅ ${data.name}`);
    console.log(`     ID: ${doc.id}`);
    console.log(`     Global: ${data.isGlobal ? 'Sim' : 'Não'}`);
    console.log(`     Descrição: ${data.description}\n`);
  });

  // 2. Buscar agência Calix
  console.log('\n🏢 Buscando agência Calix...');
  const agenciesRef = collection(db, 'agencies');
  const calixQuery = query(agenciesRef, where('name', '==', 'Calix'));
  const calixSnapshot = await getDocs(calixQuery);
  
  if (calixSnapshot.empty) {
    console.log('❌ Agência Calix não encontrada!');
    return;
  }

  const calixAgency = calixSnapshot.docs[0];
  const calixId = calixAgency.id;
  console.log(`✅ Agência Calix encontrada: ${calixId}\n`);

  // 3. Verificar atribuições existentes
  console.log('🔗 Verificando atribuições existentes...');
  const assignmentsRef = collection(db, 'gpt_assignments');
  const assignmentsQuery = query(assignmentsRef, where('agencyId', '==', calixId));
  const assignmentsSnapshot = await getDocs(assignmentsQuery);
  
  const assignedGPTIds = new Set();
  assignmentsSnapshot.forEach(doc => {
    const data = doc.data();
    assignedGPTIds.add(data.gptId);
    console.log(`  ✅ GPT já atribuído: ${data.gptId}`);
  });

  // 4. Atribuir GPTs não atribuídos
  console.log('\n📌 Atribuindo GPTs à agência Calix...');
  
  for (const gpt of gpts) {
    if (assignedGPTIds.has(gpt.id)) {
      console.log(`  ⏭️  ${gpt.name} - Já atribuído`);
      continue;
    }

    // Criar atribuição
    await addDoc(collection(db, 'gpt_assignments'), {
      gptId: gpt.id,
      agencyId: calixId,
      assignedAt: Timestamp.now(),
      assignedBy: 'script' // Indica que foi atribuído via script
    });

    console.log(`  ✅ ${gpt.name} - Atribuído com sucesso!`);
  }

  console.log('\n✨ Processo concluído!');
  console.log(`\n📊 Resumo:`);
  console.log(`   Total de GPTs: ${gpts.length}`);
  console.log(`   Já atribuídos: ${assignedGPTIds.size}`);
  console.log(`   Novos atribuídos: ${gpts.length - assignedGPTIds.size}`);
}

main()
  .then(() => {
    console.log('\n✅ Script executado com sucesso!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Erro ao executar script:', error);
    process.exit(1);
  });
