import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Pinecone } from '@pinecone-database/pinecone';
import { pineconeConfig } from '../../config/env.config';

@Injectable()
export class PineconeService {
  private pinecone: Pinecone;
  private readonly logger = new Logger(PineconeService.name);

  constructor(
    @Inject(pineconeConfig.KEY)
    private config: ConfigType<typeof pineconeConfig>,
  ) {
    const { apiKey } = this.config;
    
    if (!apiKey) {
      this.logger.warn('Pinecone API key is not configured!');
      return;
    }

    this.pinecone = new Pinecone({
      apiKey: apiKey,
    });
  }

  get client(): Pinecone {
    return this.pinecone;
  }

  get indexName(): string {
    return this.config.indexName;
  }

  getIndex() {
    if (!this.pinecone) {
      throw new Error('Pinecone client not initialized. Check your API key.');
    }
    return this.pinecone.index(this.indexName);
  }

  async upsertVectors(vectors: any[], namespace: string = 'default') {
    const index = this.getIndex();
    await index.namespace(namespace).upsert({ records: vectors });
  }

  async queryVectors(queryEmbedding: number[], topK: number = 5, namespace: string = 'default') {
    const index = this.getIndex();
    return await index.namespace(namespace).query({
      topK,
      vector: queryEmbedding,
      includeMetadata: true,
    });
  }
}
