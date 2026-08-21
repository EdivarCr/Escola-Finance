import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../infra/database/prisma/prisma.service';
import { PasswordHasher } from '../../../shared/password/password-hasher';

type LoginInput = {
  email: string;
  senha: string;
};

type LoginOutput = {
  accessToken: string;
};

type AuthTokenPayload = {
  sub: string;
  escolaId: string;
  papel: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordHasher: PasswordHasher,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const email = input.email.trim();
    const senha = input.senha;

    if (!email || !senha) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const senhaValida = await this.passwordHasher.compare(
      senha,
      user.senhaHash,
    );

    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    if (!user.ativo) {
      throw new ForbiddenException('Conta inativa.');
    }

    const payload: AuthTokenPayload = {
      sub: user.id,
      escolaId: user.escolaId,
      papel: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken };
  }
}
