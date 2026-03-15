import type { DeviceAdapter } from '../interfaces/device-adapter.interface.js';
import type { XiaomiDevice } from '../interfaces/vendor-device.interface.js';
import type { Device } from '../../common/interfaces/device.interface.js';
import { DeviceType } from '../../common/enums/device-type.enum.js';
import { DeviceStatus } from '../../common/enums/device-status.enum.js';
import { Protocol } from '../../common/enums/protocol.enum.js';

export class XiaomiAdapter implements DeviceAdapter {
  readonly vendorName = 'Xiaomi';

  supports(raw: unknown): boolean {
    return (
      typeof raw === 'object' &&
      raw !== null &&
      'did' in raw &&
      'props' in raw &&
      Array.isArray((raw as XiaomiDevice).props)
    );
  }

  adapt(raw: unknown): Device {
    const xiaomi = raw as XiaomiDevice;

    const properties: Record<string, unknown> = {};
    for (const prop of xiaomi.props) {
      properties[prop.key] = prop.value;
    }

    const isZigbee = xiaomi.model.startsWith('lumi.');

    return {
      id: `xiaomi-${xiaomi.did}`,
      name: xiaomi.name,
      type: DeviceType.SENSOR,
      status: DeviceStatus.ONLINE,
      protocol: isZigbee ? Protocol.ZIGBEE : Protocol.WIFI,
      roomId: '',
      properties,
      firmwareVersion: xiaomi.fw_ver,
      lastSeen: new Date(),
    };
  }
}
