import { DeviceType } from '../../common/enums/device-type.enum.js';
import { Protocol } from '../../common/enums/protocol.enum.js';

export class CreateDeviceRequestDto {
  type!: DeviceType;
  name!: string;
  roomId!: string;
  protocol!: Protocol;
}
