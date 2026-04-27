import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from "jwt-decode";
import { api } from '@/services/api'; 
import { type Usuario } from '@/types/usuario'

interface AuthState {
  token: string | null;
  usuario: Usuario | null;
  isAuthenticated: boolean;
  login: (credenciais: any) => Promise<Usuario>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      isAuthenticated: false,

      login: async (credenciais) => {
        const response = await api.post('api/Autenticacao/Login', credenciais);

        const data = response.data;

        const decoded: any = jwtDecode(data.token);
        
        set({
            token: data.token,
            usuario: {
            id: decoded.sid || 0,
            email: decoded.email || "",
            nome: decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/name"],
            perfil: decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] === "Admin" ? 1 : 2,
            login: decoded.login
            },
            isAuthenticated: true
        });

        return data;
      },

      logout: () => {
        set({ token: null, usuario: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);