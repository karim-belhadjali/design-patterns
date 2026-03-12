import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DeviceRegistry } from './device-registry.js';
import { RegisterDeviceDto } from './dto/register-device.dto.js';
import { DeviceStatus } from '../common/enums/device-status.enum.js';
import { DeviceType } from '../common/enums/device-type.enum.js';
import type { Device } from '../common/interfaces/device.interface.js';

@Injectable()
export class DevicesService {
  private readonly registry = DeviceRegistry.getInstance();

  register(dto: RegisterDeviceDto): Device {
    const device: Device = {
      id: randomUUID(),
      name: dto.name,
      type: dto.type,
      status: DeviceStatus.ONLINE,
      protocol: dto.protocol,
      roomId: dto.roomId,
      properties: dto.properties ?? {},
      firmwareVersion: dto.firmwareVersion ?? '1.0.0',
      lastSeen: new Date(),
    };

    try {
      this.registry.register(device);
    } catch {
      throw new ConflictException(`Device "${device.id}" already registered`);
    }

    return device;
  }

  findAll(): Device[] {
    return this.registry.allDevices();
  }

  findById(id: string): Device {
    const device = this.registry.findById(id);
    if (!device) {
      throw new NotFoundException(`Device "${id}" not found`);
    }
    return device;
  }

  findByRoom(roomId: string): Device[] {
    return this.registry.findByRoom(roomId);
  }

  findByType(type: DeviceType): Device[] {
    return this.registry.findByType(type);
  }

  updateState(id: string, properties: Record<string, unknown>): Device {
    try {
      return this.registry.updateState(id, properties);
    } catch {
      throw new NotFoundException(`Device "${id}" not found`);
    }
  }

  remove(id: string): void {
    const removed = this.registry.unregister(id);
    if (!removed) {
      throw new NotFoundException(`Device "${id}" not found`);
    }
  }

  getRegistrySize(): number {
    return this.registry.size;
  }
}
