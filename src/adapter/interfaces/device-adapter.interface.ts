import type { Device } from '../../common/interfaces/device.interface.js';

export interface DeviceAdapter {
  readonly vendorName: string;
  adapt(raw: unknown): Device;
  supports(raw: unknown): boolean;
}
