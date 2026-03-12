import type { DeviceState } from '../../common/interfaces/scene.interface.js';

export class ActivateSceneDto {
  name!: string;
  deviceStates!: DeviceState[];
}
