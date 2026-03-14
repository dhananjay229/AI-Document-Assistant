import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { OpenAIEmbeddings } from '@langchain/openai';
import { openaiConfig } from '../../config/env.config';

/**
 * EmbeddingsService – dedicated service for generating text embeddings.
 *
 * Uses OpenAI's text-embedding model.
 * LangSmith traces all calls automatically when LANGCHAIN_TRACING_V2=true.
 */
@Injectable()
export class EmbeddingsService {
  private readonly logger = new Logger(EmbeddingsService.name);
  private readonly embeddings: OpenAIEmbeddings;

  constructor(
    @Inject(openaiConfig.KEY)
    private config: ConfigType<typeof openaiConfig>,
  ) {
    const { apiKey, embeddingModel } = this.config;

    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY is not set — embeddings will not work.');
      return;
    }

    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: apiKey,
      modelName: embeddingModel,
    });

    this.logger.log(`EmbeddingsService initialised with model: ${embeddingModel}`);
  }


  /**
   * Embed a single string — used for query embedding.
   */
  async embedQuery(text: string): Promise<number[]> {
    if (!this.embeddings) {
      throw new Error('OpenAI embeddings not initialised. Check OPENAI_API_KEY.');
    }
    this.logger.debug(`Embedding single query (${text.length} chars)`);
    return this.embeddings.embedQuery(text);
  }

  /**
   * Embed an array of strings — used to embed document chunks in batch.
   */
  async embedDocuments(texts: string[]): Promise<number[][]> {
    if (!this.embeddings) {
      throw new Error('OpenAI embeddings not initialised. Check OPENAI_API_KEY.');
    }
    this.logger.debug(`Embedding ${texts.length} document chunks`);
    return this.embeddings.embedDocuments(texts);
  }
}
