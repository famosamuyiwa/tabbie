import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'otp-log', timestamps: true })
export class OTPLog {
  @Prop()
  configLength: number;

  @Prop()
  email: string;

  @Prop()
  token: string;

  @Prop()
  lifetime: Date;

  @Prop()
  isDeactivated: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const OTPLogSchema = SchemaFactory.createForClass(OTPLog);
