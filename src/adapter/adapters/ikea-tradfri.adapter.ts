import type { DeviceAdapter } from '../interfaces/device-adapter.interface.js';
import type { IkeaTradfriDevice } from '../interfaces/vendor-device.interface.js';
import type { Device } from '../../common/interfaces/device.interface.js';
import { DeviceType } from '../../common/enums/device-type.enum.js';
import { DeviceStatus } from '../../common/enums/device-status.enum.js';
import { Protocol } from '../../common/enums/protocol.enum.js';

export class IkeaTradfriAdapter implements DeviceAdapter {
  readonly vendorName = 'IKEA Tradfri';

  supports(raw: unknown): boolean {
    return (
      typeof raw === 'object' &&
      raw !== null &&
      'deviceId' in raw &&
      'deviceName' in raw &&
      'state' in raw
    );
  }

  adapt(raw: unknown): Device {
    const tradfri = raw as IkeaTradfriDevice;

    return {
      id: `tradfri-${tradfri.deviceId}`,
      name: tradfri.deviceName,
      type: DeviceType.LIGHT,
      status: DeviceStatus.ONLINE,
      protocol: Protocol.ZIGBEE,
      roomId: '',
      properties: {
        brightness: tradfri.brightness,
        isOn: tradfri.state === 1,
      },
      firmwareVersion: tradfri.firmware,
      lastSeen: new Date(),
    };
  }
}
