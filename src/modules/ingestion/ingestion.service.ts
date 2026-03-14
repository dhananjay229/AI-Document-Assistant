import { Injectable, Logger } from '@nestjs/common';
import { PineconeService } from '../vector/pinecone.service';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import { Document } from '@langchain/core/documents';

/**
 * IngestionService – orchestrates the full PDF ingestion pipeline.
 *
 * Pipeline:
 *  1. Receive chunked Document[] from PdfLoader
 *  2. Generate embeddings for each chunk (in batches)
 *  3. Build vector records with metadata
 *  4. Upsert into Pinecone
 */
@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  // Embed this many chunks per API call to stay within token/rate limits
  private readonly BATCH_SIZE = 100;

  constructor(
    private readonly embeddingsService: EmbeddingsService,
    private readonly pineconeService: PineconeService,
  ) {}

  async ingestChunks(
    chunks: Document[],
    filename: string,
  ): Promise<{ chunksIngested: number }> {
    this.logger.log(`Ingesting ${chunks.length} chunks from "${filename}"`);

    const vectors: Array<{
      id: string;
      values: number[];
      metadata: Record<string, any>;
    }> = [];

    // Process in batches to avoid hitting API rate limits
    for (let i = 0; i < chunks.length; i += this.BATCH_SIZE) {
      const batch = chunks.slice(i, i + this.BATCH_SIZE);
      const texts = batch.map((doc) => doc.pageContent);

      this.logger.debug(`Embedding batch ${i / this.BATCH_SIZE + 1} (${batch.length} chunks)`);
      const embeddings = await this.embeddingsService.embedDocuments(texts);

      for (let j = 0; j < batch.length; j++) {
        vectors.push({
          id: `${filename}-chunk-${i + j}-${Date.now()}`,
          values: embeddings[j],
          metadata: {
            text: batch[j].pageContent,
            source: batch[j].metadata?.source ?? filename,
            page: batch[j].metadata?.page ?? 0,
          },
        });
      }
    }

    if (vectors.length === 0) {
      this.logger.warn(`No vectors to upsert for "${filename}"`);
      return { chunksIngested: 0 };
    }

    this.logger.log(`Upserting ${vectors.length} vectors to Pinecone...`);
    await this.pineconeService.upsertVectors(vectors);

    this.logger.log(`✅ Ingestion complete for "${filename}"`);
    return { chunksIngested: vectors.length };
  }
}
