import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Agendamento } from '../types/agendamento';
import { type Paciente } from '../types/paciente';
import { api } from '../services/api';
import { statusEnum } from '@/types/statusEnum'

interface AgendamentoState {
  pacientes: Paciente[];
  agendamentos: Agendamento[];
  isLoading: boolean;

  buscarAgendamentos: () => Promise<void>;
  buscarPacientes: () => Promise<void>;
  adicionarAgendamento: (novoAgendamento : Omit<Agendamento, 'id'>) => Promise<void>;
  adicionarPaciente: (paciente: Omit<Paciente, 'id'>) => Promise<Paciente>;
  concluirAgendamento: (id: number) => Promise<void>;
  retornarParaPendente: (id: number) => Promise<void>;
  cancelarAgendamento: (id: number) => Promise<void>;
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
          const response = await api.get('/CadastroPaciente/ListarPacientes');
          set({ pacientes: response.data });
        } catch (error) {
          console.error("Erro ao buscar pacientes", error);
        } finally {
          set({ isLoading: false });
        }
      },

      buscarAgendamentos: async () => {
        set({ isLoading: true });
        try {
          const response = await api.get('/CadastroAgendamento/ListarAgendamentos');
          set({ agendamentos: response.data });
        } catch (error) {
          console.error("Erro ao buscar agendamentos", error);
        } finally {
          set({ isLoading: false });
        }
      },  
      adicionarPaciente: async (paciente) => {
        try {
          const pacienteFormatado = {
            ...paciente,
            dataNascimento: typeof paciente.dataNascimento === 'string' ? paciente.dataNascimento : paciente.dataNascimento.toISOString().split('T')[0],
          };
          const response = await api.post('/CadastroPaciente/CadastrarPaciente', pacienteFormatado);
          const pacienteCadastrado: Paciente = response.data;
          set((state) => ({
            pacientes: [...state.pacientes, pacienteCadastrado] 
          }));
          return pacienteCadastrado;
        } catch (error) {
          console.error("Erro ao cadastrar paciente", error);
          throw error;
        }
      },

      adicionarAgendamento: async (novoAgendamento) => {
        try {
          const agendamentoFormatado = {
            ...novoAgendamento,
            dataAgendamento: typeof novoAgendamento.dataAgendamento === 'string' ? novoAgendamento.dataAgendamento : novoAgendamento.dataAgendamento.toISOString().split('T')[0],
          };
          const response = await api.post('/CadastroAgendamento/CadastrarAgendamento', agendamentoFormatado);
          set((state) => ({
            agendamentos: [...state.agendamentos, response.data]
          }));
        } catch (error) {
          console.error("Erro ao agendar", error);
        }
      },

      concluirAgendamento: async (id) => {
        try {
          await api.put(`/CadastroAgendamento/AtualizarStatus?id=${id}`, statusEnum.Concluido );
          
          set((state) => ({
            agendamentos: state.agendamentos.map((a) =>
              a.id === id ? { ...a, status: 2 } : a
            ),
          }));
        } catch (error) {
          console.error("Erro ao concluir", error);
        }
      },

      retornarParaPendente: async (id) => {
        try {
          await api.put(`/CadastroAgendamento/AtualizarStatus?id=${id}`, statusEnum.Pendente);
          
          set((state) => ({
            agendamentos: state.agendamentos.map((a) =>
              a.id === id ? { ...a, status: 1 } : a
            ),
          }));
        } catch (error) {
          console.error("Erro ao concluir", error);
        }
      },

      cancelarAgendamento: async (id) => {
        try {
          await api.delete(`/CadastroAgendamento/DeletarAgendamento?id=${id}`);
          
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