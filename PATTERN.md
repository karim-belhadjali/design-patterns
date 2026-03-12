# Singleton Pattern

## What It Is

Singleton ensures a class has exactly one instance and provides a global access point to it.

That's the textbook line. In practice, it solves a coordination problem: when multiple parts of your system need to read and write the same shared resource, and having two copies of that resource would cause bugs.

## Real-World Problems It Solves

### 1. Device Registry (this project)

A smart home app has a device service that registers devices and a scene service that activates scenes by looking up those devices. If each service maintained its own list, a light registered through the device service would be invisible to the scene service. Scene activation would skip it — "device not found."

One registry. Both services read and write to the same instance. That's the Singleton.

### 2. Database Connection Pool

Opening a new database connection on every request is expensive. A connection pool manages a fixed number of connections and reuses them. If two pools existed, you'd have double the connections to the database, hit limits faster, and lose track of which connections are in use.

### 3. Application Configuration

Your app reads config from environment variables, files, or a remote service on startup. If two config instances existed and one got refreshed while the other didn't, half your app would run on stale settings.

### 4. Logger

A centralized logger collects logs from every module and writes them to a file, stdout, or a remote service. Multiple logger instances would interleave writes, corrupt log files, or duplicate entries.

### 5. Hardware Access

A printer spooler, a serial port handler, or a GPU resource manager. The hardware is physically singular — two software instances fighting over it causes conflicts.

## When to Use It

- The resource is inherently singular (one database, one config, one hardware port)
- Multiple instances would cause data inconsistency or resource contention
- You need coordinated access from many parts of the system

## When NOT to Use It

- **When you're just avoiding passing dependencies around.** That's laziness, not a pattern. Use dependency injection instead.
- **When you need testability.** Singletons carry state between tests unless you add reset mechanisms. If you can use DI scoping (like NestJS providers), prefer that.
- **When the "one instance" requirement doesn't actually exist.** If two instances would work fine, don't force a Singleton.
- **When it becomes a god object.** If your Singleton keeps growing with unrelated responsibilities, you've turned it into global mutable state with a fancy name.

## How NestJS Handles It

NestJS providers are singletons by default within a module scope. When you declare a provider in a module, every class that injects it gets the same instance. This is the DI-managed version of the Singleton pattern.

In this project, we use a **manual Singleton** (`DeviceRegistry.getInstance()`) to demonstrate the classic pattern explicitly. In production NestJS code, you'd typically let the DI container manage singleton scope for you.

The manual approach makes sense when:
- The instance needs to exist before the DI container boots
- The class is used outside of NestJS (shared library, CLI tool)
- You want explicit control over instance lifecycle

## Code Walkthrough

### The Singleton — `DeviceRegistry`

```typescript
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

  register(device: Device): void { /* ... */ }
  findById(deviceId: string): Device | undefined { /* ... */ }
  findByRoom(roomId: string): Device[] { /* ... */ }
  updateState(deviceId: string, properties: Record<string, unknown>): Device { /* ... */ }
}
```

Three ingredients:
1. **Private constructor** — prevents `new DeviceRegistry()` from outside
2. **Static instance field** — stores the single instance
3. **Static `getInstance()` method** — creates on first call, returns the same one after

### Cross-Service Proof

The critical test: a device registered through `DevicesService` is visible to `ScenesService` because they share the same registry.

```typescript
it('scene resolves a device registered through a different service', () => {
  const light = devicesService.register({
    name: 'Living Room Light',
    type: DeviceType.LIGHT,
    protocol: Protocol.ZIGBEE,
    roomId: 'room-living',
    properties: { brightness: 100 },
  });

  const result = scenesService.activate('Good Night', [
    { deviceId: light.id, properties: { brightness: 10 } },
  ]);

  expect(result.applied).toHaveLength(1);
  expect(result.skipped).toHaveLength(0);
});
```

### What Breaks Without It

```typescript
it('two separate registries lose track of devices', () => {
  DeviceRegistry.resetInstance();
  const registryA = DeviceRegistry.getInstance();

  DeviceRegistry.resetInstance();
  const registryB = DeviceRegistry.getInstance();

  registryA.register(createDevice({ id: 'light-kitchen' }));

  // Registry B has no idea this device exists
  expect(registryB.findById('light-kitchen')).toBeUndefined();
});
```

## API Endpoints

```
POST   /devices              Register a new device
GET    /devices               List all registered devices
GET    /devices/:id           Get device by ID
GET    /devices?type=LIGHT    Filter by device type
GET    /devices/room/:roomId  All devices in a room
PATCH  /devices/:id/state     Update device state
DELETE /devices/:id           Unregister a device

POST   /scenes/activate       Activate a scene (resolves devices from the shared registry)
POST   /scenes/preview        Preview which devices a scene would affect
```

## Run It

```bash
git checkout pattern/singleton
npm install
npm test          # 27 tests
npm run start:dev # http://localhost:3000
```
