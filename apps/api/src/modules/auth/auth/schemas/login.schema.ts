import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email({ message: 'E-mail inválido.' }),
  senha: z.string().min(1, { message: 'A senha é obrigatória.' }),
});

export type LoginRequest = z.infer<typeof loginSchema>;
