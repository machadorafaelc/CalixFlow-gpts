import { useAuth } from '../contexts/AuthContext';

export type Permission = 
  | 'view_all_agencies'
  | 'manage_agencies'
  | 'manage_gpts'
  | 'assign_gpts'
  | 'manage_all_users'
  | 'manage_agency_users'
  | 'view_global_dashboard'
  | 'view_agency_dashboard';

export function usePermissions() {
  const { user } = useAuth();

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;

    const role = user.role;

    switch (permission) {
      case 'view_all_agencies':
      case 'manage_agencies':
      case 'manage_gpts':
      case 'assign_gpts':
      case 'manage_all_users':
      case 'view_global_dashboard':
        return role === 'super_admin';

      case 'manage_agency_users':
      case 'view_agency_dashboard':
        return role === 'super_admin' || role === 'agency_admin';

      default:
        return false;
    }
  };

  const isSuperAdmin = (): boolean => {
    return user?.role === 'super_admin';
  };

  const isAgencyAdmin = (): boolean => {
    return user?.role === 'agency_admin';
  };

  const isUser = (): boolean => {
    return user?.role === 'user';
  };

  const canAccessGPT = (gptId: string): boolean => {
    // TODO: Implementar verificação de acesso a GPT específico
    // Por enquanto, retorna true se o usuário estiver autenticado
    return !!user;
  };

  return {
    hasPermission,
    isSuperAdmin,
    isAgencyAdmin,
    isUser,
    canAccessGPT
  };
}
