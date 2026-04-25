import { useMemo, useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAgendamentoStore } from '../../store/useAgendamentoStore';
import { useModalCancelamentoStore } from '../../store/useModalCancelamentoStore'

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '../ui/button';
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { AgendamentoListSkeleton } from './AgendamentoListSkeleton';

export function AgendamentoList() {
  const { agendamentos, 
          pacientes, 
          concluirAgendamento, 
          retornarParaPendente, 
          isLoading, 
          buscarPacientes,
          buscarAgendamentos } = useAgendamentoStore();

  useEffect(() => {
    buscarAgendamentos();
    buscarPacientes();
  }, []);

  const abrirModalCancelamento = useModalCancelamentoStore((state) => state.abrirModal);

  const [dataFiltro, setDataFiltro] = useState<string>(''); // Vazio = mostra todos os dias
  const [statusFiltro, setStatusFiltro] = useState<string>('todos');

  const agendamentosFiltrados = agendamentos.filter((agendamento) => {
    const passouNoFiltroData = dataFiltro 
      ? agendamento.dataAgendamento === dataFiltro 
      : true;

    let passouNoFiltroStatus = false;

    switch (statusFiltro) {
      case('todos'):
        passouNoFiltroStatus = true;
        break;
      case('pendentes'):
        passouNoFiltroStatus = agendamento.realizado === false || agendamento.realizado === undefined;
        break;
      case('concluidos'):
        passouNoFiltroStatus = agendamento.realizado === true;
        break;
      default:
        passouNoFiltroStatus = agendamento.realizado === false || agendamento.realizado === undefined;
        break;
    }

    return passouNoFiltroData && passouNoFiltroStatus;
  });

  // Lógica de agrupamento por Data e Horário
  const agendamentosAgrupados = useMemo(() => {
    const agrupamento = agendamentosFiltrados.reduce((acc, agendamento) => {
      if (!agendamento || !agendamento.dataAgendamento) {
        return acc;
      }
      // Normaliza a data para string formato YYYY-MM-DD
      const dataStr = agendamento.dataAgendamento instanceof Date
        ? format(agendamento.dataAgendamento, 'yyyy-MM-dd')
        : agendamento.dataAgendamento.toString().split('T')[0];

      if (!acc[dataStr]) {
        acc[dataStr] = {};
      }

      if (!acc[dataStr][agendamento.horaAgendamento]) {
        acc[dataStr][agendamento.horaAgendamento] = [];
      }

      acc[dataStr][agendamento.horaAgendamento].push(agendamento);
      return acc;
    }, {} as Record<string, Record<string, typeof agendamentos>>);

    return agrupamento;
  }, [agendamentosFiltrados]);

  // Ordenar as datas para mostrar os próximos agendamentos primeiro
  const datasOrdenadas = Object.keys(agendamentosAgrupados).sort();

  return (
    <div className="space-y-6 w-full max-w-2xl">
      <h2 className="text-2xl font-bold tracking-tight text-slate-800">
        Agenda de Vacinação
      </h2>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
        
        {/* Filtro de Data */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-sm font-medium text-slate-600 whitespace-nowrap">
            Filtrar por dia:
          </label>
          <Input 
            type="date" 
            value={dataFiltro} 
            onChange={(e) => setDataFiltro(e.target.value)}
            className="w-full sm:w-auto"
          />
        </div>

        {/* Filtro de Status */}
        <Tabs value={statusFiltro} onValueChange={setStatusFiltro} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
            <TabsTrigger value="concluidos">Concluídos</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-8 text-blue-500 bg-blue-50 border border-blue-200 border-dashed rounded-xl animate-pulse">
          <p className="font-medium">Sincronizando agendamentos...</p>
          <AgendamentoListSkeleton />
        </div>
      ) : agendamentosFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-slate-500 border border-dashed rounded-xl bg-slate-50">
          <p>Nenhum agendamento marcado ainda.</p>
        </div>
      ) : (
        <>
          {datasOrdenadas.map((dataStr) => {
            // Converte a string 'YYYY-MM-DD' de volta para Date ajustando o fuso
            const dataObj = parseISO(dataStr);
            const diaFormatado = format(dataObj, "EEEE, dd 'de' MMMM", { locale: ptBR });
          
            const horariosDoDia = agendamentosAgrupados[dataStr];
            const horariosOrdenados = Object.keys(horariosDoDia).sort();

            return (
              <Card key={dataStr} className="shadow-sm">
                <CardHeader className="bg-slate-50/50 border-b pb-4">
                  <CardTitle className="text-lg capitalize text-slate-700">
                    {diaFormatado}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {horariosOrdenados.map((horario, index) => {
                    const pacientesDoHorario = horariosDoDia[horario];

                    return (
                      <div key={horario}>
                        <div className="flex items-start gap-4">
                          <Badge variant="secondary" className="text-sm px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-100">
                            {horario}
                          </Badge>

                          {/* Lista de pacientes daquele horário */}
                          <div className="flex-1 space-y-3">
                            {pacientesDoHorario.map((item, idx)  => {
                              const pacienteDados = pacientes.find(p => p.id === item.idPaciente);
                              const nomeExibicao = pacienteDados ? pacienteDados.nome : "Paciente Desconhecido";
                              const isConcluido = item.realizado === true;
                            
                              return (

                              <div key={item.id} className={`flex justify-between items-center text-sm ${isConcluido ? 'bg-emerald-50/70 border border-emerald-100' : 'bg-transparent'}`}>
                                <div className="flex flex-col">
                                  <span className={`font-medium ${isConcluido ? 'text-emerald-700 line-through decoration-emerald-500 decoration-2 opacity-80' : 'text-slate-700'}`}>{nomeExibicao}</span>
                                  <span className={`text-xs ${isConcluido ? 'text-emerald-600/70' : 'text-slate-500'} text-slate-500 text-xs`}>CPF: {pacienteDados?.cpf}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                  {!isConcluido ? (
                                    <>
                                      <Badge variant="outline" className="text-xs">
                                        {idx + 1}ª Vaga
                                      </Badge>
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-8 w-8"
                                        onClick={() => concluirAgendamento(item.id)}
                                        title="Marcar como Concluído"
                                      >
                                        <CheckCircle2 className="w-5 h-5" />
                                      </Button>
                                      
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                                        onClick={() => abrirModalCancelamento({
                                          id: item.id,
                                          nomePaciente: nomeExibicao,
                                          cpf: pacienteDados?.cpf,
                                          data: format(item.dataAgendamento, 'dd/MM/yyyy'),
                                          horario: item.horaAgendamento
                                        })}
                                        title="Cancelar Agendamento"
                                      >
                                        <XCircle className="w-5 h-5" />
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none text-xs">
                                        Vacinado
                                      </Badge>
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 h-8 w-8"
                                        onClick={() => retornarParaPendente(item.id)}
                                        title="Desfazer (retornar para pendente)"
                                      >
                                        <RotateCcw className="w-4 h-4" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                            })}
                          </div>
                        </div>
                        
                        {index < horariosOrdenados.length - 1 && (
                          <Separator className="my-4" />
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </>
      )}
    </div>
  );
}