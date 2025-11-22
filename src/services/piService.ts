/**
 * PI Service
 * 
 * Serviço para gerenciamento de PIs (Planos de Inserção) no Firestore
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  addDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { PI, PIStatus, PIFilters, PIHistoryEntry, PIComment } from '../types/firestore';

export class PIService {
  private static COLLECTION = 'pis';
  private static COMMENTS_COLLECTION = 'pi_comments';

  /**
   * Criar novo PI
   */
  static async createPI(
    data: Omit<PI, 'id' | 'createdAt' | 'updatedAt' | 'historico'>
  ): Promise<string> {
    const pisRef = collection(db, this.COLLECTION);
    
    const newPI = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      historico: [{
        timestamp: serverTimestamp(),
        userId: data.createdBy,
        userName: 'Sistema',
        action: 'created' as const,
        description: `PI ${data.numero} criado`,
      }],
    };

    const docRef = await addDoc(pisRef, newPI);
    return docRef.id;
  }

  /**
   * Atualizar PI
   */
  static async updatePI(
    piId: string,
    data: Partial<PI>,
    userId: string,
    userName: string
  ): Promise<void> {
    const piRef = doc(db, this.COLLECTION, piId);
    const piSnap = await getDoc(piRef);
    
    if (!piSnap.exists()) {
      throw new Error('PI não encontrado');
    }

    const currentPI = piSnap.data() as PI;
    const historyEntry: PIHistoryEntry = {
      timestamp: serverTimestamp() as any,
      userId,
      userName,
      action: 'updated',
      description: 'PI atualizado',
    };

    await updateDoc(piRef, {
      ...data,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
      historico: [...(currentPI.historico || []), historyEntry],
    });
  }

  /**
   * Mudar status do PI
   */
  static async changeStatus(
    piId: string,
    newStatus: PIStatus,
    userId: string,
    userName: string
  ): Promise<void> {
    const piRef = doc(db, this.COLLECTION, piId);
    const piSnap = await getDoc(piRef);
    
    if (!piSnap.exists()) {
      throw new Error('PI não encontrado');
    }

    const currentPI = piSnap.data() as PI;
    const historyEntry: PIHistoryEntry = {
      timestamp: serverTimestamp() as any,
      userId,
      userName,
      action: 'status_changed',
      description: `Status alterado de "${currentPI.status}" para "${newStatus}"`,
      oldValue: currentPI.status,
      newValue: newStatus,
    };

    await updateDoc(piRef, {
      status: newStatus,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
      historico: [...(currentPI.historico || []), historyEntry],
    });
  }

  /**
   * Mudar departamento do PI
   */
  static async changeDepartment(
    piId: string,
    newDepartment: 'midia' | 'checking' | 'financeiro',
    userId: string,
    userName: string
  ): Promise<void> {
    const piRef = doc(db, this.COLLECTION, piId);
    const piSnap = await getDoc(piRef);
    
    if (!piSnap.exists()) {
      throw new Error('PI não encontrado');
    }

    const currentPI = piSnap.data() as PI;
    const historyEntry: PIHistoryEntry = {
      timestamp: serverTimestamp() as any,
      userId,
      userName,
      action: 'department_changed',
      description: `Departamento alterado de "${currentPI.departamento}" para "${newDepartment}"`,
      oldValue: currentPI.departamento,
      newValue: newDepartment,
    };

    await updateDoc(piRef, {
      departamento: newDepartment,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
      historico: [...(currentPI.historico || []), historyEntry],
    });
  }

  /**
   * Atribuir responsável
   */
  static async assignResponsible(
    piId: string,
    responsavel: string,
    userId: string,
    userName: string
  ): Promise<void> {
    const piRef = doc(db, this.COLLECTION, piId);
    const piSnap = await getDoc(piRef);
    
    if (!piSnap.exists()) {
      throw new Error('PI não encontrado');
    }

    const currentPI = piSnap.data() as PI;
    const historyEntry: PIHistoryEntry = {
      timestamp: serverTimestamp() as any,
      userId,
      userName,
      action: 'assigned',
      description: `Responsável alterado de "${currentPI.responsavel}" para "${responsavel}"`,
      oldValue: currentPI.responsavel,
      newValue: responsavel,
    };

    await updateDoc(piRef, {
      responsavel,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
      historico: [...(currentPI.historico || []), historyEntry],
    });
  }

  /**
   * Obter PI por ID
   */
  static async getPI(piId: string): Promise<PI | null> {
    const piRef = doc(db, this.COLLECTION, piId);
    const piSnap = await getDoc(piRef);
    
    if (!piSnap.exists()) {
      return null;
    }
    
    return { id: piSnap.id, ...piSnap.data() } as PI;
  }

  /**
   * Listar PIs com filtros
   */
  static async listPIs(filters: PIFilters = {}): Promise<PI[]> {
    const pisRef = collection(db, this.COLLECTION);
    let q = query(pisRef);

    // Aplicar filtros
    if (filters.agencyId) {
      q = query(q, where('agencyId', '==', filters.agencyId));
    }

    if (filters.clientId) {
      q = query(q, where('clientId', '==', filters.clientId));
    }

    if (filters.departamento) {
      q = query(q, where('departamento', '==', filters.departamento));
    }

    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }

    if (filters.responsavel) {
      q = query(q, where('responsavel', '==', filters.responsavel));
    }

    if (filters.meio) {
      q = query(q, where('meio', '==', filters.meio));
    }

    // Ordenar por data de entrada (mais recentes primeiro)
    q = query(q, orderBy('dataEntrada', 'desc'));

    const snapshot = await getDocs(q);
    const pis = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as PI[];

    // Filtros adicionais que não podem ser feitos no Firestore
    let filteredPIs = pis;

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filteredPIs = filteredPIs.filter(
        (pi) =>
          pi.numero.toLowerCase().includes(term) ||
          pi.cliente.toLowerCase().includes(term) ||
          pi.campanha.toLowerCase().includes(term) ||
          pi.veiculo.toLowerCase().includes(term)
      );
    }

    if (filters.dataInicio) {
      filteredPIs = filteredPIs.filter(
        (pi) => pi.dataEntrada.toDate() >= filters.dataInicio!
      );
    }

    if (filters.dataFim) {
      filteredPIs = filteredPIs.filter(
        (pi) => pi.dataEntrada.toDate() <= filters.dataFim!
      );
    }

    return filteredPIs;
  }

  /**
   * Listar PIs por agência
   */
  static async getPIsByAgency(agencyId: string): Promise<PI[]> {
    return this.listPIs({ agencyId });
  }

  /**
   * Listar PIs por cliente
   */
  static async getPIsByClient(clientId: string): Promise<PI[]> {
    return this.listPIs({ clientId });
  }

  /**
   * Listar PIs por departamento
   */
  static async getPIsByDepartment(
    agencyId: string,
    departamento: 'midia' | 'checking' | 'financeiro'
  ): Promise<PI[]> {
    return this.listPIs({ agencyId, departamento });
  }

  /**
   * Excluir PI
   */
  static async deletePI(piId: string): Promise<void> {
    const piRef = doc(db, this.COLLECTION, piId);
    await deleteDoc(piRef);
  }

  /**
   * Adicionar comentário a um PI
   */
  static async addComment(
    piId: string,
    userId: string,
    userName: string,
    content: string,
    userPhoto?: string
  ): Promise<string> {
    const commentsRef = collection(db, this.COMMENTS_COLLECTION);
    
    const newComment = {
      piId,
      userId,
      userName,
      userPhoto,
      content,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(commentsRef, newComment);
    return docRef.id;
  }

  /**
   * Listar comentários de um PI
   */
  static async getComments(piId: string): Promise<PIComment[]> {
    const commentsRef = collection(db, this.COMMENTS_COLLECTION);
    const q = query(
      commentsRef,
      where('piId', '==', piId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as PIComment[];
  }

  /**
   * Criar PI a partir de dados do ERP
   */
  static async createPIFromERP(
    erpData: any,
    agencyId: string
  ): Promise<string> {
    // Mapear dados do ERP para o formato do PI
    const piData: Omit<PI, 'id' | 'createdAt' | 'updatedAt' | 'historico'> = {
      numero: erpData.numero || erpData.id,
      agencyId,
      cliente: erpData.cliente,
      campanha: erpData.campanha,
      meio: erpData.meio,
      veiculo: erpData.veiculo,
      status: 'checking_analise', // Status inicial
      departamento: 'midia', // Departamento inicial
      responsavel: erpData.responsavel || 'Não atribuído',
      valor: parseFloat(erpData.valor) || 0,
      dataEntrada: Timestamp.fromDate(new Date(erpData.dataEntrada)),
      prazo: Timestamp.fromDate(new Date(erpData.prazo)),
      createdBy: 'api',
      updatedBy: 'api',
      erpData: {
        erpId: erpData.id,
        syncedAt: serverTimestamp() as any,
        rawData: erpData,
      },
    };

    return this.createPI(piData);
  }

  /**
   * Importar múltiplos PIs em lote
   */
  static async batchImportPIs(
    pisData: Omit<PI, 'id' | 'createdAt' | 'updatedAt' | 'historico'>[],
    maxBatchSize: number = 500
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const batch = writeBatch(db);
    const pisRef = collection(db, this.COLLECTION);
    
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let i = 0; i < pisData.length; i++) {
      try {
        const piData = pisData[i];
        const docRef = doc(pisRef);
        
        batch.set(docRef, {
          ...piData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          historico: [{
            timestamp: serverTimestamp(),
            userId: piData.createdBy,
            userName: 'Sistema',
            action: 'created' as const,
            description: `PI ${piData.numero} importado`,
          }],
        });

        success++;

        // Commit a cada maxBatchSize documentos
        if ((i + 1) % maxBatchSize === 0) {
          await batch.commit();
        }
      } catch (error: any) {
        failed++;
        errors.push(`PI ${pisData[i].numero}: ${error.message}`);
      }
    }

    // Commit final
    if (success % maxBatchSize !== 0) {
      await batch.commit();
    }

    return { success, failed, errors };
  }
}
