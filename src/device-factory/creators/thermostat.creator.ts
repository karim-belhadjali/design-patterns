import { DeviceType } from '../../common/enums/device-type.enum.js';
import { DeviceStatus } from '../../common/enums/device-status.enum.js';
import type { Protocol } from '../../common/enums/protocol.enum.js';
import type { Device } from '../../common/interfaces/device.interface.js';
import { DeviceCreator } from '../device-creator.js';

export class ThermostatCreator extends DeviceCreator {
  createDevice(name: string, roomId: string, protocol: Protocol): Device {
    return {
      id: '',
      name,
      type: DeviceType.THERMOSTAT,
      status: DeviceStatus.OFFLINE,
      protocol,
      roomId,
      properties: {
        targetTemperature: 21,
        currentTemperature: 20,
        mode: 'auto',
        unit: 'celsius',
      },
      firmwareVersion: '1.0.0',
      lastSeen: new Date(0),
    };
  }
}
