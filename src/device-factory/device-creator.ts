import { randomUUID } from 'node:crypto';
import { DeviceStatus } from '../common/enums/device-status.enum.js';
import type { Protocol } from '../common/enums/protocol.enum.js';
import type { Device } from '../common/interfaces/device.interface.js';

export abstract class DeviceCreator {
  abstract createDevice(
    name: string,
    roomId: string,
    protocol: Protocol,
  ): Device;

  registerDevice(name: string, roomId: string, protocol: Protocol): Device {
    const device = this.createDevice(name, roomId, protocol);
    device.id = randomUUID();
    device.status = DeviceStatus.ONLINE;
    device.lastSeen = new Date();
    return device;
  }
}
