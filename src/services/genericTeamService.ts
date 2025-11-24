/**
 * Generic Team Service
 * 
 * Serviço para gerenciar equipes genéricas (não vinculadas a projetos)
 * Diferente do TeamService que gerencia times de projetos com hierarchy
 */

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
import { Team, TeamMember } from '../types/firestore';

export class GenericTeamService {
  private static COLLECTION = 'generic_teams';
  private static MEMBERS_COLLECTION = 'generic_team_members';

  /**
   * Criar nova equipe genérica
   */
  static async createTeam(
    name: string,
    description: string,
    createdBy: string,
    clientIds: string[] = []
  ): Promise<string> {
    const teamData: Omit<Team, 'id'> = {
      name,
      description,
      createdAt: Timestamp.now(),
      createdBy,
      updatedAt: Timestamp.now(),
      memberCount: 1, // Criador é o primeiro membro
      clientIds,
    };

    const docRef = await addDoc(collection(db, this.COLLECTION), teamData);
    
    // Adicionar criador como admin
    await this.addMember(docRef.id, createdBy, 'admin', createdBy, '', '');
    
    return docRef.id;
  }

  /**
   * Buscar equipe por ID
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
   * Listar equipes de um usuário
   */
  static async listUserTeams(userId: string): Promise<Team[]> {
    // Buscar memberships do usuário
    const membersQuery = query(
      collection(db, this.MEMBERS_COLLECTION),
      where('userId', '==', userId)
    );

    const membersSnapshot = await getDocs(membersQuery);
    const teamIds = membersSnapshot.docs.map(doc => doc.data().teamId);

    if (teamIds.length === 0) {
      return [];
    }

    // Buscar teams
    const teams: Team[] = [];
    for (const teamId of teamIds) {
      const team = await this.getTeam(teamId);
      if (team) {
        teams.push(team);
      }
    }

    return teams.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
  }

  /**
   * Listar membros de uma equipe
   */
  static async listTeamMembers(teamId: string): Promise<TeamMember[]> {
    const q = query(
      collection(db, this.MEMBERS_COLLECTION),
      where('teamId', '==', teamId),
      orderBy('addedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as TeamMember));
  }

  /**
   * Adicionar membro à equipe
   */
  static async addMember(
    teamId: string,
    userId: string,
    role: 'admin' | 'editor' | 'viewer',
    addedBy: string,
    userEmail: string,
    userDisplayName: string = ''
  ): Promise<void> {
    const memberData: Omit<TeamMember, 'id'> = {
      teamId,
      userId,
      role,
      addedAt: Timestamp.now(),
      addedBy,
      userEmail,
      userDisplayName,
    };

    await addDoc(collection(db, this.MEMBERS_COLLECTION), memberData);

    // Atualizar memberCount
    const team = await this.getTeam(teamId);
    if (team) {
      const docRef = doc(db, this.COLLECTION, teamId);
      await updateDoc(docRef, {
        memberCount: team.memberCount + 1,
        updatedAt: Timestamp.now(),
      });
    }
  }

  /**
   * Atualizar role de um membro
   */
  static async updateMemberRole(
    memberId: string,
    newRole: 'admin' | 'editor' | 'viewer'
  ): Promise<void> {
    const docRef = doc(db, this.MEMBERS_COLLECTION, memberId);
    await updateDoc(docRef, {
      role: newRole,
    });
  }

  /**
   * Remover membro da equipe
   */
  static async removeMember(memberId: string, teamId: string): Promise<void> {
    // Deletar membro
    const docRef = doc(db, this.MEMBERS_COLLECTION, memberId);
    await deleteDoc(docRef);

    // Atualizar memberCount
    const team = await this.getTeam(teamId);
    if (team) {
      const teamDocRef = doc(db, this.COLLECTION, teamId);
      await updateDoc(teamDocRef, {
        memberCount: Math.max(0, team.memberCount - 1),
        updatedAt: Timestamp.now(),
      });
    }
  }

  /**
   * Atualizar informações da equipe
   */
  static async updateTeam(
    teamId: string,
    data: Partial<Pick<Team, 'name' | 'description' | 'clientIds'>>
  ): Promise<void> {
    const docRef = doc(db, this.COLLECTION, teamId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  }

  /**
   * Deletar equipe
   */
  static async deleteTeam(teamId: string): Promise<void> {
    // Deletar todos os membros
    const membersQuery = query(
      collection(db, this.MEMBERS_COLLECTION),
      where('teamId', '==', teamId)
    );

    const membersSnapshot = await getDocs(membersQuery);
    const deletePromises = membersSnapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );
    await Promise.all(deletePromises);

    // Deletar equipe
    const docRef = doc(db, this.COLLECTION, teamId);
    await deleteDoc(docRef);
  }

  /**
   * Verificar se usuário é membro de uma equipe
   */
  static async isUserInTeam(teamId: string, userId: string): Promise<boolean> {
    const q = query(
      collection(db, this.MEMBERS_COLLECTION),
      where('teamId', '==', teamId),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }

  /**
   * Obter role do usuário na equipe
   */
  static async getUserRole(teamId: string, userId: string): Promise<'admin' | 'editor' | 'viewer' | null> {
    const q = query(
      collection(db, this.MEMBERS_COLLECTION),
      where('teamId', '==', teamId),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }

    const memberData = querySnapshot.docs[0].data() as TeamMember;
    return memberData.role;
  }

  /**
   * Obter badge de role
   */
  static getRoleBadge(role: 'admin' | 'editor' | 'viewer'): { label: string; color: string } {
    const badges = {
      admin: { label: 'Admin', color: 'bg-purple-100 text-purple-700' },
      editor: { label: 'Editor', color: 'bg-blue-100 text-blue-700' },
      viewer: { label: 'Viewer', color: 'bg-gray-100 text-gray-700' },
    };
    return badges[role];
  }

  /**
   * Obter descrição de role
   */
  static getRoleDescription(role: 'admin' | 'editor' | 'viewer'): string {
    const descriptions = {
      admin: 'Controle total sobre a equipe, incluindo adicionar/remover membros',
      editor: 'Pode criar e editar conteúdo, mas não gerenciar membros',
      viewer: 'Apenas visualizar conteúdo, sem permissões de edição',
    };
    return descriptions[role];
  }
}

export default GenericTeamService;
