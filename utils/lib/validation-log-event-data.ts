import { ValidationLogTracer } from 'schemas/validation-tracer';

export class ValidationLogEventData {
  constructor(public readonly eventData: ValidationLogTracer) {}
}
