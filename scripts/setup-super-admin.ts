/**
 * Script para configurar o primeiro super_admin
 * 
 * Uso: npm run setup-admin
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAFKuUlYm-XNxwJZCLpNEMQqnZONYVGlMg",
  authDomain: "calix-flow-gpts.firebaseapp.com",
  projectId: "calix-flow-gpts",
  storageBucket: "calix-flow-gpts.firebasestorage.app",
  messagingSenderId: "1040859823556",
  appId: "1:1040859823556:web:a6c8a7e5a5b7e5a5b7e5a5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function setupSuperAdmin() {
  const superAdminEmail = 'machado.rafaelc@gmail.com';
  
  console.log('🚀 Configurando super_admin...');
  console.log(`📧 Email: ${superAdminEmail}`);
  
  try {
    // Nota: Este script deve ser executado DEPOIS que o usuário fizer login pela primeira vez
    // O UID será obtido do Firebase Auth
    
    console.log('\n⚠️  IMPORTANTE:');
    console.log('1. Faça login na aplicação com o email: machado.rafaelc@gmail.com');
    console.log('2. Após o login, copie seu UID do Firebase Auth');
    console.log('3. Execute este script novamente passando o UID como argumento');
    console.log('\nExemplo: npm run setup-admin YOUR_UID_HERE');
    
    const uid = process.argv[2];
    
    if (!uid) {
      console.log('\n❌ UID não fornecido. Por favor, forneça o UID como argumento.');
      process.exit(1);
    }
    
    // Criar/atualizar perfil de usuário como super_admin
    await setDoc(doc(db, 'users', uid), {
      uid,
      email: superAdminEmail,
      displayName: 'Rafael Machado',
      role: 'super_admin',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    
    console.log('\n✅ Super admin configurado com sucesso!');
    console.log(`👤 UID: ${uid}`);
    console.log(`📧 Email: ${superAdminEmail}`);
    console.log(`🔑 Role: super_admin`);
    console.log('\n🎉 Você agora tem acesso completo ao sistema!');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro ao configurar super admin:', error);
    process.exit(1);
  }
}

setupSuperAdmin();
