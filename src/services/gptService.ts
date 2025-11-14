import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { GPT, GPTAssignment } from '../types/firestore';
import { AgencyService } from './agencyService';

export class GPTService {
  private static readonly COLLECTION = 'gpts';
  private static readonly ASSIGNMENTS_COLLECTION = 'gpt_assignments';

  /**
   * Criar novo GPT
   */
  static async createGPT(
    name: string,
    description: string,
    systemPrompt: string,
    createdBy: string,
    isGlobal: boolean = false,
    model: string = 'gpt-4o-mini'
  ): Promise<string> {
    const gptData = {
      name,
      description,
      systemPrompt,
      createdAt: serverTimestamp(),
      createdBy,
      updatedAt: serverTimestamp(),
      isGlobal,
      model
    };

    const docRef = await addDoc(collection(db, this.COLLECTION), gptData);
    return docRef.id;
  }

  /**
   * Listar todos os GPTs
   */
  static async listGPTs(): Promise<GPT[]> {
    const q = query(
      collection(db, this.COLLECTION),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as GPT));
  }

  /**
   * Buscar GPT por ID
   */
  static async getGPT(gptId: string): Promise<GPT | null> {
    const docRef = doc(db, this.COLLECTION, gptId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data()
    } as GPT;
  }

  /**
   * Atualizar GPT
   */
  static async updateGPT(
    gptId: string,
    updates: Partial<Omit<GPT, 'id' | 'createdAt' | 'createdBy'>>
  ): Promise<void> {
    const docRef = doc(db, this.COLLECTION, gptId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }

  /**
   * Deletar GPT
   */
  static async deleteGPT(gptId: string): Promise<void> {
    // Deletar todas as atribuições primeiro
    const assignments = await this.getGPTAssignments(gptId);
    for (const assignment of assignments) {
      await this.unassignGPT(assignment.id);
    }

    // Deletar o GPT
    const docRef = doc(db, this.COLLECTION, gptId);
    await deleteDoc(docRef);
  }

  /**
   * Atribuir GPT a uma agência
   */
  static async assignGPT(
    gptId: string,
    agencyId: string,
    assignedBy: string
  ): Promise<string> {
    // Verificar se já existe
    const existing = await this.checkAssignment(gptId, agencyId);
    if (existing) {
      return existing.id;
    }

    const assignmentData = {
      gptId,
      agencyId,
      assignedAt: serverTimestamp(),
      assignedBy
    };

    const docRef = await addDoc(
      collection(db, this.ASSIGNMENTS_COLLECTION),
      assignmentData
    );

    // Incrementar contador de GPTs da agência
    await AgencyService.incrementGPTCount(agencyId, 1);

    return docRef.id;
  }

  /**
   * Remover atribuição de GPT
   */
  static async unassignGPT(assignmentId: string): Promise<void> {
    const docRef = doc(db, this.ASSIGNMENTS_COLLECTION, assignmentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const assignment = docSnap.data() as GPTAssignment;
      await deleteDoc(docRef);

      // Decrementar contador de GPTs da agência
      await AgencyService.incrementGPTCount(assignment.agencyId, -1);
    }
  }

  /**
   * Verificar se GPT já está atribuído a uma agência
   */
  static async checkAssignment(
    gptId: string,
    agencyId: string
  ): Promise<GPTAssignment | null> {
    const q = query(
      collection(db, this.ASSIGNMENTS_COLLECTION),
      where('gptId', '==', gptId),
      where('agencyId', '==', agencyId)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as GPTAssignment;
  }

  /**
   * Listar GPTs de uma agência
   */
  static async listAgencyGPTs(agencyId: string): Promise<GPT[]> {
    // Buscar atribuições
    const q = query(
      collection(db, this.ASSIGNMENTS_COLLECTION),
      where('agencyId', '==', agencyId)
    );

    const snapshot = await getDocs(q);
    const gptIds = snapshot.docs.map(doc => doc.data().gptId);

    // Buscar GPTs globais
    const globalQuery = query(
      collection(db, this.COLLECTION),
      where('isGlobal', '==', true)
    );
    const globalSnapshot = await getDocs(globalQuery);
    const globalGPTs = globalSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as GPT));

    // Buscar GPTs atribuídos
    const assignedGPTs: GPT[] = [];
    for (const gptId of gptIds) {
      const gpt = await this.getGPT(gptId);
      if (gpt) {
        assignedGPTs.push(gpt);
      }
    }

    // Combinar e remover duplicatas
    const allGPTs = [...globalGPTs, ...assignedGPTs];
    const uniqueGPTs = allGPTs.filter(
      (gpt, index, self) => self.findIndex(g => g.id === gpt.id) === index
    );

    return uniqueGPTs;
  }

  /**
   * Listar todas as atribuições de um GPT
   */
  static async getGPTAssignments(gptId: string): Promise<GPTAssignment[]> {
    const q = query(
      collection(db, this.ASSIGNMENTS_COLLECTION),
      where('gptId', '==', gptId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as GPTAssignment));
  }

  /**
   * Listar todas as atribuições de uma agência
   */
  static async getAgencyAssignments(agencyId: string): Promise<GPTAssignment[]> {
    const q = query(
      collection(db, this.ASSIGNMENTS_COLLECTION),
      where('agencyId', '==', agencyId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as GPTAssignment));
  }
}
