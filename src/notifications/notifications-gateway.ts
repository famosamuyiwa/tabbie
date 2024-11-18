import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { Inject, forwardRef } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Notifications } from '@prisma/client';
import { NotificationRecipient } from 'enum/common';
import { getTargetClientIds } from 'utils/helper-methods';

@WebSocketGateway(3002, { cors: true })
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  //   private readonly log = new Logger(NotificationsService.name);

  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => NotificationsService))
    private readonly NotificationsService: NotificationsService,
  ) {}

  // Mapping to keep track of clients by userId
  private readonly clients: Map<number, string> = new Map();

  // Handle client connection and store the client ID with userId
  async handleConnection(client: Socket) {
    const userId = parseInt(client.handshake.query.userId as string); // Assuming userId is sent as a query parameter
    if (userId) {
      const notificationHistory =
        await this.NotificationsService.getNotificationHistoryByUserId(userId);
      client.emit('notificationHistory', notificationHistory); // Send notification history to the client
      this.clients.set(userId, client.id);
      console.log(`Client connected: ${client.id} (User ID: ${userId})`);
    }
  }

  // Handle client disconnection and remove the client from the map
  handleDisconnect(client: Socket) {
    const userId = Array.from(this.clients.entries()).find(
      ([, socketId]) => socketId === client.id,
    )?.[0];
    if (userId) {
      this.clients.delete(userId);
      console.log(`Client disconnected: ${client.id} (User ID: ${userId})`);
    }
  }

  // Handle incoming messages from clients if using socket.io directly from client instead of http
  @SubscribeMessage('sendNotification')
  async handleMessage(
    @MessageBody()
    message: {
      notification: Notifications;
      recipient: NotificationRecipient;
    },
  ) {
    const { notification, recipient } = message;

    try {
      // Save the notification
      const savedNotification =
        await this.NotificationsService.saveNotification(notification);

      // Check if the recipient is SPLIT_CREATOR and extract relevant options
      if (recipient === NotificationRecipient.SPLIT_CREATOR) {
        const options = { splitCreatorId: notification.recipientId }; // Assuming recipientId is the creator's ID
        this.emitNotification(savedNotification, recipient, options);
      } else {
        // Handle other recipients as necessary
        this.emitNotification(savedNotification, recipient);
      }
    } catch (error) {
      console.error(`Error sending notification: ${error}`);
    }
  }

  // Emit notification to a specific user or users
  emitNotification(
    notification: Notifications,
    recipient: NotificationRecipient,
    options?: { splitMembers?: number[]; splitCreatorId?: number },
  ) {
    const { splitMembers, splitCreatorId } = options || {};
    const targetClientIds = getTargetClientIds(
      recipient,
      this.clients,
      splitMembers,
      splitCreatorId,
    );

    console.log('target clients: ', targetClientIds);
    if (targetClientIds.length > 0) {
      // Use the Socket.IO method to emit to all targeted clients at once
      this.server.to(targetClientIds).emit('receiveNotification', notification);
    } else {
      console.log('No target clients available for notification');
    }
  }
}
