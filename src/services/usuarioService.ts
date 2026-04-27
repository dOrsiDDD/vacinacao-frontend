import { api } from './api';
import { type Usuario } from '@/types/usuario'

export const UsuarioService = {

    adicionarUsuario: async (usuario: Omit<Usuario, 'perfil' | 'id'>): Promise<Usuario> => {
        const { data } = await api.post('api/CadastroUsuario/InserirUsuario', {...usuario, perfil: 2});
        return data;
    }
}
