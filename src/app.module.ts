import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VectorModule } from './modules/vector/vector.module';
import { LlmModule } from './modules/llm/llm.module';
import { IngestionModule } from './modules/ingestion/ingestion.module';
import { RetrievalModule } from './modules/retrieval/retrieval.module';
import { EmbeddingsModule } from './modules/embeddings/embeddings.module';
import { ChatModule } from './modules/chat/chat.module';
import { GuardrailsModule } from './modules/guardrails/guardrails.module';
import { EvaluationModule } from './modules/evaluation/evaluation.module';
import { openaiConfig, pineconeConfig, langsmithConfig, redisConfig } from './config/env.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [openaiConfig, pineconeConfig, langsmithConfig, redisConfig],
    }),
    VectorModule,
    LlmModule,
    IngestionModule,
    RetrievalModule,
    EmbeddingsModule,
    ChatModule,
    GuardrailsModule,
    EvaluationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
