// src/utils/validation-log.helper.ts
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Logger } from '@nestjs/common';
import { ValidationLogTracer } from 'schemas/validation-tracer';
import { ValidationLogEventData } from 'utils/lib/validation-log-event-data';

export class Utils {
  private readonly log = new Logger(Utils.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  createValidationLogEvent(data: ValidationLogTracer) {
    const isEmitted = this.eventEmitter.emit(
      'validation-log-tracer-event',
      new ValidationLogEventData(data),
    );
    if (isEmitted) {
      this.log.debug('Successfully created validation log event');
    } else {
      this.log.debug('Failed to create validation log event');
    }
  }
}
