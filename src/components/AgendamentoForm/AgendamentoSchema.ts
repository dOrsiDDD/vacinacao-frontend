import { z } from 'zod';

export const agendamentoSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  cpf: z.string().regex(/^\d{11}$/, 'O CPF deve conter exatamente 11 números'),
  dataNascimento: z.date({
    message: 'A data de nascimento é obrigatória e deve ser válida',
  }),
  dataAgendamento: z.date({
    message: 'A data do agendamento é obrigatória e deve ser válida',
  }),
  horarioAgendamento: z.string().min(5, 'Selecione um horário'),
});

export type AgendamentoFormData = z.infer<typeof agendamentoSchema>;