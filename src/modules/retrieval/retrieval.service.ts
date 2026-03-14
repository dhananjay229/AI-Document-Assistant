import { Injectable, Logger } from '@nestjs/common';
import { PineconeService } from '../vector/pinecone.service';
import { EmbeddingsService } from '../embeddings/embeddings.service';

export interface RetrievedChunk {
  text: string;
  source: string;
  page: number;
  score: number;
}

/**
 * RetrievalService – converts a user query into an embedding, queries
 * Pinecone for the most relevant chunks, and returns them with metadata.
 *
 * Pipeline:
 *  1. Embed the user question
 *  2. Query Pinecone for top-k similar vectors
 *  3. Map results to typed RetrievedChunk objects
 */
@Injectable()
export class RetrievalService {
  private readonly logger = new Logger(RetrievalService.name);

  constructor(
    private readonly embeddingsService: EmbeddingsService,
    private readonly pineconeService: PineconeService,
  ) {}

  /**
   * Retrieve the top-k most relevant document chunks for a given query.
   * @param query   - The user's natural language question
   * @param topK    - Number of chunks to retrieve (default: 5)
   */
  async retrieve(query: string, topK = 5): Promise<RetrievedChunk[]> {
    this.logger.log(`Retrieving top-${topK} chunks for query: "${query}"`);

    // Step 1: Embed the query
    const queryEmbedding = await this.embeddingsService.embedQuery(query);

    // Step 2: Query Pinecone
    const response = await this.pineconeService.queryVectors(queryEmbedding, topK);

    if (!response.matches || response.matches.length === 0) {
      this.logger.warn('No relevant chunks found in Pinecone for this query.');
      return [];
    }

    // Step 3: Map to typed results
    const chunks: RetrievedChunk[] = response.matches.map((match: any) => ({
      text: match.metadata?.text ?? '',
      source: match.metadata?.source ?? 'Unknown',
      page: match.metadata?.page ?? 0,
      score: match.score ?? 0,
    }));

    this.logger.log(
      `Retrieved ${chunks.length} chunk(s). Top score: ${chunks[0]?.score?.toFixed(4)}`,
    );

    return chunks;
  }

  /**
   * Build a single context string from retrieved chunks,
   * ready to be inserted into the LLM prompt.
   */
  buildContext(chunks: RetrievedChunk[]): string {
    return chunks
      .map(
        (chunk, i) =>
          `[Chunk ${i + 1} | Source: ${chunk.source} | Page: ${chunk.page} | Score: ${chunk.score.toFixed(3)}]\n${chunk.text}`,
      )
      .join('\n\n---\n\n');
  }
}
