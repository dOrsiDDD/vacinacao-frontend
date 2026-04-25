import { useMemo, useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { CalendarIcon } from 'lucide-react'

import { agendamentoSchema, type AgendamentoFormData } from './AgendamentoSchema';
import { cadastroPacienteSchema, type CadastroPacienteFormData } from './CadastroPacientesSchema';
import { useAgendamentoStore } from '../../store/useAgendamentoStore';
import { useModalSucessoStore } from '@/store/useModalSucessoStore';
import { cn } from '../../lib/utils';

import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const TODOS_OS_HORARIOS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
];

export function AgendamentoForm() {
  const { agendamentos, pacientes, adicionarAgendamento, adicionarPaciente } = useAgendamentoStore();

  const abrirModalSucesso = useModalSucessoStore((state) => state.abrirModal);
  const [modalAberto, setModalAberto] = useState(false);
  const [dadosPendentes, setDadosPendentes] = useState<AgendamentoFormData | null>(null);

  const formPrincipal = useForm<AgendamentoFormData>({
    resolver: zodResolver(agendamentoSchema),
    defaultValues: {
      cpf: '',
      horaAgendamento: '',
    }
  });

  const formModal = useForm<CadastroPacienteFormData>({
    resolver: zodResolver(cadastroPacienteSchema),
    defaultValues: {
      nome: "",
      dataNascimento: ""
    }
  });

  const dataSelecionada = useWatch({ control: formPrincipal.control, name: 'dataAgendamento' });

  const horariosDisponiveis = useMemo(() => {
    if (!dataSelecionada) return TODOS_OS_HORARIOS;

    const dataFormatada = format(dataSelecionada, 'yyyy-MM-dd');

    // 1. Filtra os agendamentos que já existem para este dia específico
    const agendamentosDoDia = agendamentos.filter((ag) => {
      if (!ag || !ag.dataAgendamento) {
        return false; 
      }
      // Como a data na store pode ser string ou Date, formatamos para comparar com segurança
      const dataAgString = ag.dataAgendamento instanceof Date 
        ? format(ag.dataAgendamento, 'yyyy-MM-dd') 
        : ag.dataAgendamento.toString().split('T')[0]; // Pega só a parte da data se for ISO string
      
      return dataAgString === dataFormatada;
    });

    // 2. Conta quantas vagas estão ocupadas por horário (Ex: { "08:00": 2, "09:00": 1 })
    const contagemPorHora = agendamentosDoDia.reduce((acc, ag) => {
      acc[ag.horaAgendamento] = (acc[ag.horaAgendamento] || 0) + 1;
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
    formPrincipal.setValue('horaAgendamento', '');
  }, [dataSelecionada, formPrincipal]);

  const onSubmit = async (data: AgendamentoFormData) => {
    const pacienteExiste = pacientes.find((p) => p.cpf === data.cpf);

    if (!pacienteExiste) {
      // Salva os dados do form e abre o modal para cadastrar o paciente
      setDadosPendentes(data);
      setModalAberto(true);
      return;
    }

    // Se o paciente existe, segue o fluxo normal
    executarAgendamento(data.cpf, data.dataAgendamento, data.horaAgendamento, pacienteExiste.nome);
  };

  const executarAgendamento = (cpf: string, dataAgendamento: Date, horaAgendamento: string, nome: string, idPaciente?: number) => {
    adicionarAgendamento({
      idPaciente: idPaciente || pacientes.find((p) => p.cpf === cpf)?.id,
      dataAgendamento: format(dataAgendamento, 'yyyy-MM-dd'),
      horaAgendamento: horaAgendamento,
      status: 1
    });
    
    formPrincipal.reset();
    abrirModalSucesso({
      nomePaciente: nome,
      cpf: cpf,
      data: format(dataAgendamento, 'dd/MM/yyyy'),
      horario: horaAgendamento,
    })
  };

  // --- FUNÇÃO DO BOTÃO "SALVAR" DENTRO DO MODAL ---
  const handleSalvarNovoPaciente = async (data: CadastroPacienteFormData) => {
    if (!dadosPendentes) {
      return;
    }
    try {
      // 1. Cadastra o novo paciente na base
      const novoPaciente = await adicionarPaciente({
        cpf: dadosPendentes.cpf,
        nome: data.nome,
        // Lida com o timezone criando a data a partir da string com T00:00:00
        dataNascimento: new Date(`${data.dataNascimento}T00:00:00`), 
      });

      toast.success('Paciente cadastrado com sucesso!');

      // 2. Continua o agendamento que estava pausado
      executarAgendamento(dadosPendentes.cpf, dadosPendentes.dataAgendamento, dadosPendentes.horaAgendamento, data.nome, novoPaciente.id);

      // 3. Fecha e limpa o modal
      setModalAberto(false);    
      formModal.reset()
      setDadosPendentes(null);
    } catch (error) {
      toast.error('Erro ao cadastrar paciente. Tente novamente.');
      console.error("Erro ao cadastrar paciente", error);
    }
  };

  return (
    <>
      <Form {...formPrincipal}>
      <form onSubmit={formPrincipal.handleSubmit(onSubmit)} className="space-y-6 max-w-md w-full p-6 bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="space-y-4">
          <FormField
              control={formPrincipal.control}
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
              control={formPrincipal.control}
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
              control={formPrincipal.control}
              name="horaAgendamento"
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
            disabled={formPrincipal.formState.isSubmitting || horariosDisponiveis.length === 0}
          >
            {formPrincipal.formState.isSubmitting ? 'Salvando...' : 'Agendar Vacinação'}
          </Button>
        </form>
      </Form>
      
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Paciente Não Encontrado</DialogTitle>
            <DialogDescription>
              O CPF informado não consta em nossa base. Cadastre o paciente para continuar o agendamento.
            </DialogDescription>  
          </DialogHeader>

          <Form {...formModal}>
            <form onSubmit={formModal.handleSubmit(handleSalvarNovoPaciente)} className="space-y-4 py-4">

              <div className="space-y-2">
                <FormLabel>CPF</FormLabel>
                <Input disabled value={dadosPendentes?.cpf || ""} />
              </div>

              <FormField
                control={formModal.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo do Paciente</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        placeholder="Digite o nome completo" 
                      />  
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control ={formModal.control}
                name="dataNascimento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Nascimento</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalAberto(false)}>Cancelar</Button>
              <Button type="submit">Cadastrar e Agendar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
    </>
  );
}