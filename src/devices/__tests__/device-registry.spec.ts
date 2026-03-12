import { DeviceRegistry } from '../device-registry.js';
import { DeviceType } from '../../common/enums/device-type.enum.js';
import { DeviceStatus } from '../../common/enums/device-status.enum.js';
import { Protocol } from '../../common/enums/protocol.enum.js';
import type { Device } from '../../common/interfaces/device.interface.js';

function createDevice(overrides: Partial<Device> = {}): Device {
  return {
    id: 'light-001',
    name: 'Living Room Light',
    type: DeviceType.LIGHT,
    status: DeviceStatus.ONLINE,
    protocol: Protocol.ZIGBEE,
    roomId: 'room-living',
    properties: { brightness: 100, color: '#ffffff' },
    firmwareVersion: '2.1.0',
    lastSeen: new Date(),
    ...overrides,
  };
}

describe('DeviceRegistry (Singleton)', () => {
  beforeEach(() => {
    DeviceRegistry.resetInstance();
  });

  describe('singleton behavior', () => {
    it('returns the same instance on multiple calls', () => {
      const first = DeviceRegistry.getInstance();
      const second = DeviceRegistry.getInstance();
      expect(first).toBe(second);
    });

    it('shares state across all references', () => {
      const ref1 = DeviceRegistry.getInstance();
      const ref2 = DeviceRegistry.getInstance();

      ref1.register(createDevice({ id: 'dev-a' }));

      expect(ref2.findById('dev-a')).toBeDefined();
      expect(ref2.size).toBe(1);
    });

    it('resetting the instance creates a fresh registry', () => {
      const old = DeviceRegistry.getInstance();
      old.register(createDevice());

      DeviceRegistry.resetInstance();

      const fresh = DeviceRegistry.getInstance();
      expect(fresh).not.toBe(old);
      expect(fresh.size).toBe(0);
    });
  });

  describe('what breaks without a singleton', () => {
    it('two separate registries lose track of devices', () => {
      // Simulate what happens if DeviceRegistry were NOT a singleton:
      // two separate instances, each with their own Map.
      DeviceRegistry.resetInstance();
      const registryA = DeviceRegistry.getInstance();

      DeviceRegistry.resetInstance();
      const registryB = DeviceRegistry.getInstance();

      registryA.register(createDevice({ id: 'light-kitchen' }));

      // Registry B has no idea this device exists
      expect(registryB.findById('light-kitchen')).toBeUndefined();

      // This is the exact bug the Singleton prevents:
      // a scene service using registryB would skip this device.
    });
  });

  describe('register', () => {
    it('adds a device to the registry', () => {
      const registry = DeviceRegistry.getInstance();
      const device = createDevice();

      registry.register(device);

      expect(registry.size).toBe(1);
      expect(registry.findById('light-001')).toEqual(
        expect.objectContaining({ id: 'light-001', name: 'Living Room Light' }),
      );
    });

    it('throws when registering a duplicate ID', () => {
      const registry = DeviceRegistry.getInstance();
      registry.register(createDevice());

      expect(() => registry.register(createDevice())).toThrow(
        'already registered',
      );
    });

    it('stores a copy, not a reference', () => {
      const registry = DeviceRegistry.getInstance();
      const device = createDevice();
      registry.register(device);

      device.name = 'Modified Externally';

      expect(registry.findById('light-001')?.name).toBe('Living Room Light');
    });
  });

  describe('lookup', () => {
    it('finds devices by room', () => {
      const registry = DeviceRegistry.getInstance();
      registry.register(createDevice({ id: 'a', roomId: 'kitchen' }));
      registry.register(createDevice({ id: 'b', roomId: 'kitchen' }));
      registry.register(createDevice({ id: 'c', roomId: 'bedroom' }));

      const kitchen = registry.findByRoom('kitchen');
      expect(kitchen).toHaveLength(2);
    });

    it('finds devices by type', () => {
      const registry = DeviceRegistry.getInstance();
      registry.register(createDevice({ id: 'a', type: DeviceType.LIGHT }));
      registry.register(
        createDevice({ id: 'b', type: DeviceType.THERMOSTAT }),
      );

      expect(registry.findByType(DeviceType.LIGHT)).toHaveLength(1);
      expect(registry.findByType(DeviceType.THERMOSTAT)).toHaveLength(1);
    });

    it('returns undefined for unknown device ID', () => {
      const registry = DeviceRegistry.getInstance();
      expect(registry.findById('nonexistent')).toBeUndefined();
    });
  });

  describe('state management', () => {
    it('updates device properties', () => {
      const registry = DeviceRegistry.getInstance();
      registry.register(createDevice());

      const updated = registry.updateState('light-001', { brightness: 50 });

      expect(updated.properties).toEqual(
        expect.objectContaining({ brightness: 50, color: '#ffffff' }),
      );
    });

    it('updates device status', () => {
      const registry = DeviceRegistry.getInstance();
      registry.register(createDevice());

      const updated = registry.updateStatus('light-001', DeviceStatus.OFFLINE);

      expect(updated.status).toBe(DeviceStatus.OFFLINE);
    });

    it('throws when updating unknown device', () => {
      const registry = DeviceRegistry.getInstance();

      expect(() =>
        registry.updateState('ghost', { brightness: 50 }),
      ).toThrow('not found');
    });
  });

  describe('unregister', () => {
    it('removes a device', () => {
      const registry = DeviceRegistry.getInstance();
      registry.register(createDevice());

      expect(registry.unregister('light-001')).toBe(true);
      expect(registry.size).toBe(0);
    });

    it('returns false for unknown device', () => {
      const registry = DeviceRegistry.getInstance();
      expect(registry.unregister('ghost')).toBe(false);
    });
  });
});
