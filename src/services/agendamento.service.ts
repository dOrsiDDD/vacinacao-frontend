import { api } from './api';
import type { Agendamento } from '../types/agendamento';

export const AgendamentoService = {
  listarTodos: async (): Promise<Agendamento[]> => {
    const { data } = await api.get<Agendamento[]>('/agendamentos');
    return data;
  },

  criar: async (payload: Omit<Agendamento, 'id' | 'realizado'>): Promise<Agendamento> => {
    const { data } = await api.post<Agendamento>('/agendamentos', payload);
    return data;
  },

  concluir: async (id: string): Promise<void> => {
    await api.patch(`/agendamentos/${id}/concluir`);
  }
};