import './load-env';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AffiliateLinkModule } from './affiliate-link/affiliate-link.module';
import { TransactionModule } from './transaction/transaction.module';
import { CommissionModule } from './commission/commission.module';
import { NotificationModule } from './notification/notification.module';
import { RegionModule } from './region/region.module';

const redisEnabled = process.env.REDIS_ENABLED !== 'false';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    ...(redisEnabled
      ? [
          BullModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
              connection: {
                host: config.get<string>('REDIS_HOST') || 'localhost',
                port: Number(config.get('REDIS_PORT') || 6379),
                password: config.get<string>('REDIS_PASSWORD') || undefined,
                maxRetriesPerRequest: null,
              },
            }),
          }),
        ]
      : []),
    PrismaModule,
    AuthModule,
    UserModule,
    AffiliateLinkModule,
    TransactionModule,
    CommissionModule,
    NotificationModule,
    RegionModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
