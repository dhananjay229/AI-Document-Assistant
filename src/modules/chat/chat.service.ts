import { Injectable, Logger } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';
import { RetrievalService } from '../retrieval/retrieval.service';
import { PromptGuard } from '../guardrails/prompt.guard';

export interface ChatResponse {
  answer: string;
  sources: { score: number; source: string; page: number }[];
  blockedByGuardrail?: boolean;
}

/**
 * ChatService – the core RAG pipeline for answering user questions.
 *
 * Pipeline:
 *  1. Guardrail check (prompt injection detection)
 *  2. Retrieve top-k relevant chunks via RetrievalService
 *  3. Build a grounded context prompt
 *  4. Invoke the LLM
 *  5. Return the answer with source metadata
 */
@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly llmService: LlmService,
    private readonly retrievalService: RetrievalService,
    private readonly promptGuard: PromptGuard,
  ) {}

  async ask(question: string): Promise<ChatResponse> {
    // ── Step 1: Guardrail check ────────────────────────────────────────────
    if (!this.promptGuard.isSafe(question)) {
      this.logger.warn('Blocked prompt injection attempt.');
      return {
        answer: this.promptGuard.getRejectionMessage(),
        sources: [],
        blockedByGuardrail: true,
      };
    }

    try {
      // ── Step 2: Retrieve relevant chunks ──────────────────────────────────
      const chunks = await this.retrievalService.retrieve(question, 5);

      if (chunks.length === 0) {
        return {
          answer: "I could not find this in the document.",
          sources: [],
        };
      }

      // ── Step 3: Build grounded context string ──────────────────────────────
      const context = this.retrievalService.buildContext(chunks);

      // ── Step 4: Build prompt using exact template from spec ──────────────
      const prompt = `You are an AI document assistant.

Use ONLY the context below to answer the question.

If the answer is not in the document say:
"I could not find this in the document."

Context:
${context}

Question:
${question}`;

      this.logger.log('Invoking LLM with retrieved context...');
      const response = await this.llmService.chatModel.invoke(prompt);

      // ── Step 5: Return answer with source metadata ─────────────────────────
      return {
        answer: response.content as string,
        sources: chunks.map((c) => ({
          score: c.score,
          source: c.source,
          page: c.page,
        })),
      };
    } catch (error) {
      this.logger.error('Error in ChatService.ask()', error);
      throw error;
    }
  }
}
