import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PhilipsHueAdapter } from '../adapters/philips-hue.adapter.js';
import { IkeaTradfriAdapter } from '../adapters/ikea-tradfri.adapter.js';
import { XiaomiAdapter } from '../adapters/xiaomi.adapter.js';
import { AdapterService } from '../adapter.service.js';
import { DeviceType } from '../../common/enums/device-type.enum.js';
import { Protocol } from '../../common/enums/protocol.enum.js';

const huePayload = {
  light_id: 'abc123',
  name: 'Living Room Bulb',
  bri: 254,
  ct: 366,
  on: true,
  model: 'LCT016',
  swversion: '1.50.2',
};

const tradfriPayload = {
  deviceId: 65537,
  deviceName: 'Kitchen Panel',
  brightness: 80,
  state: 1,
  type: 'TRADFRI bulb',
  firmware: '2.3.093',
};

const xiaomiPayload = {
  did: 'lumi.sensor.motion1',
  name: 'Hallway Sensor',
  props: [
    { key: 'motion', value: true },
    { key: 'lux', value: 420 },
  ],
  model: 'lumi.sensor_motion.v2',
  fw_ver: '3.1.4',
};

const xiaomiWifiPayload = {
  did: 'yeelight.light.mono1',
  name: 'Desk Lamp',
  props: [{ key: 'brightness', value: 50 }],
  model: 'yeelink.light.mono1',
  fw_ver: '1.4.6',
};

describe('PhilipsHueAdapter', () => {
  const adapter = new PhilipsHueAdapter();

  it('supports Hue payloads', () => {
    expect(adapter.supports(huePayload)).toBe(true);
  });

  it('rejects non-Hue payloads', () => {
    expect(adapter.supports(tradfriPayload)).toBe(false);
    expect(adapter.supports({})).toBe(false);
    expect(adapter.supports(null)).toBe(false);
  });

  it('maps bri 254 to brightness 100', () => {
    const device = adapter.adapt(huePayload);
    expect(device.properties['brightness']).toBe(100);
  });

  it('maps bri 0 to brightness 0', () => {
    const device = adapter.adapt({ ...huePayload, bri: 0 });
    expect(device.properties['brightness']).toBe(0);
  });

  it('maps on to isOn property', () => {
    const device = adapter.adapt(huePayload);
    expect(device.properties['isOn']).toBe(true);
  });

  it('sets protocol to WIFI and type to LIGHT', () => {
    const device = adapter.adapt(huePayload);
    expect(device.protocol).toBe(Protocol.WIFI);
    expect(device.type).toBe(DeviceType.LIGHT);
  });

  it('prefixes id with hue-', () => {
    const device = adapter.adapt(huePayload);
    expect(device.id).toBe('hue-abc123');
  });
});

describe('IkeaTradfriAdapter', () => {
  const adapter = new IkeaTradfriAdapter();

  it('supports Tradfri payloads', () => {
    expect(adapter.supports(tradfriPayload)).toBe(true);
  });

  it('rejects non-Tradfri payloads', () => {
    expect(adapter.supports(huePayload)).toBe(false);
  });

  it('maps state 1 to isOn true', () => {
    const device = adapter.adapt(tradfriPayload);
    expect(device.properties['isOn']).toBe(true);
  });

  it('maps state 0 to isOn false', () => {
    const device = adapter.adapt({ ...tradfriPayload, state: 0 });
    expect(device.properties['isOn']).toBe(false);
  });

  it('sets protocol to ZIGBEE', () => {
    const device = adapter.adapt(tradfriPayload);
    expect(device.protocol).toBe(Protocol.ZIGBEE);
  });

  it('prefixes id with tradfri-', () => {
    const device = adapter.adapt(tradfriPayload);
    expect(device.id).toBe('tradfri-65537');
  });

  it('preserves brightness directly', () => {
    const device = adapter.adapt(tradfriPayload);
    expect(device.properties['brightness']).toBe(80);
  });
});

describe('XiaomiAdapter', () => {
  const adapter = new XiaomiAdapter();

  it('supports Xiaomi payloads', () => {
    expect(adapter.supports(xiaomiPayload)).toBe(true);
  });

  it('rejects non-Xiaomi payloads', () => {
    expect(adapter.supports(huePayload)).toBe(false);
  });

  it('converts props array to properties Record', () => {
    const device = adapter.adapt(xiaomiPayload);
    expect(device.properties).toEqual({ motion: true, lux: 420 });
  });

  it('uses ZIGBEE for lumi.* models', () => {
    const device = adapter.adapt(xiaomiPayload);
    expect(device.protocol).toBe(Protocol.ZIGBEE);
  });

  it('uses WIFI for non-lumi models', () => {
    const device = adapter.adapt(xiaomiWifiPayload);
    expect(device.protocol).toBe(Protocol.WIFI);
  });

  it('prefixes id with xiaomi-', () => {
    const device = adapter.adapt(xiaomiPayload);
    expect(device.id).toBe('xiaomi-lumi.sensor.motion1');
  });
});

describe('AdapterService', () => {
  let service: AdapterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdapterService],
    }).compile();

    service = module.get<AdapterService>(AdapterService);
  });

  it('selects Hue adapter for Hue payload', () => {
    const device = service.ingest(huePayload);
    expect(device.id).toStartWith('hue-');
  });

  it('selects Tradfri adapter for Tradfri payload', () => {
    const device = service.ingest(tradfriPayload);
    expect(device.id).toStartWith('tradfri-');
  });

  it('selects Xiaomi adapter for Xiaomi payload', () => {
    const device = service.ingest(xiaomiPayload);
    expect(device.id).toStartWith('xiaomi-');
  });

  it('throws for unsupported payload', () => {
    expect(() => service.ingest({ unknown: true })).toThrow(
      BadRequestException,
    );
  });

  it('batch ingests mixed payloads', () => {
    const result = service.ingestBatch([
      huePayload,
      tradfriPayload,
      { garbage: true },
      xiaomiPayload,
    ]);

    expect(result.adapted).toHaveLength(3);
    expect(result.failed).toHaveLength(1);
    expect(result.failed[0].reason).toContain('No adapter');
  });

  it('returns supported vendor names', () => {
    const vendors = service.getSupportedVendors();
    expect(vendors).toContain('Philips Hue');
    expect(vendors).toContain('IKEA Tradfri');
    expect(vendors).toContain('Xiaomi');
  });
});

expect.extend({
  toStartWith(received: string, prefix: string) {
    const pass = received.startsWith(prefix);
    return {
      pass,
      message: () =>
        `expected "${received}" to start with "${prefix}"`,
    };
  },
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toStartWith(prefix: string): R;
    }
  }
}
