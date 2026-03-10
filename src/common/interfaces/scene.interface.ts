export interface DeviceState {
  deviceId: string;
  properties: Record<string, unknown>;
}

export interface Scene {
  id: string;
  name: string;
  description: string;
  deviceStates: DeviceState[];
  iconName?: string;
}
