import { Module } from '@nestjs/common';
import { DeviceFactoryController } from './device-factory.controller.js';
import { DeviceFactoryService } from './device-factory.service.js';

@Module({
  controllers: [DeviceFactoryController],
  providers: [DeviceFactoryService],
  exports: [DeviceFactoryService],
})
export class DeviceFactoryModule {}
