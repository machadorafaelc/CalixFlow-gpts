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
import { Team, TeamMember, Department, TeamRole } from '../types/firestore';

export class TeamService {
  private static COLLECTION = 'teams';
  private static MEMBERS_COLLECTION = 'team_members';

  /**
   * Criar novo time
   */
  static async createTeam(data: {
    agencyId: string;
    clientId: string;
    department: Department;
    createdBy: string;
  }): Promise<string> {
    const teamData: Omit<Team, 'id'> = {
      agencyId: data.agencyId,
      clientId: data.clientId,
      department: data.department,
      members: {
        gerente: [],
        supervisor: [],
        coordenador: [],
        analista: [],
      },
      createdAt: Timestamp.now(),
      createdBy: data.createdBy,
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, this.COLLECTION), teamData);
    return docRef.id;
  }

  /**
   * Buscar time por ID
   */
  static async getTeam(teamId: string): Promise<Team | null> {
    const docRef = doc(db, this.COLLECTION, teamId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Team;
  }

  /**
   * Listar times de um cliente
   */
  static async listTeamsByClient(clientId: string): Promise<Team[]> {
    const q = query(
      collection(db, this.COLLECTION),
      where('clientId', '==', clientId),
      orderBy('department', 'asc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Team));
  }

  /**
   * Listar times de uma agência
   */
  static async listTeamsByAgency(agencyId: string): Promise<Team[]> {
    const q = query(
      collection(db, this.COLLECTION),
      where('agencyId', '==', agencyId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Team));
  }

  /**
   * Buscar time específico de um cliente e departamento
   */
  static async getTeamByClientAndDepartment(
    clientId: string,
    department: Department
  ): Promise<Team | null> {
    const q = query(
      collection(db, this.COLLECTION),
      where('clientId', '==', clientId),
      where('department', '==', department)
    );

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as Team;
  }

  /**
   * Adicionar membro ao time
   */
  static async addMember(
    teamId: string,
    userId: string,
    role: TeamRole,
    addedBy: string
  ): Promise<void> {
    const team = await this.getTeam(teamId);
    if (!team) throw new Error('Time não encontrado');

    // Adicionar ao array do cargo
    const updatedMembers = { ...team.members };
    if (!updatedMembers[role].includes(userId)) {
      updatedMembers[role] = [...updatedMembers[role], userId];
    }

    // Atualizar time
    const docRef = doc(db, this.COLLECTION, teamId);
    await updateDoc(docRef, {
      members: updatedMembers,
      updatedAt: Timestamp.now(),
    });

    // Criar registro de membro
    const memberData: Omit<TeamMember, 'id'> = {
      userId,
      teamId,
      clientId: team.clientId,
      department: team.department,
      role,
      addedAt: Timestamp.now(),
      addedBy,
    };

    await addDoc(collection(db, this.MEMBERS_COLLECTION), memberData);
  }

  /**
   * Remover membro do time
   */
  static async removeMember(
    teamId: string,
    userId: string,
    role: TeamRole
  ): Promise<void> {
    const team = await this.getTeam(teamId);
    if (!team) throw new Error('Time não encontrado');

    // Remover do array do cargo
    const updatedMembers = { ...team.members };
    updatedMembers[role] = updatedMembers[role].filter(id => id !== userId);

    // Atualizar time
    const docRef = doc(db, this.COLLECTION, teamId);
    await updateDoc(docRef, {
      members: updatedMembers,
      updatedAt: Timestamp.now(),
    });

    // Deletar registro de membro
    const q = query(
      collection(db, this.MEMBERS_COLLECTION),
      where('teamId', '==', teamId),
      where('userId', '==', userId),
      where('role', '==', role)
    );

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (docSnapshot) => {
      await deleteDoc(doc(db, this.MEMBERS_COLLECTION, docSnapshot.id));
    });
  }

  /**
   * Listar times de um usuário
   */
  static async listTeamsByUser(userId: string): Promise<TeamMember[]> {
    const q = query(
      collection(db, this.MEMBERS_COLLECTION),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as TeamMember));
  }

  /**
   * Verificar se usuário está em um time
   */
  static async isUserInTeam(teamId: string, userId: string): Promise<boolean> {
    const team = await this.getTeam(teamId);
    if (!team) return false;

    return Object.values(team.members).some(members => members.includes(userId));
  }

  /**
   * Obter cargo do usuário no time
   */
  static async getUserRoleInTeam(teamId: string, userId: string): Promise<TeamRole | null> {
    const team = await this.getTeam(teamId);
    if (!team) return null;

    for (const [role, members] of Object.entries(team.members)) {
      if (members.includes(userId)) {
        return role as TeamRole;
      }
    }

    return null;
  }

  /**
   * Deletar time
   */
  static async deleteTeam(teamId: string): Promise<void> {
    // Deletar registros de membros
    const q = query(
      collection(db, this.MEMBERS_COLLECTION),
      where('teamId', '==', teamId)
    );

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (docSnapshot) => {
      await deleteDoc(doc(db, this.MEMBERS_COLLECTION, docSnapshot.id));
    });

    // Deletar time
    const docRef = doc(db, this.COLLECTION, teamId);
    await deleteDoc(docRef);
  }

  /**
   * Copiar time para outro cliente
   */
  static async copyTeam(
    sourceTeamId: string,
    targetClientId: string,
    createdBy: string
  ): Promise<string> {
    const sourceTeam = await this.getTeam(sourceTeamId);
    if (!sourceTeam) throw new Error('Time de origem não encontrado');

    // Criar novo time com os mesmos membros
    const newTeamData: Omit<Team, 'id'> = {
      agencyId: sourceTeam.agencyId,
      clientId: targetClientId,
      department: sourceTeam.department,
      members: { ...sourceTeam.members },
      createdAt: Timestamp.now(),
      createdBy,
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, this.COLLECTION), newTeamData);
    const newTeamId = docRef.id;

    // Criar registros de membros
    for (const [role, userIds] of Object.entries(sourceTeam.members)) {
      for (const userId of userIds) {
        const memberData: Omit<TeamMember, 'id'> = {
          userId,
          teamId: newTeamId,
          clientId: targetClientId,
          department: sourceTeam.department,
          role: role as TeamRole,
          addedAt: Timestamp.now(),
          addedBy: createdBy,
        };

        await addDoc(collection(db, this.MEMBERS_COLLECTION), memberData);
      }
    }

    return newTeamId;
  }
}

export default TeamService;
