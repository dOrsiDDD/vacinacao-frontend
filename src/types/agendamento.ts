export interface Agendamento {
  id: number; 
  idPaciente: number | undefined;
  dataAgendamento: Date | string;
  horaAgendamento: string; // ex: "14:00"
  realizado: boolean;
}