import { z } from "zod";

export const cadastroPacienteSchema = z.object({
    nome: z.string().min(3, "O nome deve ter pelo menos 3 letras"),
    dataNascimento: z.string().min(1, "A data de nascimento é obrigatória") // Ou z.date() se for usar o Calendar
  });

export type CadastroPacienteFormData = z.infer<typeof cadastroPacienteSchema>;