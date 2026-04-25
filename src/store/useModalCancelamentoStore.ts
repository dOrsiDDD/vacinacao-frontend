import { create } from 'zustand';

export type DadosCancelamento = {
  id: number;
  nomePaciente: string;
  cpf: string | undefined;
  data: string;
  horario: string;
};

type ModalCancelamentoStore = {
  isOpen: boolean;
  dados: DadosCancelamento | null;
  abrirModal: (dados: DadosCancelamento) => void;
  fecharModal: () => void;
};

export const useModalCancelamentoStore = create<ModalCancelamentoStore>((set) => ({
  isOpen: false,
  dados: null,
  abrirModal: (dados) => set({ isOpen: true, dados }),
  fecharModal: () => set({ isOpen: false, dados: null }),
}));