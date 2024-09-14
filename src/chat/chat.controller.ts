import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { Message } from 'schemas/message.schema';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('history')
  async getChatHistory(): Promise<Message[]> {
    return this.chatService.getChatHistory();
  }

  @Post('send')
  async sendMessage(@Body() body: { user: string; message: string }) {
    const { user, message } = body;

    if (!user || !message) {
      throw new BadRequestException('User and message are required');
    }

    // Save the message to the database
    const savedMessage = await this.chatService.saveMessage(user, message);

    return savedMessage;
  }
}
