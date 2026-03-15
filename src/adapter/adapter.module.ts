import { Module } from '@nestjs/common';
import { AdapterController } from './adapter.controller.js';
import { AdapterService } from './adapter.service.js';

@Module({
  controllers: [AdapterController],
  providers: [AdapterService],
  exports: [AdapterService],
})
export class AdapterModule {}
