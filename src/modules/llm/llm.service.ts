import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { openaiConfig } from '../../config/env.config';

/**
 * LlmService – wraps OpenAI LLM + Embeddings.
 *
 * LangSmith tracing is enabled automatically when the following env vars are set:
 *   LANGCHAIN_TRACING_V2=true
 *   LANGCHAIN_API_KEY=<your-langsmith-api-key>
 *   LANGCHAIN_PROJECT=<your-project-name>
 *
 * LangChain's SDK picks these up at runtime — no code changes needed.
 */
@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  public readonly chatModel: ChatOpenAI;
  public readonly embeddingsModel: OpenAIEmbeddings;

  constructor(
    @Inject(openaiConfig.KEY)
    private config: ConfigType<typeof openaiConfig>,
  ) {
    const { apiKey, chatModel, embeddingModel } = this.config;

    if (!apiKey) {
      this.logger.warn('OpenAI API key is not configured! Set OPENAI_API_KEY in .env');
      return;
    }

    this.logger.log(`LLM initialised — Chat: ${chatModel}, Embeddings: ${embeddingModel}`);

    // LangSmith tracing is automatic via LANGCHAIN_TRACING_V2 env var.
    this.chatModel = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: chatModel,
      temperature: 0, // Deterministic responses
      maxTokens: 1024,
    });

    this.embeddingsModel = new OpenAIEmbeddings({
      openAIApiKey: apiKey,
      modelName: embeddingModel,
    });
  }

  /** Embed a single string (used for query embedding) */
  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.embeddingsModel) {
      throw new Error('Embeddings model is not initialised — check OPENAI_API_KEY in .env');
    }
    return this.embeddingsModel.embedQuery(text);
  }

  /** Embed a batch of strings (used for document chunk embedding) */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    if (!this.embeddingsModel) {
      throw new Error('Embeddings model is not initialised — check OPENAI_API_KEY in .env');
    }
    return this.embeddingsModel.embedDocuments(texts);
  }
}

