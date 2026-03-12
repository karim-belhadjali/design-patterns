import { DeviceType } from '../../common/enums/device-type.enum.js';
import { Protocol } from '../../common/enums/protocol.enum.js';

export class RegisterDeviceDto {
  name!: string;
  type!: DeviceType;
  protocol!: Protocol;
  roomId!: string;
  properties?: Record<string, unknown>;
  firmwareVersion?: string;
}
