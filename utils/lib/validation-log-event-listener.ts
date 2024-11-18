import { Injectable, Logger } from '@nestjs/common';
import { ValidationLogEventData } from './validation-log-event-data';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ValidationLogEventListener {
  private readonly logger = new Logger(ValidationLogEventListener.name);

  constructor(private prisma: PrismaService) {}
  @OnEvent('validation-log-tracer-event')
  async handleManagementActivityEvent(payload: ValidationLogEventData) {
    try {
      // Save the validation log event data to the database
      const savedLog = await this.prisma.validationLog.create({
        data: payload.eventData, // Ensure this matches your Prisma model
      });

      this.logger.debug('Validation log event saved:', savedLog);
    } catch (error) {
      this.logger.error('Error saving validation log event:', error);
    }
  }
}
