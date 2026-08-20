import { z } from 'zod';

export const bootstrapSchema = z.object({
  escola: z.object({
    nome: z.string().trim().min(1),
    email: z.email(),
    telefone: z.number().max(11).optional(),
    endereco: z.string().trim().min(1).optional(),
    pixUrl: z.string().optional(),
    logoUrl: z.string().optional(),
  }),
  owner: z.object({
    nome: z.string().trim().min(1),
    email: z.string().trim().email(),
    senha: z.string().min(6),
  }),
});

export type BootstrapRequest = z.infer<typeof bootstrapSchema>;
