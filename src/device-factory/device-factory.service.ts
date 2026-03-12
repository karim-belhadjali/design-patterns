import { Injectable } from '@nestjs/common';
import { DeviceType } from '../common/enums/device-type.enum.js';
import type { Protocol } from '../common/enums/protocol.enum.js';
import type { Device } from '../common/interfaces/device.interface.js';
import { DeviceCreator } from './device-creator.js';
import { LightCreator } from './creators/light.creator.js';
import { ThermostatCreator } from './creators/thermostat.creator.js';
import { LockCreator } from './creators/lock.creator.js';
import { CameraCreator } from './creators/camera.creator.js';

@Injectable()
export class DeviceFactoryService {
  private readonly creators = new Map<DeviceType, DeviceCreator>([
    [DeviceType.LIGHT, new LightCreator()],
    [DeviceType.THERMOSTAT, new ThermostatCreator()],
    [DeviceType.LOCK, new LockCreator()],
    [DeviceType.CAMERA, new CameraCreator()],
  ]);

  create(
    type: DeviceType,
    name: string,
    roomId: string,
    protocol: Protocol,
  ): Device {
    const creator = this.creators.get(type);
    if (!creator) {
      throw new Error(`Unsupported device type: ${type}`);
    }
    return creator.registerDevice(name, roomId, protocol);
  }

  getSupportedTypes(): DeviceType[] {
    return [...this.creators.keys()];
  }
}
