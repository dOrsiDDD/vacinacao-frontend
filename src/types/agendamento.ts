import type { statusEnum } from "./statusEnum";

export interface Agendamento {
  id: number; 
  idPaciente: number | undefined;
  dataAgendamento: Date | string;
  horaAgendamento: string; // ex: "14:00"
  status: statusEnum;
}