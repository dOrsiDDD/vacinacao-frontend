import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAgendamentoStore } from '../../store/useAgendamentoStore';

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '../ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';

export function AgendamentoList() {
  const { agendamentos, pacientes,  cancelarAgendamento, concluirAgendamento } = useAgendamentoStore();

  // Lógica de agrupamento por Data e Horário
  const agendamentosAgrupados = useMemo(() => {
    const agendamentosPendentes = agendamentos.filter(a => a.realizado === false);
    const agrupamento = agendamentosPendentes.reduce((acc, agendamento) => {
      // Normaliza a data para string formato YYYY-MM-DD
      const dataStr = agendamento.dataAgendamento instanceof Date
        ? format(agendamento.dataAgendamento, 'yyyy-MM-dd')
        : agendamento.dataAgendamento.toString().split('T')[0];

      if (!acc[dataStr]) {
        acc[dataStr] = {};
      }

      if (!acc[dataStr][agendamento.horarioAgendamento]) {
        acc[dataStr][agendamento.horarioAgendamento] = [];
      }

      acc[dataStr][agendamento.horarioAgendamento].push(agendamento);
      return acc;
    }, {} as Record<string, Record<string, typeof agendamentos>>);

    return agrupamento;
  }, [agendamentos]);

  // Ordenar as datas para mostrar os próximos agendamentos primeiro
  const datasOrdenadas = Object.keys(agendamentosAgrupados).sort();

  if (agendamentos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-slate-500 border border-dashed rounded-xl bg-slate-50">
        <p>Nenhum agendamento marcado ainda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-2xl">
      <h2 className="text-2xl font-bold tracking-tight text-slate-800">
        Agenda de Vacinação
      </h2>

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
                          const pacienteDados = pacientes.find(p => p.cpf === item.cpf);
                          const nomeExibicao = pacienteDados ? pacienteDados.nome : "Paciente Desconhecido";
                        
                          return (

                          <div key={item.id} className="flex justify-between items-center text-sm">
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-700">{nomeExibicao}</span>
                              <span className="text-slate-500 text-xs">CPF: {item.cpf}</span>
                            </div>

                            <div className="flex items-center gap-2">
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
                                onClick={() => cancelarAgendamento(item.id)}
                                title="Cancelar Agendamento"
                              >
                                <XCircle className="w-5 h-5" />
                              </Button>
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
    </div>
  );
}