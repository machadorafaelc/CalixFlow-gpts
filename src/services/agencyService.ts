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
import { Agency } from '../types/firestore';

export class AgencyService {
  private static readonly COLLECTION = 'agencies';

  /**
   * Criar nova agência
   */
  static async createAgency(
    name: string,
    description: string,
    createdBy: string
  ): Promise<string> {
    const agencyData = {
      name,
      description,
      createdAt: serverTimestamp(),
      createdBy,
      updatedAt: serverTimestamp(),
      status: 'active' as const,
      userCount: 0,
      gptCount: 0
    };

    const docRef = await addDoc(collection(db, this.COLLECTION), agencyData);
    return docRef.id;
  }

  /**
   * Listar todas as agências
   */
  static async listAgencies(): Promise<Agency[]> {
    const q = query(
      collection(db, this.COLLECTION),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Agency));
  }

  /**
   * Buscar agência por ID
   */
  static async getAgency(agencyId: string): Promise<Agency | null> {
    const docRef = doc(db, this.COLLECTION, agencyId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Agency;
  }

  /**
   * Atualizar agência
   */
  static async updateAgency(
    agencyId: string,
    updates: Partial<Omit<Agency, 'id' | 'createdAt' | 'createdBy'>>
  ): Promise<void> {
    const docRef = doc(db, this.COLLECTION, agencyId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }

  /**
   * Deletar agência
   */
  static async deleteAgency(agencyId: string): Promise<void> {
    const docRef = doc(db, this.COLLECTION, agencyId);
    await deleteDoc(docRef);
  }

  /**
   * Ativar/desativar agência
   */
  static async setAgencyStatus(
    agencyId: string,
    status: 'active' | 'inactive'
  ): Promise<void> {
    await this.updateAgency(agencyId, { status });
  }

  /**
   * Incrementar contador de usuários
   */
  static async incrementUserCount(agencyId: string, delta: number = 1): Promise<void> {
    const agency = await this.getAgency(agencyId);
    if (agency) {
      await this.updateAgency(agencyId, {
        userCount: agency.userCount + delta
      });
    }
  }

  /**
   * Incrementar contador de GPTs
   */
  static async incrementGPTCount(agencyId: string, delta: number = 1): Promise<void> {
    const agency = await this.getAgency(agencyId);
    if (agency) {
      await this.updateAgency(agencyId, {
        gptCount: agency.gptCount + delta
      });
    }
  }
}
