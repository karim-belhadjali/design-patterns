import { DeviceType } from '../../common/enums/device-type.enum.js';
import { DeviceStatus } from '../../common/enums/device-status.enum.js';
import { Protocol } from '../../common/enums/protocol.enum.js';
import type { Device } from '../../common/interfaces/device.interface.js';
import { DeviceCreator } from '../device-creator.js';
import { LightCreator } from '../creators/light.creator.js';
import { ThermostatCreator } from '../creators/thermostat.creator.js';
import { LockCreator } from '../creators/lock.creator.js';
import { CameraCreator } from '../creators/camera.creator.js';
import { DeviceFactoryService } from '../device-factory.service.js';

describe('DeviceFactory — Factory Method pattern', () => {
  const roomId = 'room-1';
  const protocol = Protocol.WIFI;

  describe('LightCreator', () => {
    const creator = new LightCreator();

    it('should produce a LIGHT device with correct defaults', () => {
      const device = creator.registerDevice('Desk Lamp', roomId, protocol);

      expect(device.type).toBe(DeviceType.LIGHT);
      expect(device.properties).toEqual({
        brightness: 100,
        color: '#ffffff',
        isOn: false,
      });
    });
  });

  describe('ThermostatCreator', () => {
    const creator = new ThermostatCreator();

    it('should produce a THERMOSTAT device with correct defaults', () => {
      const device = creator.registerDevice('Living Room', roomId, protocol);

      expect(device.type).toBe(DeviceType.THERMOSTAT);
      expect(device.properties).toEqual({
        targetTemperature: 21,
        currentTemperature: 20,
        mode: 'auto',
        unit: 'celsius',
      });
    });
  });

  describe('LockCreator', () => {
    const creator = new LockCreator();

    it('should produce a LOCK device with correct defaults', () => {
      const device = creator.registerDevice('Front Door', roomId, protocol);

      expect(device.type).toBe(DeviceType.LOCK);
      expect(device.properties).toEqual({
        isLocked: true,
        autoLockSeconds: 30,
        accessCodes: [],
      });
    });
  });

  describe('CameraCreator', () => {
    const creator = new CameraCreator();

    it('should produce a CAMERA device with correct defaults', () => {
      const device = creator.registerDevice('Porch Cam', roomId, protocol);

      expect(device.type).toBe(DeviceType.CAMERA);
      expect(device.properties).toEqual({
        resolution: '1080p',
        nightVision: true,
        isRecording: false,
        motionDetection: true,
      });
    });
  });

  describe('Common registration behaviour', () => {
    it.each([
      ['LightCreator', new LightCreator()],
      ['ThermostatCreator', new ThermostatCreator()],
      ['LockCreator', new LockCreator()],
      ['CameraCreator', new CameraCreator()],
    ] as [string, DeviceCreator][])(
      '%s — registered device has id, ONLINE status, and lastSeen',
      (_label, creator) => {
        const device = creator.registerDevice('Test', roomId, protocol);

        expect(device.id).toBeDefined();
        expect(device.id.length).toBeGreaterThan(0);
        expect(device.status).toBe(DeviceStatus.ONLINE);
        expect(device.lastSeen).toBeInstanceOf(Date);
        expect(device.lastSeen.getTime()).toBeGreaterThan(0);
      },
    );
  });

  describe('DeviceFactoryService', () => {
    let service: DeviceFactoryService;

    beforeEach(() => {
      service = new DeviceFactoryService();
    });

    it('should select the right creator for each supported type', () => {
      const light = service.create(DeviceType.LIGHT, 'L', roomId, protocol);
      expect(light.type).toBe(DeviceType.LIGHT);

      const thermostat = service.create(
        DeviceType.THERMOSTAT,
        'T',
        roomId,
        protocol,
      );
      expect(thermostat.type).toBe(DeviceType.THERMOSTAT);

      const lock = service.create(DeviceType.LOCK, 'K', roomId, protocol);
      expect(lock.type).toBe(DeviceType.LOCK);

      const camera = service.create(DeviceType.CAMERA, 'C', roomId, protocol);
      expect(camera.type).toBe(DeviceType.CAMERA);
    });

    it('should throw for an unsupported device type', () => {
      expect(() =>
        service.create(DeviceType.SENSOR, 'S', roomId, protocol),
      ).toThrow('Unsupported device type: SENSOR');
    });

    it('should list all supported device types', () => {
      const types = service.getSupportedTypes();

      expect(types).toContain(DeviceType.LIGHT);
      expect(types).toContain(DeviceType.THERMOSTAT);
      expect(types).toContain(DeviceType.LOCK);
      expect(types).toContain(DeviceType.CAMERA);
      expect(types).toHaveLength(4);
    });

    it('adding a new creator does not require changing existing ones (open/closed)', () => {
      class SpeakerCreator extends DeviceCreator {
        createDevice(
          name: string,
          rid: string,
          proto: Protocol,
        ): Device {
          return {
            id: '',
            name,
            type: DeviceType.SPEAKER,
            status: DeviceStatus.OFFLINE,
            protocol: proto,
            roomId: rid,
            properties: { volume: 50 },
            firmwareVersion: '1.0.0',
            lastSeen: new Date(0),
          };
        }
      }

      const speakerCreator = new SpeakerCreator();
      const device = speakerCreator.registerDevice(
        'Kitchen Speaker',
        roomId,
        protocol,
      );

      expect(device.type).toBe(DeviceType.SPEAKER);
      expect(device.properties).toEqual({ volume: 50 });
      expect(device.status).toBe(DeviceStatus.ONLINE);
      expect(device.id).toBeDefined();
    });
  });
});
