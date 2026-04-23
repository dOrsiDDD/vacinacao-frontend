import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Agendamento } from '../types/agendamento';

interface AgendamentoState {
  agendamentos: Agendamento[];
  adicionarAgendamento: (novoAgendamento: Agendamento) => void;
  concluirAgendamento: (id: string) => void;
  cancelarAgendamento: (id: string) => void;
  setAgendamentosIniciais: (agendamentosDaApi: Agendamento[]) => void;
}

export const useAgendamentoStore = create<AgendamentoState>()(
  persist(
    (set) => ({
      agendamentos: [],

      // Ações
      adicionarAgendamento: (novoAgendamento) =>
        set((state) => ({
          agendamentos: [...state.agendamentos, { ...novoAgendamento, id: crypto.randomUUID(), realizado: false }],
        })),

      concluirAgendamento: (id) =>
        set((state) => ({
          agendamentos: state.agendamentos.map((agendamento) =>
            agendamento.id === id
              ? { ...agendamento, realizado: true }
              : agendamento,
          ),
        })),

      cancelarAgendamento: (id) =>
        set((state) => ({
          agendamentos: state.agendamentos.filter((agendamento) => agendamento.id !== id
          ),
        })),

      setAgendamentosIniciais: (agendamentosDaApi) =>
        set(() => ({
          agendamentos: agendamentosDaApi,
        })),
    }),
    {
      name: 'vacinacao-storage',
    },
  ),
);