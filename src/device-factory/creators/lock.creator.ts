import { DeviceType } from '../../common/enums/device-type.enum.js';
import { DeviceStatus } from '../../common/enums/device-status.enum.js';
import type { Protocol } from '../../common/enums/protocol.enum.js';
import type { Device } from '../../common/interfaces/device.interface.js';
import { DeviceCreator } from '../device-creator.js';

export class LockCreator extends DeviceCreator {
  createDevice(name: string, roomId: string, protocol: Protocol): Device {
    return {
      id: '',
      name,
      type: DeviceType.LOCK,
      status: DeviceStatus.OFFLINE,
      protocol,
      roomId,
      properties: {
        isLocked: true,
        autoLockSeconds: 30,
        accessCodes: [],
      },
      firmwareVersion: '1.0.0',
      lastSeen: new Date(0),
    };
  }
}
