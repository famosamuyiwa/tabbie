import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  collection: 'validation-log-tracer',
  timestamps: true,
})
export class ValidationLogTracer {
  @Prop({ required: true })
  uniqueId: string;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  field: string;
}

export const ValidationLogTracerSchema =
  SchemaFactory.createForClass(ValidationLogTracer);
