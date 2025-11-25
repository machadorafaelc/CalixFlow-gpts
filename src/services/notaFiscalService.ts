/**
 * Service para gerenciamento de Notas Fiscais
 * 
 * Funcionalidades:
 * - Upload de notas
 * - Validação por IA (multi-agentes)
 * - Armazenamento no Google Drive
 * - Envio de emails
 */

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { NotaFiscal, RHConfig } from '../types/firestore';

/**
 * Cria ou atualiza configuração de RH
 */
export async function saveRHConfig(agencyId: string, config: Partial<RHConfig>): Promise<void> {
  const rhConfigRef = doc(db, 'rh_config', agencyId);
  
  const data = {
    ...config,
    agencyId,
    updatedAt: Timestamp.now(),
  };
  
  const existingDoc = await getDoc(rhConfigRef);
  if (existingDoc.exists()) {
    await updateDoc(rhConfigRef, data);
  } else {
    await addDoc(collection(db, 'rh_config'), {
      ...data,
      id: agencyId,
      createdAt: Timestamp.now(),
    });
  }
}

/**
 * Busca configuração de RH
 */
export async function getRHConfig(agencyId: string): Promise<RHConfig | null> {
  const rhConfigRef = doc(db, 'rh_config', agencyId);
  const docSnap = await getDoc(rhConfigRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as RHConfig;
  }
  return null;
}

/**
 * Faz upload da nota fiscal para Firebase Storage
 */
export async function uploadNotaFiscal(
  file: File,
  userId: string,
  agencyId: string
): Promise<string> {
  const timestamp = Date.now();
  const fileName = `${userId}_${timestamp}_${file.name}`;
  const storageRef = ref(storage, `notas_fiscais/${agencyId}/${userId}/${fileName}`);
  
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  
  return downloadURL;
}

/**
 * Cria pasta no Google Drive para o colaborador (via API)
 * TODO: Implementar integração com Google Drive API
 */
async function createUserFolderInDrive(
  userName: string,
  parentFolderId: string
): Promise<string> {
  // Por enquanto, retorna um ID mockado
  // Implementar com Google Drive API depois
  console.log(`Criando pasta para ${userName} em ${parentFolderId}`);
  return `folder_${userName}_${Date.now()}`;
}

/**
 * Faz upload do arquivo para Google Drive
 * TODO: Implementar integração com Google Drive API
 */
async function uploadToDrive(
  fileUrl: string,
  fileName: string,
  folderId: string
): Promise<string> {
  // Por enquanto, retorna um ID mockado
  // Implementar com Google Drive API depois
  console.log(`Upload para Drive: ${fileName} em ${folderId}`);
  return `file_${Date.now()}`;
}

/**
 * Valida nota fiscal usando IA (multi-agentes)
 * TODO: Implementar validação real com OpenAI/GPT
 */
async function validateNotaFiscalWithAI(
  fileUrl: string,
  rules?: any
): Promise<{
  isValid: boolean;
  errors: string[];
  warnings: string[];
  extractedData?: any;
}> {
  // Por enquanto, retorna validação mockada
  // Implementar com OpenAI Vision API depois
  console.log(`Validando nota: ${fileUrl}`);
  
  return {
    isValid: true,
    errors: [],
    warnings: [],
    extractedData: {
      numero: '12345',
      valor: 1500.00,
      data: new Date().toISOString(),
      cnpj: '00.000.000/0001-00',
    },
  };
}

/**
 * Envia email de confirmação
 * TODO: Implementar envio real de email
 */
async function sendConfirmationEmail(
  userEmail: string,
  userName: string,
  rhEmails: string[],
  notaId: string
): Promise<void> {
  console.log(`Enviando email para ${userEmail} e RH: ${rhEmails.join(', ')}`);
  
  // Template do email
  const emailTemplate = `
    Olá ${userName},
    
    Sua nota fiscal foi recebida e processada com sucesso!
    
    Protocolo: ${notaId}
    Data: ${new Date().toLocaleDateString('pt-BR')}
    
    A nota foi validada e enviada para o RH.
    Em caso de dúvidas, entre em contato com o departamento de Recursos Humanos.
    
    Atenciosamente,
    Sistema VegaFlow
  `;
  
  // Implementar envio real depois
  console.log(emailTemplate);
}

/**
 * Submete nota fiscal para processamento
 */
export async function submitNotaFiscal(
  file: File,
  userId: string,
  userEmail: string,
  userDisplayName: string,
  agencyId: string
): Promise<string> {
  try {
    // 1. Buscar configuração do RH
    const rhConfig = await getRHConfig(agencyId);
    if (!rhConfig) {
      throw new Error('Configuração de RH não encontrada para esta agência');
    }
    
    // 2. Upload para Firebase Storage
    const fileUrl = await uploadNotaFiscal(file, userId, agencyId);
    
    // 3. Criar registro inicial
    const notaRef = await addDoc(collection(db, 'notas_fiscais'), {
      agencyId,
      userId,
      userEmail,
      userDisplayName,
      fileName: file.name,
      fileUrl,
      status: 'validating',
      emailSent: false,
      rhNotified: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    // 4. Validar com IA (assíncrono)
    const validationResult = await validateNotaFiscalWithAI(
      fileUrl,
      rhConfig.validationRules
    );
    
    // 5. Criar pasta do usuário no Drive (se não existir)
    let userFolderId = rhConfig.driveFolderId;
    // TODO: Verificar se pasta do usuário já existe, senão criar
    
    // 6. Upload para Google Drive
    const driveFileId = await uploadToDrive(
      fileUrl,
      file.name,
      userFolderId
    );
    
    // 7. Atualizar registro com resultado da validação
    await updateDoc(doc(db, 'notas_fiscais', notaRef.id), {
      status: validationResult.isValid ? 'approved' : 'rejected',
      validationResult,
      driveFileId,
      driveFolderId: userFolderId,
      processedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    // 8. Enviar emails
    if (validationResult.isValid) {
      await sendConfirmationEmail(
        userEmail,
        userDisplayName,
        rhConfig.rhEmails,
        notaRef.id
      );
      
      await updateDoc(doc(db, 'notas_fiscais', notaRef.id), {
        emailSent: true,
        emailSentAt: Timestamp.now(),
        rhNotified: true,
      });
    }
    
    return notaRef.id;
  } catch (error) {
    console.error('Erro ao submeter nota fiscal:', error);
    throw error;
  }
}

/**
 * Lista notas fiscais do usuário
 */
export async function listNotasFiscais(
  userId: string,
  agencyId: string
): Promise<NotaFiscal[]> {
  const q = query(
    collection(db, 'notas_fiscais'),
    where('userId', '==', userId),
    where('agencyId', '==', agencyId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as NotaFiscal[];
}

/**
 * Lista todas as notas fiscais da agência (para RH)
 */
export async function listAllNotasFiscais(agencyId: string): Promise<NotaFiscal[]> {
  const q = query(
    collection(db, 'notas_fiscais'),
    where('agencyId', '==', agencyId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as NotaFiscal[];
}

/**
 * Busca uma nota fiscal por ID
 */
export async function getNotaFiscal(notaId: string): Promise<NotaFiscal | null> {
  const docRef = doc(db, 'notas_fiscais', notaId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as NotaFiscal;
  }
  return null;
}
