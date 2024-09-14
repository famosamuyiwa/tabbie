import { Module } from '@nestjs/common';
import { ChatGateway } from './chat-gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from 'schemas/message.schema';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Message.name,
        schema: MessageSchema,
      },
    ]),
  ],
  providers: [ChatService, ChatGateway],
  controllers: [ChatController],
})
export class ChatModule {}
