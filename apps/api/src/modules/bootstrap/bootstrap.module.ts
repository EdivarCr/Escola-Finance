import { Module } from '@nestjs/common';
import { BootstrapService } from './bootstrap.service';
import { BootstrapController } from './bootstrap.controller';
import { PasswordHasher } from '../../shared/password/password-hasher';

@Module({
  controllers: [BootstrapController],
  providers: [BootstrapService, PasswordHasher],
})
export class BootstrapModule {}
