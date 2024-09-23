// src/utils/validation-log.helper.ts
import { EventEmitter2 } from '@nestjs/event-emitter';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ValidationLogTracer } from 'schemas/validation-tracer';
import { ValidationLogEventData } from 'utils/lib/validation-log-event-data';
import { APIResponse } from 'interfaces/common';

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

export async function handleResponse(response) {
  try {
    console.log(response);

    return {
      status: 'success',
      code: 201,
      data: response,
    };
  } catch (err) {
    console.log(err);

    // Check if the error is a ConflictException
    if (err instanceof HttpException) {
      console.log(`${err}`);
    } else {
      throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
