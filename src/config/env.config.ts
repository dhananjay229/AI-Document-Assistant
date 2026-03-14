import { registerAs } from '@nestjs/config';

export const openaiConfig = registerAs('openai', () => ({
  apiKey: process.env.OPENAI_API_KEY,
  chatModel: process.env.OPENAI_CHAT_MODEL || 'gpt-3.5-turbo',
  embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
}));

export const pineconeConfig = registerAs('pinecone', () => ({
  apiKey: process.env.PINECONE_API_KEY,
  indexName: process.env.PINECONE_INDEX_NAME || 'ai-document-assistant',
  environment: process.env.PINECONE_ENVIRONMENT,
}));

export const langsmithConfig = registerAs('langsmith', () => ({
  tracingV2: process.env.LANGCHAIN_TRACING_V2 === 'true',
  endpoint: process.env.LANGCHAIN_ENDPOINT,
  apiKey: process.env.LANGCHAIN_API_KEY,
  project: process.env.LANGCHAIN_PROJECT || 'ai-document-assistant',
}));

export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
}));
