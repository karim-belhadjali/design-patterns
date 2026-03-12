import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { DevicesService } from './devices.service.js';
import { RegisterDeviceDto } from './dto/register-device.dto.js';
import { UpdateDeviceStateDto } from './dto/update-device-state.dto.js';
import { DeviceType } from '../common/enums/device-type.enum.js';
import type { Device } from '../common/interfaces/device.interface.js';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  register(@Body() dto: RegisterDeviceDto): Device {
    return this.devicesService.register(dto);
  }

  @Get()
  findAll(@Query('type') type?: DeviceType): Device[] {
    if (type) {
      return this.devicesService.findByType(type);
    }
    return this.devicesService.findAll();
  }

  @Get('room/:roomId')
  findByRoom(@Param('roomId') roomId: string): Device[] {
    return this.devicesService.findByRoom(roomId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Device {
    return this.devicesService.findById(id);
  }

  @Patch(':id/state')
  updateState(
    @Param('id') id: string,
    @Body() dto: UpdateDeviceStateDto,
  ): Device {
    return this.devicesService.updateState(id, dto.properties);
  }

  @Delete(':id')
  remove(@Param('id') id: string): { removed: boolean } {
    this.devicesService.remove(id);
    return { removed: true };
  }
}
