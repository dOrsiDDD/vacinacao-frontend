import { api } from './api';
import type { Agendamento } from '../types/agendamento';
import type { Paciente } from '../types/paciente'
import { statusEnum } from '../types/statusEnum'

export const AgendamentoService = {

  buscarAgendamentos: async (): Promise<Agendamento[]> => {
    const { data } = await api.get('/CadastroAgendamento/ListarAgendamentos');
    return data;
  },

  buscarPacientes: async (): Promise<Paciente[]> => {
    const { data } = await api.get('/CadastroPaciente/ListarPacientes');
    return data;
  },

  adicionarPaciente: async (paciente: Omit<Paciente, 'id'>): Promise<Paciente> => {
    const pacienteFormatado = {
      ...paciente,
      dataNascimento: typeof paciente.dataNascimento === 'string' ? paciente.dataNascimento : paciente.dataNascimento.toISOString().split('T')[0],
    };
    const { data } = await api.post('/CadastroPaciente/CadastrarPaciente', pacienteFormatado);
    return data
  },

  adicionarAgendamento: async (agendamento: Omit<Agendamento, 'id'>): Promise<Agendamento> => {
    const agendamentoFormatado = {
      ...agendamento,
      dataAgendamento: typeof agendamento.dataAgendamento === 'string' ? agendamento.dataAgendamento : agendamento.dataAgendamento.toISOString().split('T')[0],
    };
    const { data } = await api.post('/CadastroAgendamento/CadastrarAgendamento', agendamentoFormatado);
    return data;
  },

  concluirAgendamento: async (id: number): Promise<void> => {
    await api.put(`/CadastroAgendamento/AtualizarStatus?id=${id}`, statusEnum.Concluido );
  },

  retornarParaPendente: async (id: number): Promise<void> => {
    await api.put(`/CadastroAgendamento/AtualizarStatus?id=${id}`, statusEnum.Pendente);
  },

  cancelarAgendamento: async (id: number): Promise<void> => {
    await api.delete(`/CadastroAgendamento/DeletarAgendamento?id=${id}`);
  }
};