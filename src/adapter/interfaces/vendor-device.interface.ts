export interface PhilipsHueDevice {
  light_id: string;
  name: string;
  bri: number;
  ct: number;
  on: boolean;
  model: string;
  swversion: string;
}

export interface IkeaTradfriDevice {
  deviceId: number;
  deviceName: string;
  brightness: number;
  state: number;
  type: string;
  firmware: string;
}

export interface XiaomiDevice {
  did: string;
  name: string;
  props: Array<{ key: string; value: unknown }>;
  model: string;
  fw_ver: string;
}
