import { useMemo, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { CalendarIcon } from 'lucide-react'

import { agendamentoSchema, type AgendamentoFormData } from './AgendamentoSchema';
import { useAgendamentoStore } from '../../store/useAgendamentoStore';
import { cn } from '../../lib/utils';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

const TODOS_OS_HORARIOS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
];

export function AgendamentoForm() {
  const { agendamentos, adicionarAgendamento } = useAgendamentoStore();

  const form = useForm<AgendamentoFormData>({
    resolver: zodResolver(agendamentoSchema),
    defaultValues: {
      nome: '',
      cpf: '',
      horarioAgendamento: '',
    }
  });

  const dataSelecionada = useWatch({ control: form.control, name: 'dataAgendamento' });

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
    form.setValue('horarioAgendamento', '');
  }, [dataSelecionada, form]);

  const onSubmit = async (data: AgendamentoFormData) => {
    const novoAgendamento = {
      nome: data.nome,
      cpf: data.cpf,
      dataNascimento: format(data.dataNascimento, 'yyyy-MM-dd'),
      dataAgendamento: format(data.dataAgendamento, 'yyyy-MM-dd'),
      horarioAgendamento: data.horarioAgendamento,
      realizado: false,
      id: Date.now().toString(),
    };

    console.log('Dados prontos para envio:', novoAgendamento);

    adicionarAgendamento(novoAgendamento);
    form.reset();

    console.log('Agendamento realizado com sucesso!');
  };

  return (
    <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-md w-full p-6 bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Paciente</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome do paciente" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
            control={form.control}
            name="cpf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF (apenas números)</FormLabel>
                <FormControl>
                  <Input placeholder="12345678901" maxLength={11} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dataNascimento"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data de Nascimento</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "dd/MM/yyyy") : <span>Selecione a data</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dataAgendamento"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data do Agendamento</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "dd/MM/yyyy") : <span>Selecione o dia</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="horarioAgendamento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário</FormLabel>
                <Select 
                  disabled={!dataSelecionada || horariosDisponiveis.length === 0} 
                  onValueChange={field.onChange} 
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !dataSelecionada 
                          ? 'Selecione a data primeiro' 
                          : horariosDisponiveis.length === 0 
                            ? 'Todos os horários lotados!' 
                            : 'Selecione o horário'
                      } />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {horariosDisponiveis.map((hora) => (
                      <SelectItem key={hora} value={hora}>{hora}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={form.formState.isSubmitting || horariosDisponiveis.length === 0}
        >
          {form.formState.isSubmitting ? 'Salvando...' : 'Agendar Vacinação'}
        </Button>
      </form>
    </Form>
  );
}

