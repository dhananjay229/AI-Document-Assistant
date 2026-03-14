import { Injectable, Logger } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';

export interface RagasEvaluationResult {
  contextRelevance: number;   // 0-1: How relevant is the retrieved context to the question?
  answerFaithfulness: number; // 0-1: Is the answer grounded in the context (no hallucinations)?
  answerCorrectness: number;  // 0-1: Overall quality of the answer
  feedback: string;
}

/**
 * RagasService – evaluates RAG pipeline quality using LLM self-evaluation.
 * Each metric is scored 0–1 by asking the LLM to rate itself.
 * This mirrors the RAGAS evaluation framework's core metrics.
 */
@Injectable()
export class RagasService {
  private readonly logger = new Logger(RagasService.name);

  constructor(private readonly llmService: LlmService) {}

  async evaluate(
    question: string,
    context: string,
    answer: string,
  ): Promise<RagasEvaluationResult> {
    try {
      const evaluationPrompt = `
You are an expert RAG evaluation system. Evaluate the following RAG pipeline output.
Score each metric from 0.0 to 1.0 (two decimal places).

---
QUESTION: ${question}

RETRIEVED CONTEXT:
${context}

GENERATED ANSWER:
${answer}
---

Evaluate and return a JSON object with these exact keys:
{
  "contextRelevance": <float 0.0-1.0, how relevant is the context to the question>,
  "answerFaithfulness": <float 0.0-1.0, is the answer fully grounded in the context with no hallucinations>,
  "answerCorrectness": <float 0.0-1.0, overall quality and accuracy of the answer>,
  "feedback": "<one sentence of constructive feedback>"
}

Return ONLY the JSON object, no other text.
      `.trim();

      const response = await this.llmService.chatModel.invoke(evaluationPrompt);
      const content = response.content as string;

      // Parse the JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not parse evaluation response as JSON');
      }

      const result: RagasEvaluationResult = JSON.parse(jsonMatch[0]);
      this.logger.log(
        `RAGAS Evaluation — ContextRelevance: ${result.contextRelevance}, ` +
        `Faithfulness: ${result.answerFaithfulness}, Correctness: ${result.answerCorrectness}`,
      );
      return result;
    } catch (error) {
      this.logger.error('RAGAS evaluation failed', error);
      // Return neutral scores on failure so it doesn't block the main flow
      return {
        contextRelevance: -1,
        answerFaithfulness: -1,
        answerCorrectness: -1,
        feedback: 'Evaluation could not be completed.',
      };
    }
  }
}
