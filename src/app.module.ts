import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DevicesModule } from './devices/devices.module.js';
import { ScenesModule } from './scenes/scenes.module.js';

@Module({
  imports: [DevicesModule, ScenesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
