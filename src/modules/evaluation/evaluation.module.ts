import { Module } from '@nestjs/common';
import { RagasService } from './ragas.service';
import { LlmModule } from '../llm/llm.module';

@Module({
  imports: [LlmModule],
  providers: [RagasService],
  exports: [RagasService],
})
export class EvaluationModule {}
