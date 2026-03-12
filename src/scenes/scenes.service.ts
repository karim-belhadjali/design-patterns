import { Injectable, NotFoundException } from '@nestjs/common';
import { DeviceRegistry } from '../devices/device-registry.js';
import type { DeviceState } from '../common/interfaces/scene.interface.js';
import type { Device } from '../common/interfaces/device.interface.js';

export interface SceneResult {
  sceneName: string;
  applied: DeviceState[];
  skipped: { deviceId: string; reason: string }[];
}

@Injectable()
export class ScenesService {
  private readonly registry = DeviceRegistry.getInstance();

  activate(name: string, deviceStates: DeviceState[]): SceneResult {
    const applied: DeviceState[] = [];
    const skipped: { deviceId: string; reason: string }[] = [];

    for (const desired of deviceStates) {
      const device = this.registry.findById(desired.deviceId);

      if (!device) {
        skipped.push({
          deviceId: desired.deviceId,
          reason: 'Device not found in registry',
        });
        continue;
      }

      if (device.status === 'OFFLINE') {
        skipped.push({
          deviceId: desired.deviceId,
          reason: `Device "${device.name}" is offline`,
        });
        continue;
      }

      this.registry.updateState(desired.deviceId, desired.properties);
      applied.push(desired);
    }

    return { sceneName: name, applied, skipped };
  }

  /**
   * Preview which devices a scene would affect without applying changes.
   * Looks up every device ID in the registry to check availability.
   */
  preview(deviceStates: DeviceState[]): {
    available: Device[];
    missing: string[];
  } {
    const available: Device[] = [];
    const missing: string[] = [];

    for (const state of deviceStates) {
      const device = this.registry.findById(state.deviceId);
      if (device) {
        available.push(device);
      } else {
        missing.push(state.deviceId);
      }
    }

    return { available, missing };
  }
}
