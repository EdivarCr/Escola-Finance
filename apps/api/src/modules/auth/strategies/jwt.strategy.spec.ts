import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  const configServiceMock = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'JWT_SECRET') return 'test-secret-key';
      return null;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('deve estar definido', () => {
    // Arrange

    // Act

    // Assert
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('deve retornar os dados do usuário autenticado (id, escolaId, papel) quando o payload for válido', async () => {
      // Arrange: payload JWT decodificado contendo sub, escolaId e papel válidos
      const payloadValido = {
        sub: 'user-uuid-123',
        escolaId: 'escola-uuid-456',
        papel: 'OWNER',
      };

      // Act: execução do método validate com o payload decodificado
      const resultado = await strategy.validate(payloadValido);

      // Assert: validação de que o contexto do usuário foi extraído corretamente para popular request.user
      expect(resultado).toEqual({
        id: 'user-uuid-123',
        escolaId: 'escola-uuid-456',
        papel: 'OWNER',
      });
    });

    it('deve lançar UnauthorizedException quando o payload não contiver sub (id do usuário)', async () => {
      // Arrange: payload sem o campo sub
      const payloadInvalido = {
        escolaId: 'escola-uuid-456',
        papel: 'OWNER',
      } as any;

      // Act + Assert: deve rejeitar com UnauthorizedException
      await expect(strategy.validate(payloadInvalido)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('deve lançar UnauthorizedException quando o payload não contiver escolaId', async () => {
      // Arrange: payload sem o campo escolaId
      const payloadInvalido = {
        sub: 'user-uuid-123',
        papel: 'OWNER',
      } as any;

      // Act + Assert: deve rejeitar com UnauthorizedException
      await expect(strategy.validate(payloadInvalido)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('deve lançar UnauthorizedException quando o payload não contiver papel', async () => {
      // Arrange: payload sem o campo papel
      const payloadInvalido = {
        sub: 'user-uuid-123',
        escolaId: 'escola-uuid-456',
      } as any;

      // Act + Assert: deve rejeitar com UnauthorizedException
      await expect(strategy.validate(payloadInvalido)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('deve lançar UnauthorizedException quando o payload for nulo ou indefinido', async () => {
      // Arrange: payload nulo
      const payloadNulo = null as any;

      // Act + Assert: deve rejeitar com UnauthorizedException
      await expect(strategy.validate(payloadNulo)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });
});
