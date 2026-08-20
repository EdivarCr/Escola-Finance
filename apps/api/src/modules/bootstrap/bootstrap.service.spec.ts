import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { BootstrapService } from './bootstrap.service';
import { PrismaService } from '../../infra/database/prisma/prisma.service';
import { PasswordHasher } from '../../shared/password/password-hasher';

describe('BootstrapService', () => {
  let service: BootstrapService;

  const transactionMock = {
    escola: {
      create: jest.fn(),
    },
    user: {
      create: jest.fn(),
    },
  };

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const passwordHasherMock = {
    hash: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    prismaMock.$transaction.mockImplementation(async (callback: any) => {
      return callback(transactionMock);
    });

    passwordHasherMock.hash.mockResolvedValue('hash-fake-123');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BootstrapService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: PasswordHasher, useValue: passwordHasherMock },
      ],
    }).compile();

    service = module.get<BootstrapService>(BootstrapService);
  });

  const dadosValidos = {
    escola: {
      nome: 'Cantinho do Saber',
    },
    owner: {
      nome: 'João',
      email: 'owner@email.com',
      senha: '123456',
    },
  };

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('deve rejeitar o bootstrap quando o e-mail já estiver cadastrado', async () => {
    // Arrange
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'usuario-existente',
      email: 'owner@email.com',
    });

    // Act + Assert
    await expect(service.execute(dadosValidos)).rejects.toBeInstanceOf(
      ConflictException,
    );

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'owner@email.com' },
    });

    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(passwordHasherMock.hash).not.toHaveBeenCalled();
  });

  it('deve criar uma escola e um usuário OWNER', async () => {
    // Arrange
    prismaMock.user.findUnique.mockResolvedValue(null);

    transactionMock.escola.create.mockResolvedValue({
      id: 'escola-1',
      nome: 'Cantinho do Saber',
    });

    transactionMock.user.create.mockResolvedValue({
      id: 'owner-1',
      nome: 'João',
      email: 'owner@email.com',
      role: 'OWNER',
      escolaId: 'escola-1',
    });

    // Act
    const resultado = await service.execute(dadosValidos);

    // Assert
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);

    expect(transactionMock.escola.create).toHaveBeenCalledWith({
      data: { nome: 'Cantinho do Saber' },
    });

    expect(transactionMock.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        nome: 'João',
        email: 'owner@email.com',
        role: 'OWNER',
        escolaId: 'escola-1',
      }),
    });

    expect(resultado).toEqual({
      escolaId: 'escola-1',
      ownerId: 'owner-1',
    });
  });

  it('deve vincular o OWNER à escola criada', async () => {
    // Arrange
    prismaMock.user.findUnique.mockResolvedValue(null);

    transactionMock.escola.create.mockResolvedValue({
      id: 'escola-123',
      nome: 'Cantinho do Saber',
    });

    transactionMock.user.create.mockResolvedValue({
      id: 'owner-123',
      escolaId: 'escola-123',
      role: 'OWNER',
    });

    // Act
    await service.execute(dadosValidos);

    // Assert
    expect(transactionMock.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        escolaId: 'escola-123',
      }),
    });
  });

  it('deve delegar a geração do hash da senha ao PasswordHasher', async () => {
    // Arrange
    prismaMock.user.findUnique.mockResolvedValue(null);

    transactionMock.escola.create.mockResolvedValue({
      id: 'escola-1',
      nome: 'Cantinho do Saber',
    });

    transactionMock.user.create.mockResolvedValue({
      id: 'owner-1',
    });

    // Act
    await service.execute(dadosValidos);

    // Assert
    expect(passwordHasherMock.hash).toHaveBeenCalledWith('123456');

    const chamada = transactionMock.user.create.mock.calls[0][0];

    expect(chamada.data.senhaHash).toBe('hash-fake-123');
    expect(chamada.data).not.toHaveProperty('senha');
  });

  it('deve reverter a operação se a criação do usuário falhar', async () => {
    // Arrange
    prismaMock.user.findUnique.mockResolvedValue(null);

    transactionMock.escola.create.mockResolvedValue({
      id: 'escola-1',
      nome: 'Cantinho do Saber',
    });

    transactionMock.user.create.mockRejectedValue(
      new Error('falha ao criar usuário'),
    );

    // Act + Assert
    await expect(service.execute(dadosValidos)).rejects.toThrow(
      'falha ao criar usuário',
    );

    // A garantia de atomicidade real é do Prisma (a transação inteira
    // é revertida se o callback rejeitar); aqui garantimos que o
    // service propaga o erro em vez de engolir ou retornar sucesso.
    expect(transactionMock.escola.create).toHaveBeenCalled();
    expect(transactionMock.user.create).toHaveBeenCalled();
  });

  it('não deve expor a senha nem o hash da senha na resposta', async () => {
    // Arrange
    prismaMock.user.findUnique.mockResolvedValue(null);

    transactionMock.escola.create.mockResolvedValue({
      id: 'escola-1',
      nome: 'Cantinho do Saber',
    });

    transactionMock.user.create.mockResolvedValue({
      id: 'owner-1',
      nome: 'João',
      email: 'owner@email.com',
      senhaHash: 'hash-fake-123',
      role: 'OWNER',
      escolaId: 'escola-1',
    });

    // Act
    const resultado = await service.execute(dadosValidos);

    // Assert
    expect(resultado).not.toHaveProperty('senha');
    expect(resultado).not.toHaveProperty('senhaHash');
  });

  it('deve rejeitar quando campo obrigatório estiver ausente', async () => {
    // Arrange
    const dadosInvalidos = {
      escola: {
        nome: 'Cantinho do Saber',
      },
      owner: {
        nome: 'João',
        email: '   ',
        senha: '123456',
      },
    };

    // Act + Assert
    await expect(service.execute(dadosInvalidos)).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    expect(passwordHasherMock.hash).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });
});
