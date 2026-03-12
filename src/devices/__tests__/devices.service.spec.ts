import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DevicesService } from '../devices.service.js';
import { DeviceRegistry } from '../device-registry.js';
import { DeviceType } from '../../common/enums/device-type.enum.js';
import { Protocol } from '../../common/enums/protocol.enum.js';
import type { RegisterDeviceDto } from '../dto/register-device.dto.js';

function sampleDto(overrides: Partial<RegisterDeviceDto> = {}): RegisterDeviceDto {
  return {
    name: 'Kitchen Light',
    type: DeviceType.LIGHT,
    protocol: Protocol.WIFI,
    roomId: 'room-kitchen',
    ...overrides,
  };
}

describe('DevicesService', () => {
  let service: DevicesService;

  beforeEach(async () => {
    DeviceRegistry.resetInstance();

    const module: TestingModule = await Test.createTestingModule({
      providers: [DevicesService],
    }).compile();

    service = module.get<DevicesService>(DevicesService);
  });

  it('registers a device and retrieves it by ID', () => {
    const device = service.register(sampleDto());

    const found = service.findById(device.id);
    expect(found.name).toBe('Kitchen Light');
  });

  it('lists all devices', () => {
    service.register(sampleDto({ name: 'Light A' }));
    service.register(sampleDto({ name: 'Light B' }));

    expect(service.findAll()).toHaveLength(2);
  });

  it('filters by room', () => {
    service.register(sampleDto({ roomId: 'kitchen' }));
    service.register(sampleDto({ roomId: 'bedroom' }));

    expect(service.findByRoom('kitchen')).toHaveLength(1);
  });

  it('updates device state', () => {
    const device = service.register(sampleDto());
    const updated = service.updateState(device.id, { brightness: 75 });

    expect(updated.properties).toEqual(
      expect.objectContaining({ brightness: 75 }),
    );
  });

  it('removes a device', () => {
    const device = service.register(sampleDto());
    service.remove(device.id);

    expect(() => service.findById(device.id)).toThrow(NotFoundException);
  });

  it('throws NotFoundException for unknown device', () => {
    expect(() => service.findById('nonexistent')).toThrow(NotFoundException);
  });

  it('uses the same registry instance as any other service would', () => {
    service.register(sampleDto({ name: 'Proof Device' }));

    const registry = DeviceRegistry.getInstance();
    expect(registry.size).toBe(1);

    const devices = registry.allDevices();
    expect(devices[0].name).toBe('Proof Device');
  });
});
