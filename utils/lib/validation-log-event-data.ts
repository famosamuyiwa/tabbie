import { ValidationLog } from '@prisma/client';

export class ValidationLogEventData {
  constructor(public readonly eventData: ValidationLog) {}
}
