import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AdapterModule } from './adapter/adapter.module.js';

@Module({
  imports: [AdapterModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
