export interface Agendamento {
  id: string; 
  nome: string;
  cpf: string;
  dataNascimento: Date | string;
  dataAgendamento: Date | string;
  horarioAgendamento: string; // ex: "14:00"
  realizado: boolean;
}