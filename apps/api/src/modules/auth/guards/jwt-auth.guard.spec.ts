import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard();
  });

  it('deve estar definido', () => {
    // Arrange

    // Act

    // Assert
    expect(guard).toBeDefined();
  });

  describe('handleRequest', () => {
    it('deve permitir acesso e retornar o usuário quando a autenticação for bem-sucedida', () => {
      // Arrange: usuário autenticado retornado pelo Passport e nenhum erro
      const usuarioAutenticado = {
        id: 'user-uuid-123',
        escolaId: 'escola-uuid-456',
        papel: 'OWNER',
      };
      const erro = null;
      const info = undefined;

      // Act: o guard processa a resposta do Passport
      const resultado = guard.handleRequest(erro, usuarioAutenticado, info);

      // Assert: o usuário deve ser retornado para ser atribuído a request.user
      expect(resultado).toEqual(usuarioAutenticado);
    });

    it('deve lançar UnauthorizedException quando não houver usuário (requisição sem token)', () => {
      // Arrange: nenhum usuário retornado (usuário nulo/falso) e nenhum erro explícito
      const usuarioNaoAutenticado = null;
      const erro = null;
      const info = { message: 'No auth token' };

      // Act + Assert: deve lançar UnauthorizedException impedindo o acesso à rota protegida
      expect(() =>
        guard.handleRequest(erro, usuarioNaoAutenticado, info),
      ).toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException quando o Passport retornar erro (token malformado ou assinatura inválida)', () => {
      // Arrange: erro retornado pelo Passport (ex: JsonWebTokenError)
      const erroAssinaturaInvalida = new Error('invalid signature');
      const usuario = null;
      const info = undefined;

      // Act + Assert: deve lançar UnauthorizedException rejeitando o acesso
      expect(() =>
        guard.handleRequest(erroAssinaturaInvalida, usuario, info),
      ).toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException quando o token estiver expirado', () => {
      // Arrange: info indicando token expirado e usuário falso
      const erro = null;
      const usuario = false;
      const infoExpirado = {
        name: 'TokenExpiredError',
        message: 'jwt expired',
        expiredAt: new Date(),
      };

      // Act + Assert: deve lançar UnauthorizedException rejeitando o acesso
      expect(() =>
        guard.handleRequest(erro, usuario, infoExpirado),
      ).toThrow(UnauthorizedException);
    });
  });
});
