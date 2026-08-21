import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../../infra/database/prisma/prisma.service';
import { PasswordHasher } from '../../../shared/password/password-hasher';

describe('AuthService', () => {
  let service: AuthService;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
    },
  };

  const passwordHasherMock = {
    compare: jest.fn(),
  };

  const jwtServiceMock = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: PasswordHasher, useValue: passwordHasherMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('deve estar definido', () => {
    // Arrange

    // Act

    // Assert
    expect(service).toBeDefined();
  });

  it('deve autenticar usuário com e-mail e senha válidos', async () => {
    // Arrange
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'owner@email.com',
      senhaHash: 'hash-salvo',
      escolaId: 'escola-1',
      role: 'OWNER',
      ativo: true,
    });
    passwordHasherMock.compare.mockResolvedValue(true);
    jwtServiceMock.signAsync.mockResolvedValue('jwt-token-valido');

    // Act
    const resultado = await service.execute({
      email: 'owner@email.com',
      senha: 'senha-correta',
    });

    // Assert
    expect(resultado).toEqual({ accessToken: 'jwt-token-valido' });
  });

  it('deve rejeitar autenticação com senha inválida', async () => {
    // Arrange
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'owner@email.com',
      senhaHash: 'hash-salvo',
      escolaId: 'escola-1',
      role: 'OWNER',
      ativo: true,
    });
    passwordHasherMock.compare.mockResolvedValue(false);

    // Act + Assert
    await expect(
      service.execute({
        email: 'owner@email.com',
        senha: 'senha-incorreta',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('deve rejeitar autenticação para usuário inexistente', async () => {
    // Arrange
    prismaMock.user.findUnique.mockResolvedValue(null);

    // Act + Assert
    await expect(
      service.execute({
        email: 'naoexiste@email.com',
        senha: 'qualquer',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('deve retornar erro indistinguível entre usuário inexistente e senha incorreta', async () => {
    // Arrange
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: 'user-1',
      email: 'owner@email.com',
      senhaHash: 'hash-salvo',
      escolaId: 'escola-1',
      role: 'OWNER',
      ativo: true,
    });
    passwordHasherMock.compare.mockResolvedValueOnce(false);

    // Act
    const erroUsuarioInexistente = await service
      .execute({
        email: 'naoexiste@email.com',
        senha: '123456',
      })
      .catch((erro: any) => erro);

    const erroSenhaIncorreta = await service
      .execute({
        email: 'owner@email.com',
        senha: 'senha-incorreta',
      })
      .catch((erro: any) => erro);

    // Assert
    expect(erroUsuarioInexistente).toBeInstanceOf(UnauthorizedException);
    expect(erroSenhaIncorreta).toBeInstanceOf(UnauthorizedException);
    expect(erroUsuarioInexistente.message).toBe(erroSenhaIncorreta.message);
  });

  it('deve gerar token sem expor senha nem hash da senha', async () => {
    // Arrange
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'owner@email.com',
      senhaHash: 'hash-salvo',
      escolaId: 'escola-1',
      role: 'OWNER',
      ativo: true,
    });
    passwordHasherMock.compare.mockResolvedValue(true);
    jwtServiceMock.signAsync.mockResolvedValue('jwt-token-valido');

    // Act
    await service.execute({
      email: 'owner@email.com',
      senha: 'senha-correta',
    });

    // Assert
    const payload = jwtServiceMock.signAsync.mock.calls[0][0];
    expect(payload).not.toHaveProperty('senha');
    expect(payload).not.toHaveProperty('senhaHash');
  });

  it('deve gerar token com sub, escolaId e papel', async () => {
    // Arrange
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'owner@email.com',
      senhaHash: 'hash-salvo',
      escolaId: 'escola-1',
      role: 'OWNER',
      ativo: true,
    });
    passwordHasherMock.compare.mockResolvedValue(true);
    jwtServiceMock.signAsync.mockResolvedValue('jwt-token-valido');

    // Act
    await service.execute({
      email: 'owner@email.com',
      senha: 'senha-correta',
    });

    // Assert
    expect(jwtServiceMock.signAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        sub: 'user-1',
        escolaId: 'escola-1',
        papel: 'OWNER',
      }),
    );
  });

  it('deve rejeitar autenticação de conta inativa mesmo com credenciais corretas', async () => {
    // Arrange
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'owner@email.com',
      senhaHash: 'hash-salvo',
      escolaId: 'escola-1',
      role: 'OWNER',
      ativo: false,
    });
    passwordHasherMock.compare.mockResolvedValue(true);

    // Act + Assert
    await expect(
      service.execute({
        email: 'owner@email.com',
        senha: 'senha-correta',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('deve retornar erro de conta inativa distinto do erro de credenciais inválidas', async () => {
    // Arrange
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: 'user-1',
      email: 'owner@email.com',
      senhaHash: 'hash-salvo',
      escolaId: 'escola-1',
      role: 'OWNER',
      ativo: false,
    });
    passwordHasherMock.compare.mockResolvedValueOnce(true);

    prismaMock.user.findUnique.mockResolvedValueOnce(null);

    // Act
    const erroContaInativa = await service
      .execute({
        email: 'owner@email.com',
        senha: 'senha-correta',
      })
      .catch((erro: any) => erro);

    const erroCredenciais = await service
      .execute({
        email: 'naoexiste@email.com',
        senha: 'qualquer',
      })
      .catch((erro: any) => erro);

    // Assert
    expect(erroContaInativa).toBeInstanceOf(ForbiddenException);
    expect(erroCredenciais).toBeInstanceOf(UnauthorizedException);
    expect(erroContaInativa.message).not.toBe(erroCredenciais.message);
  });
});
