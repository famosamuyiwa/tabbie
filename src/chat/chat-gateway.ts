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

@WebSocketGateway(3002, { cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  // When a client connects
  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    const chatHistory = await this.chatService.getChatHistory();
    console.log(chatHistory.length);
    client.emit('chatHistory', chatHistory); // Send chat history to the client
  }

  // When a client disconnects
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Handle incoming messages from clients
  @SubscribeMessage('sendMessage')
  async handleMessage(@MessageBody() data: { user: string; message: string }) {
    const savedMessage = await this.chatService.saveMessage(
      data.user,
      data.message,
    );
    this.server.emit('receiveMessage', savedMessage); // Broadcast the message to all clients
  }
}
