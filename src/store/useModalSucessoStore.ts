import { create } from 'zustand';

export type DadosSucesso = {
  nomePaciente: string;
  cpf: string,
  data: string;
  horario: string;
};

type ModalSucessoStore = {
  isOpen: boolean;
  dados: DadosSucesso | null;
  abrirModal: (dados: DadosSucesso) => void;
  fecharModal: () => void;
};

export const useModalSucessoStore = create<ModalSucessoStore>((set) => ({
  isOpen: false,
  dados: null,
  abrirModal: (dados) => set({ isOpen: true, dados }),
  fecharModal: () => set({ isOpen: false, dados: null }),
}));