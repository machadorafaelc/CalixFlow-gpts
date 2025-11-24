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
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Client } from '../types/firestore';

export class ClientService {
  private static COLLECTION = 'clients';

  /**
   * Criar novo cliente
   */
  static async createClient(data: {
    agencyId: string;
    name: string;
    description?: string;
    logo?: string;
    createdBy: string;
  }): Promise<string> {
    const clientData: Omit<Client, 'id'> = {
      agencyId: data.agencyId,
      name: data.name,
      description: data.description,
      logo: data.logo,
      status: 'active',
      piCount: 0,
      createdAt: Timestamp.now(),
      createdBy: data.createdBy,
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, this.COLLECTION), clientData);
    return docRef.id;
  }

  /**
   * Buscar cliente por ID
   */
  static async getClient(clientId: string): Promise<Client | null> {
    const docRef = doc(db, this.COLLECTION, clientId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Client;
  }

  /**
   * Listar clientes de uma agência
   */
  static async listClients(agencyId: string): Promise<Client[]> {
    const q = query(
      collection(db, this.COLLECTION),
      where('agencyId', '==', agencyId),
      orderBy('name', 'asc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Client));
  }

  /**
   * Atualizar cliente
   */
  static async updateClient(
    clientId: string,
    data: Partial<Omit<Client, 'id' | 'agencyId' | 'createdAt' | 'createdBy'>>
  ): Promise<void> {
    const docRef = doc(db, this.COLLECTION, clientId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  }

  /**
   * Deletar cliente
   */
  static async deleteClient(clientId: string): Promise<void> {
    const docRef = doc(db, this.COLLECTION, clientId);
    await deleteDoc(docRef);
  }

  /**
   * Incrementar contador de PIs
   */
  static async incrementPICount(clientId: string, increment: number = 1): Promise<void> {
    const client = await this.getClient(clientId);
    if (!client) return;

    const docRef = doc(db, this.COLLECTION, clientId);
    await updateDoc(docRef, {
      piCount: (client.piCount || 0) + increment,
      updatedAt: Timestamp.now(),
    });
  }

  /**
   * Buscar clientes ativos de uma agência
   */
  static async listActiveClients(agencyId: string): Promise<Client[]> {
    const q = query(
      collection(db, this.COLLECTION),
      where('agencyId', '==', agencyId),
      where('status', '==', 'active'),
      orderBy('name', 'asc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Client));
  }
}

export default ClientService;
