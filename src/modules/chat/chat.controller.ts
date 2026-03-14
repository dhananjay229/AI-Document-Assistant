import {
  Controller,
  Post,
  Body,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * POST /chat/ask
   * Body: { "question": "string" }
   * Returns: { "answer": "string", "sources": [...] }
   */
  @Post('ask')
  @HttpCode(HttpStatus.OK)
  async ask(@Body('question') question: string) {
    if (!question || question.trim().length === 0) {
      throw new BadRequestException('A non-empty "question" field is required.');
    }

    return this.chatService.ask(question.trim());
  }
}
