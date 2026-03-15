import { randomUUID } from 'crypto';
import type { DeviceAdapter } from '../interfaces/device-adapter.interface.js';
import type { PhilipsHueDevice } from '../interfaces/vendor-device.interface.js';
import type { Device } from '../../common/interfaces/device.interface.js';
import { DeviceType } from '../../common/enums/device-type.enum.js';
import { DeviceStatus } from '../../common/enums/device-status.enum.js';
import { Protocol } from '../../common/enums/protocol.enum.js';

export class PhilipsHueAdapter implements DeviceAdapter {
  readonly vendorName = 'Philips Hue';

  supports(raw: unknown): boolean {
    return (
      typeof raw === 'object' &&
      raw !== null &&
      'light_id' in raw &&
      'bri' in raw &&
      'on' in raw
    );
  }

  adapt(raw: unknown): Device {
    const hue = raw as PhilipsHueDevice;

    return {
      id: `hue-${hue.light_id}`,
      name: hue.name,
      type: DeviceType.LIGHT,
      status: DeviceStatus.ONLINE,
      protocol: Protocol.WIFI,
      roomId: '',
      properties: {
        brightness: Math.round((hue.bri / 254) * 100),
        colorTemp: hue.ct,
        isOn: hue.on,
      },
      firmwareVersion: hue.swversion,
      lastSeen: new Date(),
    };
  }
}
