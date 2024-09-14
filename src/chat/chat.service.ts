import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  forwardRef,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from 'schemas/message.schema';
import { ValidationLogTracer } from 'schemas/validation-tracer';
import { Utils } from 'utils/helper-methods';
import { ChatGateway } from './chat-gateway';

@Injectable()
export class ChatService {
  private readonly log = new Logger(ChatService.name);
  private validationLog: Utils;

  constructor(
    @InjectModel(Message.name) private chatModel: Model<Message>,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway, // Inject ChatGateway
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.validationLog = new Utils(this.eventEmitter);
  }

  // Save a chat message
  async saveMessage(senderId: string, message: string): Promise<Message> {
    const newMessage = new this.chatModel({ senderId, message });
    const msg = await newMessage.save();
    return msg;
  }

  async sendMessage(senderId: string, message: string): Promise<Message> {
    if (!senderId || !message) {
      throw new BadRequestException('User and message are required');
    }
    const savedMessage = await this.saveMessage(senderId, message);
    // Emit the message after saving
    this.chatGateway.emitChatMessage(savedMessage);
    return savedMessage;
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
