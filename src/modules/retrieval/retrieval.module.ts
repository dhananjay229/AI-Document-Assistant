import { Module } from '@nestjs/common';
import { RetrievalService } from './retrieval.service';
import { EmbeddingsModule } from '../embeddings/embeddings.module';
import { VectorModule } from '../vector/vector.module';

@Module({
  imports: [EmbeddingsModule, VectorModule],
  providers: [RetrievalService],
  exports: [RetrievalService],
})
export class RetrievalModule {}
