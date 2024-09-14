import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ValidationLogTracer,
  ValidationLogTracerSchema,
} from 'schemas/validation-tracer';
import { ValidationLogEventListener } from 'utils/lib/validation-log-event-listener';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot(),
    ChatModule,
    MongooseModule.forRoot(process.env.MONGODB_URI),
    MongooseModule.forFeature([
      { name: ValidationLogTracer.name, schema: ValidationLogTracerSchema },
    ]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, ValidationLogEventListener],
})
export class AppModule {}
