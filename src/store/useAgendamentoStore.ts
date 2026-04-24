import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Agendamento } from '../types/agendamento';
import { type Paciente } from '../types/paciente';

interface AgendamentoState {
  pacientes: Paciente[];
  agendamentos: Agendamento[];
  adicionarAgendamento: (novoAgendamento: Omit<Agendamento, 'id' | 'realizado'>) => void;
  adicionarPaciente: (paciente: Paciente) => void;
  concluirAgendamento: (id: string) => void;
  retornarParaPendente: (id: string) => void;
  cancelarAgendamento: (id: string) => void;
  setAgendamentosIniciais: (agendamentosDaApi: Agendamento[]) => void;
}

export const useAgendamentoStore = create<AgendamentoState>()(
  persist(
    (set) => ({
      pacientes: [],
      agendamentos: [],

      // Ações
      adicionarPaciente: (paciente) =>
        set((state) => ({
          pacientes: [...state.pacientes, paciente],
        })),

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

      retornarParaPendente: (id) => 
        set((state) => ({
          agendamentos: state.agendamentos.map((agendamento) =>
            agendamento.id === id 
            ? { ...agendamento, realizado: false } 
            : agendamento
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