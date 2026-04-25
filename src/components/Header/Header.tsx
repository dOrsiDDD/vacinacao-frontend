import { useAgendamentoStore } from '../../store/useAgendamentoStore';
import { Bell } from 'lucide-react'; // Ícone de sino do Lucide

export function Header() {
  const { agendamentos } = useAgendamentoStore();

  // Calcula quantos agendamentos estão pendentes
  const totalPendentes = agendamentos.filter(
    (agendamento) => agendamento.status === 1 || agendamento.status === undefined
  ).length;

  return (
    <header className="w-full bg-white border-b shadow-sm mb-6">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="text-blue-600">Vacina</span>++
        </h1>

        <div className="relative cursor-pointer hover:bg-slate-100 p-2 rounded-full transition-colors">
          <Bell className="w-6 h-6 text-slate-600" />
                    {totalPendentes >= 0 && (
            <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 border-2 border-white rounded-full">
              {totalPendentes > 99 ? '99+' : totalPendentes}
            </span>
          )}
        </div>
        
      </div>
    </header>
  );
}