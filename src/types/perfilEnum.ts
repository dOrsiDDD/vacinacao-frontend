export const perfilEnum = {
    Admin: 1,
    Medico: 2
} as const;

export type perfilEnum = typeof perfilEnum[keyof typeof perfilEnum];