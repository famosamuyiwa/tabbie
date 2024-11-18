import {
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  forwardRef,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationsGateway } from './notifications-gateway';
import { Utils } from 'utils/helper-methods';
import { PrismaService } from 'src/prisma.service';
import { ResponseStatus } from 'enum/common';
import { ApiResponse } from 'interfaces/common';
import { Notifications } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly log = new Logger(NotificationsService.name);
  private readonly validationLog: Utils;

  constructor(
    @Inject(forwardRef(() => NotificationsGateway))
    private readonly notificationsGateway: NotificationsGateway, // Inject ChatGateway
    private readonly eventEmitter: EventEmitter2,
    private readonly prisma: PrismaService,
  ) {
    this.validationLog = new Utils(this.eventEmitter);
  }

  // Save notification
  async saveNotification(data: Notifications) {
    try {
      let notification = await this.prisma.notifications.create({
        data,
      });
      return notification;
    } catch (err) {
      this.log.error(`${err}`);
    }
  }

  async sendNotification(notification: Notifications) {
    try {
      const savedNotification = await this.saveNotification(notification);
      // Emit the notification after saving
      //   this.notificationsGateway.emitNotification(savedNotification);
      return savedNotification;
    } catch (err) {
      this.log.error(`${err}`);
    }
  }

  async getNotificationHistoryByUserId(
    userId: number,
    cursor?: number,
    limit?: number,
  ) {
    this.log.log('Retrieving history...');

    try {
      let history = await this.prisma.notifications.findMany({
        where: {
          recipientId: userId,
        },
        take: limit || 15,
        skip: cursor ? 1 : 0, // Skip 1 if using a cursor
        ...(cursor && { cursor: { id: cursor } }), // Use the cursor if provided
        orderBy: {
          timestamp: 'desc', // Changed to descending order
        },
      });

      // Get the cursor from the first record since we're going in descending order
      const nextCursor = history.length ? history[history.length - 1].id : null;

      const payload: ApiResponse<Notifications[]> = {
        code: HttpStatus.OK,
        status: ResponseStatus.SUCCESS,
        message: 'Notification history fetch successful',
        data: history,
      };

      return { ...payload, nextCursor }; // Return the next cursor as part of the response
    } catch (err) {
      this.log.error(`${err}`);
    }
  }
}
