import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DeviceFactoryModule } from './device-factory/device-factory.module.js';

@Module({
  imports: [DeviceFactoryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
