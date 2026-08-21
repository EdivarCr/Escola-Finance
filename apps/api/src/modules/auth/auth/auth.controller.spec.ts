import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AuthModule } from './auth.module';
import { PrismaModule } from '../../../infra/database/prisma/prisma.module';
import { PrismaService } from '../../../infra/database/prisma/prisma.service';
import { PasswordHasher } from '../../../shared/password/password-hasher';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

describe('AuthController (integração)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let passwordHasher: PasswordHasher;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        AuthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    passwordHasher = moduleFixture.get<PasswordHasher>(PasswordHasher);
    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  beforeEach(async () => {
    // Limpa as tabelas antes de cada teste para garantir isolamento
    await prisma.user.deleteMany();
    await prisma.escola.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  it('deve realizar login com credenciais válidas', async () => {
    // Arrange: Criar escola e usuário ativo
    const escola = await prisma.escola.create({
      data: {
        nome: 'Escola Teste',
      },
    });

    const senhaHash = await passwordHasher.hash('senha123');
    const usuario = await prisma.user.create({
      data: {
        nome: 'Usuario Teste',
        email: 'teste@escola.com',
        senhaHash,
        role: 'OWNER',
        escolaId: escola.id,
        ativo: true,
      },
    });

    // Act
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'teste@escola.com',
        senha: 'senha123',
      });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');

    const decoded = jwtService.verify(response.body.accessToken);
    expect(decoded.sub).toBe(usuario.id);
    expect(decoded.escolaId).toBe(escola.id);
    expect(decoded.papel).toBe(usuario.role);
    expect(decoded).not.toHaveProperty('senha');
    expect(decoded).not.toHaveProperty('senhaHash');
  });

  it('deve retornar 401 para senha incorreta', async () => {
    const escola = await prisma.escola.create({
      data: { nome: 'Escola Teste' },
    });
    const senhaHash = await passwordHasher.hash('senha123');
    await prisma.user.create({
      data: {
        nome: 'Usuario Teste',
        email: 'teste@escola.com',
        senhaHash,
        role: 'OWNER',
        escolaId: escola.id,
        ativo: true,
      },
    });

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'teste@escola.com',
        senha: 'senha_errada',
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Credenciais inválidas.');
  });

  it('deve retornar 401 para e-mail inexistente', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'inexistente@escola.com',
        senha: 'senha123',
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Credenciais inválidas.');
  });

  it('deve retornar erro indistinguível de credenciais inválidas para senha incorreta e e-mail inexistente', async () => {
    const escola = await prisma.escola.create({
      data: { nome: 'Escola Teste' },
    });
    const senhaHash = await passwordHasher.hash('senha123');
    await prisma.user.create({
      data: {
        nome: 'Usuario Teste',
        email: 'teste@escola.com',
        senhaHash,
        role: 'OWNER',
        escolaId: escola.id,
        ativo: true,
      },
    });

    const resSenhaIncorreta = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'teste@escola.com',
        senha: 'senha_errada',
      });

    const resEmailInexistente = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'inexistente@escola.com',
        senha: 'senha123',
      });

    expect(resSenhaIncorreta.status).toBe(401);
    expect(resEmailInexistente.status).toBe(401);
    expect(resSenhaIncorreta.body.message).toBe(resEmailInexistente.body.message);
  });

  it('deve retornar 403 para usuário inativo', async () => {
    const escola = await prisma.escola.create({
      data: { nome: 'Escola Teste' },
    });
    const senhaHash = await passwordHasher.hash('senha123');
    await prisma.user.create({
      data: {
        nome: 'Usuario Teste',
        email: 'inativo@escola.com',
        senhaHash,
        role: 'OWNER',
        escolaId: escola.id,
        ativo: false,
      },
    });

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'inativo@escola.com',
        senha: 'senha123',
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Conta inativa.');
  });

  it('deve retornar 400 se e-mail não for informado', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        senha: 'senha123',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Dados inválidos para a requisição.');
    expect(response.body.errors.some((err: any) => err.field === 'email')).toBe(true);
  });

  it('deve retornar 400 se formato do e-mail for inválido', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'emailinvalido',
        senha: 'senha123',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Dados inválidos para a requisição.');
    expect(response.body.errors.some((err: any) => err.field === 'email')).toBe(true);
  });
});
