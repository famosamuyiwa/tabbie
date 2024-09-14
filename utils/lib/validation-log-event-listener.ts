import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ValidationLogTracer } from 'schemas/validation-tracer';
import { ValidationLogEventData } from './validation-log-event-data';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class ValidationLogEventListener {
  constructor(
    @InjectModel(ValidationLogTracer.name)
    private readonly ValidationLogModel: Model<ValidationLogTracer>,
  ) {}
  @OnEvent('validation-log-tracer-event')
  async handleManagementActivityEvent(payload: ValidationLogEventData) {
    this.ValidationLogModel.create(payload.eventData);
  }
}
