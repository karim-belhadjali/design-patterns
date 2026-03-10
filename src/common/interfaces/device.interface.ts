import { DeviceType } from '../enums/device-type.enum.js';
import { DeviceStatus } from '../enums/device-status.enum.js';
import { Protocol } from '../enums/protocol.enum.js';

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  protocol: Protocol;
  roomId: string;
  properties: Record<string, unknown>;
  firmwareVersion: string;
  lastSeen: Date;
}

export interface DeviceCommand {
  deviceId: string;
  action: string;
  params?: Record<string, unknown>;
  timestamp: Date;
}

export interface DeviceEvent {
  deviceId: string;
  event: string;
  data: Record<string, unknown>;
  timestamp: Date;
}
