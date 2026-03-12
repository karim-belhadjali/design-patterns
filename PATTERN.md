# Factory Method Pattern

## What It Is

Factory Method defines an interface for creating an object but lets subclasses decide which class to instantiate. Instead of calling `new` directly, you call a method that delegates creation to a specialized creator.

In plain terms: you say "give me a device" and the factory figures out whether to build a light, thermostat, lock, or camera — each with its own defaults, validation, and setup logic.

## Real-World Problems It Solves

### 1. Device Creation (this project)

A smart home app supports lights, thermostats, locks, and cameras. Each type needs different default properties — a light needs brightness and color, a thermostat needs temperature range and mode, a lock needs auto-lock timer and access codes.

Without Factory Method, you end up with a switch-case that grows every time you add a new device type. Every change to that switch risks breaking existing device creation. Factory Method lets each device type own its creation logic in its own class.

### 2. Document Parsers

An application imports PDF, DOCX, CSV, and JSON files. Each format requires a different parser with different dependencies and configuration. A `ParserFactory` lets you add a new format by creating a new parser class — without touching the existing ones.

### 3. Notification Channels

Your system sends notifications via email, SMS, push, and Slack. Each channel has a different API, different rate limits, different retry logic. A `NotificationFactory` creates the right sender for each channel without coupling the notification service to every channel's implementation.

### 4. Payment Processors

An e-commerce checkout supports Stripe, PayPal, and bank transfers. Each processor has a different SDK, different authentication flow, different webhook format. Factory Method lets you add a new processor without changing the checkout logic.

### 5. Plugin Systems

Any application with a plugin architecture uses Factory Method. The host application defines the interface; each plugin provides its own factory. The host never needs to know the concrete plugin class.

## When to Use It

- You don't know ahead of time which concrete class you'll need
- You want to isolate creation logic so adding a new type doesn't touch existing code (Open/Closed Principle)
- Each type has meaningfully different initialization — not just different field values, but different validation rules, dependencies, or setup steps

## When NOT to Use It

- **All types are created the same way.** If the only difference is a few field values, a simple config object or enum lookup is simpler than a class hierarchy.
- **You only have one or two types.** Factory Method adds indirection. If you're not going to add more types, a direct constructor is fine.
- **You're adding abstraction for abstraction's sake.** If a switch-case with three branches is readable and stable, it doesn't need a pattern.

## How It Differs from Abstract Factory

- **Factory Method** creates a **single product**. One method, one object.
- **Abstract Factory** creates a **family of related products**. A Philips Hue factory creates a Hue light AND a Hue sensor AND a Hue bridge — objects that belong together.

Use Factory Method when the decision is "which type?" Use Abstract Factory when the decision is "which family?"

## Code Walkthrough

### The Abstract Creator

```typescript
export abstract class DeviceCreator {
  abstract createDevice(
    name: string,
    roomId: string,
    protocol: Protocol,
  ): Device;

  registerDevice(
    name: string,
    roomId: string,
    protocol: Protocol,
  ): Device {
    const device = this.createDevice(name, roomId, protocol);
    // Common setup: assign ID, set status, timestamp
    device.id = randomUUID();
    device.status = DeviceStatus.ONLINE;
    device.lastSeen = new Date();
    return device;
  }
}
```

`registerDevice` is the template — it handles what's common to all devices. `createDevice` is the factory method — each subclass fills in the type-specific parts.

### A Concrete Creator

```typescript
export class LightCreator extends DeviceCreator {
  createDevice(name: string, roomId: string, protocol: Protocol): Device {
    return {
      name,
      roomId,
      protocol,
      type: DeviceType.LIGHT,
      properties: { brightness: 100, color: '#ffffff', isOn: false },
      firmwareVersion: '1.0.0',
    } as Device;
  }
}
```

Adding a new device type means adding a new creator class. No existing code changes.

### The Service

```typescript
@Injectable()
export class DeviceFactoryService {
  private creators = new Map<DeviceType, DeviceCreator>([
    [DeviceType.LIGHT, new LightCreator()],
    [DeviceType.THERMOSTAT, new ThermostatCreator()],
    [DeviceType.LOCK, new LockCreator()],
    [DeviceType.CAMERA, new CameraCreator()],
  ]);

  create(type: DeviceType, name: string, roomId: string, protocol: Protocol): Device {
    const creator = this.creators.get(type);
    if (!creator) throw new Error(`Unsupported device type: ${type}`);
    return creator.registerDevice(name, roomId, protocol);
  }
}
```

## API Endpoints

```
POST /device-factory         Create a device (body: { type, name, roomId, protocol })
GET  /device-factory/types   List supported device types
```

## Run It

```bash
git checkout pattern/factory-method
npm install
npm test
npm run start:dev  # http://localhost:3000
```
