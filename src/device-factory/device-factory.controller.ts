import { Body, Controller, Get, Post } from '@nestjs/common';
import { DeviceType } from '../common/enums/device-type.enum.js';
import type { Device } from '../common/interfaces/device.interface.js';
import { DeviceFactoryService } from './device-factory.service.js';
import { CreateDeviceRequestDto } from './dto/create-device-request.dto.js';

@Controller('device-factory')
export class DeviceFactoryController {
  constructor(private readonly deviceFactoryService: DeviceFactoryService) {}

  @Post()
  createDevice(@Body() dto: CreateDeviceRequestDto): Device {
    return this.deviceFactoryService.create(
      dto.type,
      dto.name,
      dto.roomId,
      dto.protocol,
    );
  }

  @Get('types')
  getSupportedTypes(): DeviceType[] {
    return this.deviceFactoryService.getSupportedTypes();
  }
}
