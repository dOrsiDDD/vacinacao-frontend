export const statusEnum = {
    Pendente: 1,
    Concluido: 2
} as const;

export type statusEnum = typeof statusEnum[keyof typeof statusEnum];