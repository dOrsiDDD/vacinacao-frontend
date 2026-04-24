import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useModalSucessoStore } from '../../store/useModalSucessoStore';
import { CheckCircle2 } from 'lucide-react'; // Ícone bacana para sucesso

export function ModalSucesso() {
  // Conectando o componente ao Service
  const { isOpen, dados, fecharModal } = useModalSucessoStore();

  return (
    <Dialog open={isOpen} onOpenChange={fecharModal}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader className="flex flex-col items-center gap-2">
          <CheckCircle2 className="w-16 h-16 text-green-500" />
          <DialogTitle className="text-2xl text-slate-800">Agendamento Realizado!</DialogTitle>
        </DialogHeader>
        
        {dados && (
          <div className="bg-slate-50 p-4 rounded-lg border text-left my-4 space-y-2 text-sm text-slate-600">
            <p><span className="font-semibold text-slate-800">Paciente:</span> {dados.nomePaciente}</p>
            <p><span className="font-semibold text-slate-800">cpf:</span> {dados.cpf}</p>
            <p><span className="font-semibold text-slate-800">Data:</span> {dados.data}</p>
            <p><span className="font-semibold text-slate-800">Horário:</span> {dados.horario}</p>
          </div>
        )}

        <DialogFooter className="sm:justify-center">
          <Button onClick={fecharModal} className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
            Concluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}