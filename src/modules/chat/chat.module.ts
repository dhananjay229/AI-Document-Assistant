import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { LlmModule } from '../llm/llm.module';
import { RetrievalModule } from '../retrieval/retrieval.module';
import { GuardrailsModule } from '../guardrails/guardrails.module';

@Module({
  imports: [LlmModule, RetrievalModule, GuardrailsModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}

