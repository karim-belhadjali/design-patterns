import { Test, TestingModule } from '@nestjs/testing';
import { ScenesService } from '../scenes.service.js';
import { DevicesService } from '../../devices/devices.service.js';
import { DeviceRegistry } from '../../devices/device-registry.js';
import { DeviceType } from '../../common/enums/device-type.enum.js';
import { Protocol } from '../../common/enums/protocol.enum.js';

describe('ScenesService', () => {
  let scenesService: ScenesService;
  let devicesService: DevicesService;

  beforeEach(async () => {
    DeviceRegistry.resetInstance();

    const module: TestingModule = await Test.createTestingModule({
      providers: [ScenesService, DevicesService],
    }).compile();

    scenesService = module.get<ScenesService>(ScenesService);
    devicesService = module.get<DevicesService>(DevicesService);
  });

  describe('singleton proof: cross-service registry', () => {
    it('scene resolves a device registered through a different service', () => {
      // DevicesService registers a light
      const light = devicesService.register({
        name: 'Living Room Light',
        type: DeviceType.LIGHT,
        protocol: Protocol.ZIGBEE,
        roomId: 'room-living',
        properties: { brightness: 100 },
      });

      // ScenesService activates a scene targeting that same device
      const result = scenesService.activate('Good Night', [
        { deviceId: light.id, properties: { brightness: 10 } },
      ]);

      expect(result.applied).toHaveLength(1);
      expect(result.skipped).toHaveLength(0);

      // Verify the state was actually updated in the shared registry
      const updated = devicesService.findById(light.id);
      expect(updated.properties).toEqual(
        expect.objectContaining({ brightness: 10 }),
      );
    });

    it('scene skips devices that were never registered', () => {
      const result = scenesService.activate('Movie Night', [
        { deviceId: 'ghost-device', properties: { brightness: 0 } },
      ]);

      expect(result.applied).toHaveLength(0);
      expect(result.skipped).toHaveLength(1);
      expect(result.skipped[0].reason).toContain('not found');
    });

    it('scene skips offline devices', () => {
      const light = devicesService.register({
        name: 'Porch Light',
        type: DeviceType.LIGHT,
        protocol: Protocol.WIFI,
        roomId: 'room-porch',
      });

      // Simulate the device going offline
      const registry = DeviceRegistry.getInstance();
      registry.updateStatus(light.id, 'OFFLINE' as any);

      const result = scenesService.activate('Away Mode', [
        { deviceId: light.id, properties: { brightness: 0 } },
      ]);

      expect(result.skipped).toHaveLength(1);
      expect(result.skipped[0].reason).toContain('offline');
    });
  });

  describe('preview', () => {
    it('shows which devices are available and which are missing', () => {
      const thermostat = devicesService.register({
        name: 'Hallway Thermostat',
        type: DeviceType.THERMOSTAT,
        protocol: Protocol.ZWAVE,
        roomId: 'room-hallway',
      });

      const preview = scenesService.preview([
        { deviceId: thermostat.id, properties: { temperature: 20 } },
        { deviceId: 'nonexistent', properties: { brightness: 0 } },
      ]);

      expect(preview.available).toHaveLength(1);
      expect(preview.missing).toEqual(['nonexistent']);
    });
  });
});
