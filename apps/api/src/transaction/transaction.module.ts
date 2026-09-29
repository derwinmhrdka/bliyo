import { Module } from '@nestjs/common';
import { NotificationModule } from '../notification/notification.module';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';

@Module({
  imports: [NotificationModule],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}
