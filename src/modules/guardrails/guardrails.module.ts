import { Module } from '@nestjs/common';
import { PromptGuard } from './prompt.guard';

@Module({
  providers: [PromptGuard],
  exports: [PromptGuard],
})
export class GuardrailsModule {}
