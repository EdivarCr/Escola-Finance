import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordHasher {
  private static readonly SALT_ROUNDS = 10;

  async hash(senha: string): Promise<string> {
    return bcrypt.hash(senha, PasswordHasher.SALT_ROUNDS);
  }

  async compare(senha: string, senhaHash: string): Promise<boolean> {
    return bcrypt.compare(senha, senhaHash);
  }
}
