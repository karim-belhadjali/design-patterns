import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DeviceFactoryModule } from './device-factory/device-factory.module.js';
import { AutomationBuilderModule } from './automation-builder/automation-builder.module.js';

@Module({
  imports: [DeviceFactoryModule, AutomationBuilderModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
