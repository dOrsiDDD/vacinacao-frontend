import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Agendamento } from '../types/agendamento';
import { type Paciente } from '../types/paciente';
import { AgendamentoService } from '@/services/agendamentoService';

interface AgendamentoState {
  pacientes: Paciente[];
  agendamentos: Agendamento[];
  isLoading: boolean;
  adicionarPaciente:(paciente: Omit<Paciente, 'id'>) => Promise<Paciente>;
  adicionarAgendamento: (agendamento: Omit<Agendamento, 'id'>) => Promise<Agendamento>;
}

export const useAgendamentoStore = create<AgendamentoState>()(
  persist(
    (set) => ({
      pacientes: [],
      agendamentos: [],
      isLoading: false,

      // Ações
      buscarPacientes: async () => {
        set({ isLoading: true });
        try {
          const dados = await AgendamentoService.buscarPacientes();
          set({ pacientes: dados });
        } catch (error) {
          console.error("Erro ao buscar pacientes", error);
        } finally {
          set({ isLoading: false });
        }
      },

      buscarAgendamentos: async () => {
        set({ isLoading: true });
        try {
          const dados = await AgendamentoService.buscarAgendamentos();
          set({ agendamentos: dados });
        } catch (error) {
          console.error("Erro ao buscar agendamentos", error);
        } finally {
          set({ isLoading: false });
        }
      },  
      adicionarPaciente: async (paciente: Omit<Paciente, 'id'>) => {
        try {
          const dados = await AgendamentoService.adicionarPaciente(paciente);
          const pacienteCadastrado: Paciente = dados;
          set((state) => ({
            pacientes: [...state.pacientes, pacienteCadastrado] 
          }));
          return pacienteCadastrado;
        } catch (error) {
          console.error("Erro ao cadastrar paciente", error);
          throw error;
        }
      },

      adicionarAgendamento: async (agendamento: Omit<Agendamento, 'id'>) => {
        try {
          const dados = await AgendamentoService.adicionarAgendamento(agendamento);
          set((state) => ({
            agendamentos: [...state.agendamentos, dados]
          }));
          return dados;
        } catch (error) {
          console.error("Erro ao agendar", error);
          throw error;
        }
      },

      concluirAgendamento: async (id: number) => {
        try {
          await AgendamentoService.concluirAgendamento(id);
          set((state) => ({
            agendamentos: state.agendamentos.map((a) =>
              a.id === id ? { ...a, status: 2 } : a
            ),
          }));
        } catch (error) {
          console.error("Erro ao concluir", error);
        }
      },

      retornarParaPendente: async (id: number) => {
        try {
          await AgendamentoService.retornarParaPendente(id);
          set((state) => ({
            agendamentos: state.agendamentos.map((a) =>
              a.id === id ? { ...a, status: 1 } : a
            ),
          }));
        } catch (error) {
          console.error("Erro ao concluir", error);
        }
      },

      cancelarAgendamento: async (id: number) => {
        try {
          await AgendamentoService.cancelarAgendamento(id);
          set((state) => ({
            agendamentos: state.agendamentos.filter((a) => a.id !== id),
          }));
        } catch (error) {
          console.error("Erro ao deletar", error);
        }
      },
    }),
    {
      name: 'vacinacao-storage',
    },
  ),
);