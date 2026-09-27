import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CommissionController } from './commission.controller';
import { CommissionProcessor } from './commission.processor';
import { CommissionService } from './commission.service';

const redisEnabled = process.env.REDIS_ENABLED !== 'false';

@Module({
  imports: redisEnabled ? [BullModule.registerQueue({ name: 'commission' })] : [],
  controllers: [CommissionController],
  providers: redisEnabled ? [CommissionService, CommissionProcessor] : [CommissionService],
})
export class CommissionModule {}
