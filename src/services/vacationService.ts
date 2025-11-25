/**
 * Service para gerenciamento de Férias
 * 
 * Funcionalidades:
 * - Solicitação de férias
 * - Aprovação hierárquica (Gerente → RH)
 * - Cálculo de saldos
 * - Notificações (email + sistema)
 * - Relatórios (Excel + PDF)
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
  Timestamp,
  setDoc 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { VacationRequest, VacationBalance, VacationHistory, User } from '../types/firestore';

/**
 * Calcula dias úteis entre duas datas (excluindo fins de semana)
 */
function calculateBusinessDays(startDate: Date, endDate: Date): number {
  let count = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 = Domingo, 6 = Sábado
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

/**
 * Valida período de férias
 */
function validateVacationPeriod(totalDays: number): { valid: boolean; error?: string } {
  const allowedDays = [10, 15, 20];
  
  if (!allowedDays.includes(totalDays)) {
    return {
      valid: false,
      error: 'Período inválido. Você pode solicitar 10, 15 ou 20 dias de férias.'
    };
  }
  
  return { valid: true };
}

/**
 * Busca ou cria saldo de férias do colaborador
 */
export async function getOrCreateVacationBalance(
  userId: string,
  agencyId: string,
  userEmail: string,
  userDisplayName: string
): Promise<VacationBalance> {
  const balanceRef = doc(db, 'vacation_balances', userId);
  const balanceSnap = await getDoc(balanceRef);
  
  if (balanceSnap.exists()) {
    return { id: balanceSnap.id, ...balanceSnap.data() } as VacationBalance;
  }
  
  // Criar saldo inicial
  const now = new Date();
  const acquisitionEnd = new Date(now);
  acquisitionEnd.setFullYear(acquisitionEnd.getFullYear() + 1);
  
  const newBalance: Omit<VacationBalance, 'id'> = {
    userId,
    agencyId,
    userEmail,
    userDisplayName,
    totalDaysPerYear: 30,
    daysUsed: 0,
    daysRemaining: 30,
    periodsUsedThisYear: 0,
    currentYear: now.getFullYear(),
    acquisitionStartDate: Timestamp.fromDate(now),
    acquisitionEndDate: Timestamp.fromDate(acquisitionEnd),
    updatedAt: Timestamp.now(),
  };
  
  await setDoc(balanceRef, newBalance);
  
  return { id: userId, ...newBalance };
}

/**
 * Submete solicitação de férias
 */
export async function submitVacationRequest(
  userId: string,
  userEmail: string,
  userDisplayName: string,
  agencyId: string,
  managerId: string,
  department: string | undefined,
  startDate: Date,
  endDate: Date
): Promise<string> {
  try {
    // 1. Calcular dias úteis
    const totalDays = calculateBusinessDays(startDate, endDate);
    
    // 2. Validar período
    const validation = validateVacationPeriod(totalDays);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    
    // 3. Buscar saldo
    const balance = await getOrCreateVacationBalance(
      userId,
      agencyId,
      userEmail,
      userDisplayName
    );
    
    // 4. Verificar saldo disponível
    if (balance.daysRemaining < totalDays) {
      throw new Error(`Saldo insuficiente. Você tem ${balance.daysRemaining} dias disponíveis.`);
    }
    
    // 5. Verificar limite de períodos (máx 3x ao ano)
    if (balance.periodsUsedThisYear >= 3) {
      throw new Error('Você já utilizou o limite de 3 períodos de férias este ano.');
    }
    
    // 6. Criar solicitação
    const requestRef = await addDoc(collection(db, 'vacation_requests'), {
      agencyId,
      userId,
      userEmail,
      userDisplayName,
      userDepartment: department,
      startDate: Timestamp.fromDate(startDate),
      endDate: Timestamp.fromDate(endDate),
      totalDays,
      status: 'pending_manager',
      managerId,
      managerNotified: false,
      rhNotified: false,
      userNotified: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    // 7. Enviar notificação para gerente
    await sendManagerNotification(managerId, requestRef.id, userDisplayName, totalDays);
    
    await updateDoc(doc(db, 'vacation_requests', requestRef.id), {
      managerNotified: true,
    });
    
    return requestRef.id;
  } catch (error) {
    console.error('Erro ao submeter solicitação de férias:', error);
    throw error;
  }
}

/**
 * Gerente aprova solicitação
 */
export async function managerApproveRequest(
  requestId: string,
  managerId: string
): Promise<void> {
  const requestRef = doc(db, 'vacation_requests', requestId);
  const requestSnap = await getDoc(requestRef);
  
  if (!requestSnap.exists()) {
    throw new Error('Solicitação não encontrada');
  }
  
  const request = requestSnap.data() as VacationRequest;
  
  // Atualizar status
  await updateDoc(requestRef, {
    status: 'approved_manager',
    managerApprovedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  
  // Notificar RH
  await sendRHNotification(request.agencyId, requestId, request.userDisplayName, request.totalDays);
  
  await updateDoc(requestRef, {
    rhNotified: true,
  });
  
  // Notificar colaborador
  await sendUserNotification(
    request.userEmail,
    request.userDisplayName,
    'Sua solicitação de férias foi aprovada pelo gerente e está aguardando aprovação do RH.'
  );
}

/**
 * Gerente rejeita solicitação
 */
export async function managerRejectRequest(
  requestId: string,
  managerId: string,
  reason: string
): Promise<void> {
  const requestRef = doc(db, 'vacation_requests', requestId);
  const requestSnap = await getDoc(requestRef);
  
  if (!requestSnap.exists()) {
    throw new Error('Solicitação não encontrada');
  }
  
  const request = requestSnap.data() as VacationRequest;
  
  await updateDoc(requestRef, {
    status: 'rejected_manager',
    managerRejectionReason: reason,
    updatedAt: Timestamp.now(),
  });
  
  // Notificar colaborador
  await sendUserNotification(
    request.userEmail,
    request.userDisplayName,
    `Sua solicitação de férias foi rejeitada pelo gerente. Motivo: ${reason}`
  );
}

/**
 * RH aprova solicitação e contabiliza
 */
export async function rhApproveRequest(
  requestId: string,
  rhUserId: string,
  rhUserName: string,
  notes?: string
): Promise<void> {
  const requestRef = doc(db, 'vacation_requests', requestId);
  const requestSnap = await getDoc(requestRef);
  
  if (!requestSnap.exists()) {
    throw new Error('Solicitação não encontrada');
  }
  
  const request = requestSnap.data() as VacationRequest;
  
  // 1. Atualizar solicitação
  await updateDoc(requestRef, {
    status: 'approved_rh',
    rhApprovedBy: rhUserId,
    rhApprovedAt: Timestamp.now(),
    rhNotes: notes,
    updatedAt: Timestamp.now(),
  });
  
  // 2. Atualizar saldo
  const balanceRef = doc(db, 'vacation_balances', request.userId);
  const balanceSnap = await getDoc(balanceRef);
  
  if (balanceSnap.exists()) {
    const balance = balanceSnap.data() as VacationBalance;
    
    await updateDoc(balanceRef, {
      daysUsed: balance.daysUsed + request.totalDays,
      daysRemaining: balance.daysRemaining - request.totalDays,
      periodsUsedThisYear: balance.periodsUsedThisYear + 1,
      lastVacationDate: request.startDate,
      updatedAt: Timestamp.now(),
    });
  }
  
  // 3. Criar histórico
  const startDate = request.startDate.toDate();
  
  await addDoc(collection(db, 'vacation_history'), {
    agencyId: request.agencyId,
    userId: request.userId,
    userEmail: request.userEmail,
    userDisplayName: request.userDisplayName,
    requestId,
    startDate: request.startDate,
    endDate: request.endDate,
    totalDays: request.totalDays,
    approvedBy: request.managerId,
    approvedByName: 'Gerente', // TODO: Buscar nome do gerente
    approvedAt: request.managerApprovedAt,
    processedByRH: rhUserId,
    processedByRHName: rhUserName,
    processedAt: Timestamp.now(),
    year: startDate.getFullYear(),
    month: startDate.getMonth() + 1,
    createdAt: Timestamp.now(),
  });
  
  // 4. Notificar colaborador
  await sendUserNotification(
    request.userEmail,
    request.userDisplayName,
    'Suas férias foram aprovadas pelo RH e contabilizadas! Aproveite seu descanso.'
  );
}

/**
 * RH rejeita solicitação
 */
export async function rhRejectRequest(
  requestId: string,
  rhUserId: string,
  reason: string
): Promise<void> {
  const requestRef = doc(db, 'vacation_requests', requestId);
  const requestSnap = await getDoc(requestRef);
  
  if (!requestSnap.exists()) {
    throw new Error('Solicitação não encontrada');
  }
  
  const request = requestSnap.data() as VacationRequest;
  
  await updateDoc(requestRef, {
    status: 'rejected_rh',
    rhRejectionReason: reason,
    updatedAt: Timestamp.now(),
  });
  
  // Notificar colaborador
  await sendUserNotification(
    request.userEmail,
    request.userDisplayName,
    `Sua solicitação de férias foi rejeitada pelo RH. Motivo: ${reason}`
  );
}

/**
 * Lista solicitações do usuário
 */
export async function listUserVacationRequests(userId: string): Promise<VacationRequest[]> {
  const q = query(
    collection(db, 'vacation_requests'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as VacationRequest[];
}

/**
 * Lista solicitações pendentes para o gerente
 */
export async function listPendingRequestsForManager(managerId: string): Promise<VacationRequest[]> {
  const q = query(
    collection(db, 'vacation_requests'),
    where('managerId', '==', managerId),
    where('status', '==', 'pending_manager'),
    orderBy('createdAt', 'asc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as VacationRequest[];
}

/**
 * Lista solicitações aprovadas pelo gerente (para RH)
 */
export async function listPendingRequestsForRH(agencyId: string): Promise<VacationRequest[]> {
  const q = query(
    collection(db, 'vacation_requests'),
    where('agencyId', '==', agencyId),
    where('status', '==', 'approved_manager'),
    orderBy('createdAt', 'asc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as VacationRequest[];
}

/**
 * Lista todos os saldos da agência (para RH)
 */
export async function listAllVacationBalances(agencyId: string): Promise<VacationBalance[]> {
  const q = query(
    collection(db, 'vacation_balances'),
    where('agencyId', '==', agencyId)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as VacationBalance[];
}

/**
 * Busca histórico de férias (para relatórios)
 */
export async function getVacationHistory(
  agencyId: string,
  year: number,
  month?: number
): Promise<VacationHistory[]> {
  let q;
  
  if (month) {
    q = query(
      collection(db, 'vacation_history'),
      where('agencyId', '==', agencyId),
      where('year', '==', year),
      where('month', '==', month),
      orderBy('startDate', 'desc')
    );
  } else {
    q = query(
      collection(db, 'vacation_history'),
      where('agencyId', '==', agencyId),
      where('year', '==', year),
      orderBy('startDate', 'desc')
    );
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as VacationHistory[];
}

/**
 * Envia notificação para gerente
 * TODO: Implementar envio real de email
 */
async function sendManagerNotification(
  managerId: string,
  requestId: string,
  userName: string,
  totalDays: number
): Promise<void> {
  console.log(`📧 Notificação para gerente ${managerId}:`);
  console.log(`${userName} solicitou ${totalDays} dias de férias.`);
  console.log(`ID da solicitação: ${requestId}`);
  
  // TODO: Enviar email real + criar notificação no sistema
}

/**
 * Envia notificação para RH
 * TODO: Implementar envio real de email
 */
async function sendRHNotification(
  agencyId: string,
  requestId: string,
  userName: string,
  totalDays: number
): Promise<void> {
  console.log(`📧 Notificação para RH da agência ${agencyId}:`);
  console.log(`Solicitação de ${userName} (${totalDays} dias) foi aprovada pelo gerente.`);
  console.log(`ID da solicitação: ${requestId}`);
  
  // TODO: Enviar email real + criar notificação no sistema
}

/**
 * Envia notificação para colaborador
 * TODO: Implementar envio real de email
 */
async function sendUserNotification(
  userEmail: string,
  userName: string,
  message: string
): Promise<void> {
  console.log(`📧 Email para ${userEmail} (${userName}):`);
  console.log(message);
  
  // TODO: Enviar email real + criar notificação no sistema
}

/**
 * Gera relatório mensal (dados para Excel/PDF)
 * TODO: Implementar geração de arquivos
 */
export async function generateMonthlyReport(
  agencyId: string,
  year: number,
  month: number
): Promise<any> {
  const history = await getVacationHistory(agencyId, year, month);
  const balances = await listAllVacationBalances(agencyId);
  
  return {
    period: `${month}/${year}`,
    history,
    balances,
    summary: {
      totalRequests: history.length,
      totalDaysUsed: history.reduce((sum, h) => sum + h.totalDays, 0),
      activeEmployees: balances.length,
    },
  };
}
