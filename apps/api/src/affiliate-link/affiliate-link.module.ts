import { Module } from '@nestjs/common';
import { NotificationModule } from '../notification/notification.module';
import { AffiliateLinkController } from './affiliate-link.controller';
import { AffiliateLinkService } from './affiliate-link.service';

@Module({
  imports: [NotificationModule],
  controllers: [AffiliateLinkController],
  providers: [AffiliateLinkService],
})
export class AffiliateLinkModule {}
