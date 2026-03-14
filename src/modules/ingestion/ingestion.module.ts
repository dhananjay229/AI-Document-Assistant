import { Module } from '@nestjs/common';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { PdfLoader } from './pdf.loader';
import { EmbeddingsModule } from '../embeddings/embeddings.module';
import { VectorModule } from '../vector/vector.module';

@Module({
  imports: [EmbeddingsModule, VectorModule],
  controllers: [IngestionController],
  providers: [IngestionService, PdfLoader],
  exports: [IngestionService, PdfLoader],
})
export class IngestionModule {}
