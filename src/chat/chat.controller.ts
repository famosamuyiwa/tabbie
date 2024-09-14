import { Body, Controller, Get, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Message } from 'schemas/message.schema';
import { ChatMessage } from 'interfaces/common';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('history')
  async getChatHistory(): Promise<Message[]> {
    return this.chatService.getChatHistory();
  }

  @Post('send')
  async sendMessage(@Body() body: Partial<ChatMessage>) {
    const { senderId, message } = body;
    return this.chatService.sendMessage(senderId, message);
  }
}
