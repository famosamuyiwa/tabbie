import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Message } from 'schemas/message.schema';
import { Inject, Logger, forwardRef } from '@nestjs/common';

@WebSocketGateway(3002, { cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly log = new Logger(ChatService.name);

  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
  ) {}

  // When a client connects
  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    const chatHistory = await this.chatService.getChatHistory();
    client.emit('chatHistory', chatHistory); // Send chat history to the client
  }

  // When a client disconnects
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Handle incoming messages from clients if using socket.io directly from client instead of http
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { senderId: string; message: string },
  ) {
    const savedMessage = await this.chatService.saveMessage(
      data.senderId,
      data.message,
    );
    this.emitChatMessage(savedMessage); // Broadcast the message to all clients
  }

  emitChatMessage(message: Message) {
    if (this.server) {
      this.server.emit('receiveMessage', message);
    } else {
      this.log.log('Server instance is not available');
    }
  }
}
