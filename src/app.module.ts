import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ValidationLogEventListener } from 'utils/lib/validation-log-event-listener';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { OtpModule } from './modules/otp/otp.module';
import { PrismaService } from './prisma.service';
import { SplitModule } from './modules/split/split.module';
import { ExpenseModule } from './modules/expense/expense.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    // ChatModule,
    MongooseModule.forRoot(process.env.MONGODB_URI),
    EventEmitterModule.forRoot(),
    UserModule,
    AuthModule,
    OtpModule,
    SplitModule,
    ExpenseModule,
  ],
  controllers: [AppController],
  providers: [AppService, ValidationLogEventListener, PrismaService],
})
export class AppModule {}
