import { DeviceType } from '../enums/device-type.enum.js';
import { Protocol } from '../enums/protocol.enum.js';

export class CreateDeviceDto {
  name!: string;
  type!: DeviceType;
  protocol!: Protocol;
  roomId!: string;
  properties?: Record<string, unknown>;
}
