export interface Agendamento {
  id: string; 
  cpf: string;
  dataAgendamento: Date | string;
  horarioAgendamento: string; // ex: "14:00"
  realizado: boolean;
}