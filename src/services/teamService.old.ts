/**
 * Serviço de Equipes
 * 
 * Gerencia equipes, membros e permissões
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
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Team, TeamMember, TeamInvite } from '../types/firestore';

export class TeamService {
  /**
   * Criar nova equipe
   */
  static async createTeam(
    name: string,
    description: string | undefined,
    createdBy: string,
    clientIds: string[] = []
  ): Promise<string> {
    try {
      const teamData = {
        name,
        description,
        createdAt: serverTimestamp(),
        createdBy,
        updatedAt: serverTimestamp(),
        memberCount: 1,
        clientIds
      };
      
      const teamRef = await addDoc(collection(db, 'teams'), teamData);
      
      // Adicionar criador como admin
      await this.addMember(
        teamRef.id,
        createdBy,
        'admin',
        createdBy,
        '', // email será atualizado
        ''  // displayName será atualizado
      );
      
      console.log('Equipe criada:', teamRef.id);
      return teamRef.id;
      
    } catch (error) {
      console.error('Erro ao criar equipe:', error);
      throw error;
    }
  }
  
  /**
   * Obter equipe por ID
   */
  static async getTeam(teamId: string): Promise<Team | null> {
    try {
      const teamDoc = await getDoc(doc(db, 'teams', teamId));
      
      if (!teamDoc.exists()) {
        return null;
      }
      
      return {
        id: teamDoc.id,
        ...teamDoc.data()
      } as Team;
      
    } catch (error) {
      console.error('Erro ao obter equipe:', error);
      return null;
    }
  }
  
  /**
   * Listar equipes do usuário
   */
  static async listUserTeams(userId: string): Promise<Team[]> {
    try {
      // Buscar memberships do usuário
      const membersQuery = query(
        collection(db, 'teamMembers'),
        where('userId', '==', userId)
      );
      
      const membersSnapshot = await getDocs(membersQuery);
      const teamIds = membersSnapshot.docs.map(doc => doc.data().teamId);
      
      if (teamIds.length === 0) {
        return [];
      }
      
      // Buscar equipes
      const teams: Team[] = [];
      for (const teamId of teamIds) {
        const team = await this.getTeam(teamId);
        if (team) {
          teams.push(team);
        }
      }
      
      return teams.sort((a, b) => 
        b.createdAt.toMillis() - a.createdAt.toMillis()
      );
      
    } catch (error) {
      console.error('Erro ao listar equipes:', error);
      return [];
    }
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
    userDisplayName?: string
  ): Promise<string> {
    try {
      const memberData = {
        teamId,
        userId,
        role,
        addedAt: serverTimestamp(),
        addedBy,
        userEmail,
        userDisplayName
      };
      
      const memberRef = await addDoc(collection(db, 'teamMembers'), memberData);
      
      // Incrementar contador de membros
      const teamRef = doc(db, 'teams', teamId);
      const teamDoc = await getDoc(teamRef);
      const currentCount = teamDoc.data()?.memberCount || 0;
      
      await updateDoc(teamRef, {
        memberCount: currentCount + 1,
        updatedAt: serverTimestamp()
      });
      
      console.log('Membro adicionado:', memberRef.id);
      return memberRef.id;
      
    } catch (error) {
      console.error('Erro ao adicionar membro:', error);
      throw error;
    }
  }
  
  /**
   * Listar membros da equipe
   */
  static async listTeamMembers(teamId: string): Promise<TeamMember[]> {
    try {
      const membersQuery = query(
        collection(db, 'teamMembers'),
        where('teamId', '==', teamId),
        orderBy('addedAt', 'desc')
      );
      
      const membersSnapshot = await getDocs(membersQuery);
      
      return membersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TeamMember[];
      
    } catch (error) {
      console.error('Erro ao listar membros:', error);
      return [];
    }
  }
  
  /**
   * Obter role do usuário na equipe
   */
  static async getUserRole(teamId: string, userId: string): Promise<'admin' | 'editor' | 'viewer' | null> {
    try {
      const membersQuery = query(
        collection(db, 'teamMembers'),
        where('teamId', '==', teamId),
        where('userId', '==', userId)
      );
      
      const membersSnapshot = await getDocs(membersQuery);
      
      if (membersSnapshot.empty) {
        return null;
      }
      
      return membersSnapshot.docs[0].data().role as 'admin' | 'editor' | 'viewer';
      
    } catch (error) {
      console.error('Erro ao obter role:', error);
      return null;
    }
  }
  
  /**
   * Atualizar role de membro
   */
  static async updateMemberRole(
    memberId: string,
    newRole: 'admin' | 'editor' | 'viewer'
  ): Promise<void> {
    try {
      const memberRef = doc(db, 'teamMembers', memberId);
      await updateDoc(memberRef, {
        role: newRole
      });
      
      console.log('Role atualizado:', memberId, newRole);
      
    } catch (error) {
      console.error('Erro ao atualizar role:', error);
      throw error;
    }
  }
  
  /**
   * Remover membro da equipe
   */
  static async removeMember(memberId: string, teamId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'teamMembers', memberId));
      
      // Decrementar contador de membros
      const teamRef = doc(db, 'teams', teamId);
      const teamDoc = await getDoc(teamRef);
      const currentCount = teamDoc.data()?.memberCount || 1;
      
      await updateDoc(teamRef, {
        memberCount: Math.max(0, currentCount - 1),
        updatedAt: serverTimestamp()
      });
      
      console.log('Membro removido:', memberId);
      
    } catch (error) {
      console.error('Erro ao remover membro:', error);
      throw error;
    }
  }
  
  /**
   * Atualizar equipe
   */
  static async updateTeam(
    teamId: string,
    updates: {
      name?: string;
      description?: string;
      clientIds?: string[];
    }
  ): Promise<void> {
    try {
      const teamRef = doc(db, 'teams', teamId);
      await updateDoc(teamRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      console.log('Equipe atualizada:', teamId);
      
    } catch (error) {
      console.error('Erro ao atualizar equipe:', error);
      throw error;
    }
  }
  
  /**
   * Deletar equipe
   */
  static async deleteTeam(teamId: string): Promise<void> {
    try {
      // Remover todos os membros
      const members = await this.listTeamMembers(teamId);
      for (const member of members) {
        await deleteDoc(doc(db, 'teamMembers', member.id));
      }
      
      // Remover equipe
      await deleteDoc(doc(db, 'teams', teamId));
      
      console.log('Equipe deletada:', teamId);
      
    } catch (error) {
      console.error('Erro ao deletar equipe:', error);
      throw error;
    }
  }
  
  /**
   * Verificar se usuário tem permissão
   */
  static async hasPermission(
    teamId: string,
    userId: string,
    requiredRole: 'admin' | 'editor' | 'viewer'
  ): Promise<boolean> {
    try {
      const userRole = await this.getUserRole(teamId, userId);
      
      if (!userRole) {
        return false;
      }
      
      // Hierarquia de permissões: admin > editor > viewer
      const roleHierarchy = {
        'admin': 3,
        'editor': 2,
        'viewer': 1
      };
      
      return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
      
    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
      return false;
    }
  }
  
  /**
   * Obter descrição do role
   */
  static getRoleDescription(role: 'admin' | 'editor' | 'viewer'): string {
    const descriptions = {
      'admin': 'Pode gerenciar equipe, adicionar/remover membros e editar tudo',
      'editor': 'Pode criar e editar conversas e documentos',
      'viewer': 'Pode apenas visualizar conversas e documentos'
    };
    
    return descriptions[role];
  }
  
  /**
   * Obter badge de role
   */
  static getRoleBadge(role: 'admin' | 'editor' | 'viewer'): { color: string; label: string } {
    const badges = {
      'admin': { color: 'bg-red-100 text-red-800', label: 'Admin' },
      'editor': { color: 'bg-blue-100 text-blue-800', label: 'Editor' },
      'viewer': { color: 'bg-gray-100 text-gray-800', label: 'Viewer' }
    };
    
    return badges[role];
  }
}

export default TeamService;
