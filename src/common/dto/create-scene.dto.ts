import { DeviceState } from '../interfaces/scene.interface.js';

export class CreateSceneDto {
  name!: string;
  description!: string;
  deviceStates!: DeviceState[];
  iconName?: string;
}
