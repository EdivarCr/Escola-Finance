// bootstrap.service.integration-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { BootstrapService } from './bootstrap.service';
import { PrismaService } from '../../infra/database/prisma/prisma.service';
import { PasswordHasher } from '../../shared/password/password-hasher';

describe('BootstrapService (integração)', () => {
  let service: BootstrapService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BootstrapService,
        PrismaService, // instância REAL, conecta no banco de teste
        PasswordHasher, // instância REAL também
      ],
    }).compile();

    service = module.get<BootstrapService>(BootstrapService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    // Limpa as tabelas antes de CADA teste, garantindo isolamento
    await prisma.user.deleteMany();
    await prisma.escola.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('deve persistir a escola e o owner no banco de verdade', async () => {
    // Act
    const resultado = await service.execute({
      escola: { nome: 'Cantinho do Saber' },
      owner: { nome: 'João', email: 'owner@email.com', senha: '123456' },
    });

    // Assert — consulta o banco real para confirmar persistência
    const escolaSalva = await prisma.escola.findUnique({
      where: { id: resultado.escolaId },
    });
    const ownerSalvo = await prisma.user.findUnique({
      where: { id: resultado.ownerId },
    });

    expect(escolaSalva?.nome).toBe('Cantinho do Saber');
    expect(ownerSalvo?.email).toBe('owner@email.com');
    expect(ownerSalvo?.senhaHash).not.toBe('123456'); // confirma hash real do bcrypt
  });

  it('deve respeitar a constraint de e-mail único no banco', async () => {
    // Arrange — cria um usuário direto no banco
    await service.execute({
      escola: { nome: 'Escola A' },
      owner: { nome: 'Ana', email: 'duplicado@email.com', senha: '123456' },
    });

    // Act + Assert — tenta criar de novo com o mesmo e-mail
    await expect(
      service.execute({
        escola: { nome: 'Escola B' },
        owner: { nome: 'Outro', email: 'duplicado@email.com', senha: '123456' },
      }),
    ).rejects.toThrow();
  });
});
