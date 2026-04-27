import { perfilEnum } from './perfilEnum'

export type Usuario = {
  id: number;
  nome: string;
  email: string;
  login: string;
  perfil: perfilEnum;
};