import { useQuery } from "@tanstack/react-query";

export interface User {
  id: string;
  username: string;
  role: string;
  name?: string;
  email?: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
}

export type UserRole = 'admin' | 'staff' | 'viewer';

export interface RolePermissions {
  canManageTeam: boolean;
  canManageSettings: boolean;
  canManageWebsiteSettings: boolean;
  canManageEmailSettings: boolean;
  canEditLeads: boolean;
  canDeleteLeads: boolean;
  canViewReports: boolean;
  canManageVendors: boolean;
  canManageEvents: boolean;
  canManageClients: boolean;
  isReadOnly: boolean;
}

const rolePermissions: Record<UserRole, RolePermissions> = {
  admin: {
    canManageTeam: true,
    canManageSettings: true,
    canManageWebsiteSettings: true,
    canManageEmailSettings: true,
    canEditLeads: true,
    canDeleteLeads: true,
    canViewReports: true,
    canManageVendors: true,
    canManageEvents: true,
    canManageClients: true,
    isReadOnly: false,
  },
  staff: {
    canManageTeam: false,
    canManageSettings: false,
    canManageWebsiteSettings: false,
    canManageEmailSettings: false,
    canEditLeads: true,
    canDeleteLeads: false,
    canViewReports: true,
    canManageVendors: true,
    canManageEvents: true,
    canManageClients: true,
    isReadOnly: false,
  },
  viewer: {
    canManageTeam: false,
    canManageSettings: false,
    canManageWebsiteSettings: false,
    canManageEmailSettings: false,
    canEditLeads: false,
    canDeleteLeads: false,
    canViewReports: true,
    canManageVendors: false,
    canManageEvents: false,
    canManageClients: false,
    isReadOnly: true,
  },
};

export function useAuth() {
  const { data, isLoading, error } = useQuery<AuthResponse>({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await fetch("/api/auth/me");
      if (!response.ok) {
        throw new Error("Not authenticated");
      }
      return response.json();
    },
    retry: false,
  });

  const user = data?.user;
  const role = (user?.role as UserRole) || 'viewer';
  const permissions = rolePermissions[role] || rolePermissions.viewer;

  return {
    user,
    role,
    permissions,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: role === 'admin',
    isStaff: role === 'staff',
    isViewer: role === 'viewer',
    error,
  };
}
