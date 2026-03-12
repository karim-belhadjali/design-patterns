import { Module } from '@nestjs/common';
import { AutomationBuilderController } from './automation-builder.controller.js';
import { AutomationBuilderService } from './automation-builder.service.js';

@Module({
  controllers: [AutomationBuilderController],
  providers: [AutomationBuilderService],
  exports: [AutomationBuilderService],
})
export class AutomationBuilderModule {}
