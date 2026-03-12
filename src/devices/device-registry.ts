import { Device } from '../common/interfaces/device.interface.js';
import { DeviceType } from '../common/enums/device-type.enum.js';
import { DeviceStatus } from '../common/enums/device-status.enum.js';

/**
 * Singleton — one registry per application.
 *
 * Every service that needs to find, command, or observe a device goes through
 * this registry. Two registries would mean two different views of which
 * devices exist, which leads to scenes targeting "missing" devices and
 * status dashboards showing stale data.
 */
export class DeviceRegistry {
  private static instance: DeviceRegistry | null = null;

  private readonly devices = new Map<string, Device>();

  private constructor() {}

  static getInstance(): DeviceRegistry {
    if (!DeviceRegistry.instance) {
      DeviceRegistry.instance = new DeviceRegistry();
    }
    return DeviceRegistry.instance;
  }

  /**
   * Visible for testing only — resets the singleton so each test suite
   * starts with a clean registry.
   */
  static resetInstance(): void {
    DeviceRegistry.instance = null;
  }

  register(device: Device): void {
    if (this.devices.has(device.id)) {
      throw new Error(`Device "${device.id}" is already registered`);
    }
    this.devices.set(device.id, { ...device });
  }

  unregister(deviceId: string): boolean {
    return this.devices.delete(deviceId);
  }

  findById(deviceId: string): Device | undefined {
    const device = this.devices.get(deviceId);
    return device ? { ...device } : undefined;
  }

  findByRoom(roomId: string): Device[] {
    return this.allDevices().filter((d) => d.roomId === roomId);
  }

  findByType(type: DeviceType): Device[] {
    return this.allDevices().filter((d) => d.type === type);
  }

  findByStatus(status: DeviceStatus): Device[] {
    return this.allDevices().filter((d) => d.status === status);
  }

  updateState(
    deviceId: string,
    properties: Record<string, unknown>,
  ): Device {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error(`Device "${deviceId}" not found in registry`);
    }

    device.properties = { ...device.properties, ...properties };
    device.lastSeen = new Date();
    return { ...device };
  }

  updateStatus(deviceId: string, status: DeviceStatus): Device {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error(`Device "${deviceId}" not found in registry`);
    }

    device.status = status;
    device.lastSeen = new Date();
    return { ...device };
  }

  allDevices(): Device[] {
    return Array.from(this.devices.values()).map((d) => ({ ...d }));
  }

  get size(): number {
    return this.devices.size;
  }

  clear(): void {
    this.devices.clear();
  }
}
