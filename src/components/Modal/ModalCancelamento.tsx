import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useModalCancelamentoStore } from '../../store/useModalCancelamentoStore';
import { useAgendamentoStore } from '../../store/useAgendamentoStore';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export function ModalCancelamento() {
  const { isOpen, dados, fecharModal } = useModalCancelamentoStore();
  const cancelarAgendamento = useAgendamentoStore((state) => state.cancelarAgendamento);

  const handleConfirmarCancelamento = () => {
    if (!dados) return;

    cancelarAgendamento(dados.id);
    
    toast.success('Agendamento cancelado com sucesso.');
    
    // Fecha o modal
    fecharModal();
  };

  return (
    <Dialog open={isOpen} onOpenChange={fecharModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-col items-center gap-2 text-center">
          <div className="rounded-full bg-red-100 p-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <DialogTitle className="text-xl text-slate-800">Cancelar Agendamento?</DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita. Tem certeza que deseja cancelar o agendamento abaixo?
          </DialogDescription>
        </DialogHeader>
        
        {dados && (
          <div className="bg-slate-50 p-4 rounded-lg border border-red-100 my-4 space-y-2 text-sm text-slate-600">
            <p><span className="font-semibold text-slate-800">Paciente:</span> {dados.nomePaciente}</p>
            <p><span className="font-semibold text-slate-800">Data:</span> {dados.data}</p>
            <p><span className="font-semibold text-slate-800">Horário:</span> {dados.horario}</p>
          </div>
        )}

        <DialogFooter className="flex sm:justify-between gap-2 pt-4">
          <Button variant="outline" onClick={fecharModal} className="w-full sm:w-auto">
            Não, voltar
          </Button>
          <Button variant="destructive" onClick={handleConfirmarCancelamento} className="w-full sm:w-auto">
            Sim, cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}