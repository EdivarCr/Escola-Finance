import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma/prisma.service';
import { PasswordHasher } from '../../shared/password/password-hasher';
import { Prisma, UserRole } from '../../../generated/prisma/client';

type BootstrapInput = {
  escola: {
    nome: string;
  };
  owner: {
    nome: string;
    email: string;
    senha: string;
  };
};

type BootstrapOutput = {
  escolaId: string;
  ownerId: string;
};

@Injectable()
export class BootstrapService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: BootstrapInput): Promise<BootstrapOutput> {
    this.validateInput(input);

    const usuarioExistente = await this.prisma.user.findUnique({
      where: { email: input.owner.email },
    });

    if (usuarioExistente) {
      throw new ConflictException('E-mail já cadastrado.');
    }

    const senhaHash = await this.passwordHasher.hash(input.owner.senha);

    return this.prisma.$transaction(
      async (transaction: Prisma.TransactionClient) => {
        const escolaCriada = await transaction.escola.create({
          data: { nome: input.escola.nome },
        });

        const ownerCriado = await transaction.user.create({
          data: {
            nome: input.owner.nome,
            email: input.owner.email,
            senhaHash,
            role: UserRole.OWNER,
            escolaId: escolaCriada.id,
          },
        });

        return {
          escolaId: escolaCriada.id,
          ownerId: ownerCriado.id,
        };
      },
    );
  }

  private validateInput(input: BootstrapInput): void {
    const escolaNome = input?.escola?.nome?.trim();
    const ownerNome = input?.owner?.nome?.trim();
    const ownerEmail = input?.owner?.email?.trim();
    const ownerSenha = input?.owner?.senha;

    if (!escolaNome || !ownerNome || !ownerEmail || !ownerSenha) {
      throw new BadRequestException(
        'Dados obrigatórios ausentes para criação da escola e do OWNER.',
      );
    }
  }
}
