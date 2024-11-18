import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Notifications } from '@prisma/client';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('history/:userId')
  async getNotificationsHistory(@Param('userId') userId: number) {
    return this.notificationsService.getNotificationHistoryByUserId(userId);
  }

  @Post('notify')
  async sendNotification(@Body() body: Notifications) {
    return this.notificationsService.sendNotification(body);
  }
}
