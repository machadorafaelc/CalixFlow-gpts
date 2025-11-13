import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';
import embeddingService from '../src/services/embeddingService';

// Configuração Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function processAllDocuments() {
  try {
    console.log('🚀 Iniciando processamento de documentos do BRB...\n');
    
    // Buscar cliente BRB
    const clientsSnapshot = await getDocs(collection(db, 'clients'));
    const brbClient = clientsSnapshot.docs.find(doc => 
      doc.data().name.includes('BRB')
    );
    
    if (!brbClient) {
      console.error('❌ Cliente BRB não encontrado!');
      return;
    }
    
    console.log(`✅ Cliente BRB encontrado: ${brbClient.id}\n`);
    
    // Buscar documentos do BRB
    const documentsSnapshot = await getDocs(
      collection(db, `clients/${brbClient.id}/documents`)
    );
    
    console.log(`📄 Encontrados ${documentsSnapshot.size} documentos\n`);
    
    let totalChunks = 0;
    let totalCost = 0;
    
    // Processar cada documento
    for (const docSnapshot of documentsSnapshot.docs) {
      const document = docSnapshot.data();
      console.log(`\n📝 Processando: ${document.name}`);
      console.log(`   Tamanho: ${document.content?.length || 0} caracteres`);
      
      if (!document.content) {
        console.log('   ⚠️  Documento sem conteúdo, pulando...');
        continue;
      }
      
      // Estimar custo
      const cost = embeddingService.estimateProcessingCost(document.content.length);
      totalCost += cost;
      console.log(`   💰 Custo estimado: $${cost.toFixed(4)}`);
      
      // Processar documento
      const chunks = await embeddingService.processDocument(
        docSnapshot.id,
        document.name,
        document.content,
        brbClient.id
      );
      
      console.log(`   ✅ Gerados ${chunks.length} chunks com embeddings`);
      totalChunks += chunks.length;
      
      // Salvar chunks no Firestore
      for (const chunk of chunks) {
        await setDoc(
          doc(db, `clients/${brbClient.id}/embeddings/${chunk.id}`),
          {
            documentId: chunk.documentId,
            documentName: chunk.documentName,
            content: chunk.content,
            embedding: chunk.embedding,
            metadata: chunk.metadata,
            createdAt: new Date()
          }
        );
      }
      
      console.log(`   💾 Chunks salvos no Firestore`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Processamento concluído!');
    console.log(`📊 Total de chunks: ${totalChunks}`);
    console.log(`💰 Custo total estimado: $${totalCost.toFixed(4)}`);
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Erro ao processar documentos:', error);
    throw error;
  }
}

// Executar
processAllDocuments()
  .then(() => {
    console.log('\n✅ Script finalizado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script finalizado com erro:', error);
    process.exit(1);
  });
