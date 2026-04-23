import { useMemo, useEffect } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

import 'react-datepicker/dist/react-datepicker.css';

import { agendamentoSchema, type AgendamentoFormData } from './AgendamentoSchema';
import { useAgendamentoStore } from '../../store/useAgendamentoStore';

const TODOS_OS_HORARIOS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00'
];

export function AgendamentoForm() {
  const { agendamentos } = useAgendamentoStore();

  const {
    register,
    control,
    handleSubmit,
    setValue, 
    formState: { errors, isSubmitting },
  } = useForm<AgendamentoFormData>({
    resolver: zodResolver(agendamentoSchema),
  });

  const dataSelecionada = useWatch({ control, name: 'dataAgendamento' });

  const horariosDisponiveis = useMemo(() => {
    if (!dataSelecionada) return TODOS_OS_HORARIOS;

    const dataFormatada = format(dataSelecionada, 'yyyy-MM-dd');

    // 1. Filtra os agendamentos que já existem para este dia específico
    const agendamentosDoDia = agendamentos.filter((ag) => {
      // Como a data na store pode ser string ou Date, formatamos para comparar com segurança
      const dataAgString = ag.dataAgendamento instanceof Date 
        ? format(ag.dataAgendamento, 'yyyy-MM-dd') 
        : ag.dataAgendamento.toString().split('T')[0]; // Pega só a parte da data se for ISO string
      
      return dataAgString === dataFormatada;
    });

    // 2. Conta quantas vagas estão ocupadas por horário (Ex: { "08:00": 2, "09:00": 1 })
    const contagemPorHora = agendamentosDoDia.reduce((acc, ag) => {
      acc[ag.horarioAgendamento] = (acc[ag.horarioAgendamento] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 3. Retorna apenas os horários que têm menos de 2 ocupantes
    return TODOS_OS_HORARIOS.filter((hora) => {
      const ocupantes = contagemPorHora[hora] || 0;
      return ocupantes < 2;
    });
  }, [dataSelecionada, agendamentos]);

  // Efeito de segurança: se o usuário escolher um horário, mas depois trocar a data
  // para um dia em que aquele horário já está lotado, limpa o campo 
  useEffect(() => {
    setValue('horarioAgendamento', '');
  }, [dataSelecionada, setValue]);

  const onSubmit = async (data: AgendamentoFormData) => {
    const payloadParaApi = {
      nome: data.nome,
      cpf: data.cpf,
      dataNascimento: format(data.dataNascimento, 'yyyy-MM-dd'),
      dataAgendamento: format(data.dataAgendamento, 'yyyy-MM-dd'),
      horarioAgendamento: data.horarioAgendamento,
    };

    console.log('Dados prontos para envio:', payloadParaApi);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
      
      <div>
        <label>Nome do Paciente</label>
        <input type="text" {...register('nome')} placeholder="Ex: João da Silva" />
        {errors.nome && <span style={{ color: 'red' }}>{errors.nome.message}</span>}
      </div>

      <div>
        <label>CPF (apenas números)</label>
        <input type="text" maxLength={11} {...register('cpf')} placeholder="12345678901" />
        {errors.cpf && <span style={{ color: 'red' }}>{errors.cpf.message}</span>}
      </div>

      <div>
        <label>Data de Nascimento</label>
        <Controller
          control={control}
          name="dataNascimento"
          render={({ field }) => (
            <DatePicker
              selected={field.value}
              onChange={(date: Date | null) => field.onChange(date)}
              dateFormat="dd/MM/yyyy"
              locale={ptBR}
              placeholderText="Selecione a data"
            />
          )}
        />
        {errors.dataNascimento && <span style={{ color: 'red' }}>{errors.dataNascimento.message}</span>}
      </div>

      <div>
        <label>Data do Agendamento</label>
        <Controller
          control={control}
          name="dataAgendamento"
          render={({ field }) => (
            <DatePicker
              selected={field.value}
              onChange={(date: Date | null) => field.onChange(date)}
              dateFormat="dd/MM/yyyy"
              minDate={new Date()}
              locale={ptBR}
              placeholderText="Selecione o dia"
            />
          )}
        />
        {errors.dataAgendamento && <span style={{ color: 'red' }}>{errors.dataAgendamento.message}</span>}
      </div>

      <div>
        <label>Horário</label>
        <select {...register('horarioAgendamento')} disabled={!dataSelecionada || horariosDisponiveis.length === 0}>
          <option value="">
            {!dataSelecionada 
              ? 'Selecione a data primeiro...' 
              : horariosDisponiveis.length === 0 
                ? 'Todos os horários lotados!' 
                : 'Selecione...'}
          </option>
          {horariosDisponiveis.map((hora) => (
            <option key={hora} value={hora}>
              {hora}
            </option>
          ))}
        </select>
        {errors.horarioAgendamento && <span style={{ color: 'red' }}>{errors.horarioAgendamento.message}</span>}
      </div>

      <button type="submit" disabled={isSubmitting || horariosDisponiveis.length === 0}>
        {isSubmitting ? 'Salvando...' : 'Agendar Vacinação'}
      </button>
    </form>
  );
}