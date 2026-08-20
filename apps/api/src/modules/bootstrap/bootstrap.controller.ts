import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { BootstrapService } from './bootstrap.service';
import {
  bootstrapSchema,
  type BootstrapRequest,
} from './schemas/bootstrap.schema';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

@Controller('bootstrap')
export class BootstrapController {
  constructor(private readonly bootstrapService: BootstrapService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async execute(
    @Body(new ZodValidationPipe(bootstrapSchema))
    input: BootstrapRequest,
  ) {
    return this.bootstrapService.execute(input);
  }
}
