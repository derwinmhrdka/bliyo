import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('commission')
export class CommissionProcessor extends WorkerHost {
  private readonly logger = new Logger(CommissionProcessor.name);

  async process(job: Job): Promise<void> {
    this.logger.log(`Job komisi diterima: ${job.name}`);
  }
}
