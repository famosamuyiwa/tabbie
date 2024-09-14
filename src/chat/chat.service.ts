import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from 'schemas/message.schema';
import { ValidationLogTracer } from 'schemas/validation-tracer';
import { Utils } from 'utils/helper-methods';

@Injectable()
export class ChatService {
  private readonly log = new Logger(ChatService.name);
  private validationLog: Utils;

  constructor(
    @InjectModel(Message.name) private chatModel: Model<Message>,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.validationLog = new Utils(this.eventEmitter);
  }

  // Save a chat message
  async saveMessage(user: string, message: string): Promise<Message> {
    const newMessage = new this.chatModel({ user, message });
    return newMessage.save();
  }

  // Retrieve the last 50 chat messages
  async getChatHistory(): Promise<Message[]> {
    this.log.log('Retrieving chats...');
    let chatHistory: Message[] = [];

    try {
      chatHistory = await this.chatModel
        .find()
        .sort({ timestamp: 1 })
        .limit(50)
        .exec();
    } catch (error) {
      this.log.error('DataRetrievalException: ', error.message);
      //call log event whenever error has occured
      const model: ValidationLogTracer = {
        uniqueId: '{room-id}',
        status: '{}',
        message: error.message,
        field: '{field-affected}',
      };
      this.validationLog.createValidationLogEvent(model);
    }
    return chatHistory;
  }
}
