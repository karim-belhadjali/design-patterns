# Adapter Pattern

## What It Is

The Adapter pattern makes incompatible interfaces work together by placing a translator between them. You don't change the source. You don't change the target. You write a small class that converts one format into the other.

## Real-World Problems It Solves

### 1. Multi-Vendor Device Ingestion (this project)

A smart home app receives data from Philips Hue, IKEA Tradfri, and Xiaomi. Each vendor returns a completely different JSON shape. Hue uses `bri` (0-254) for brightness. Tradfri uses `brightness` (0-100). Xiaomi packs everything into a `props` array.

Each vendor gets its own adapter that translates its format into a unified `Device` interface. The rest of the app never touches raw vendor data.

### 2. ORM Layers

An ORM like Prisma or TypeORM adapts SQL result rows into typed objects. Your code calls `findById()` and gets a `User` object — the ORM adapts the raw database row behind the scenes.

### 3. Payment Gateway Unification

Stripe, PayPal, and bank transfers each have different APIs, authentication flows, and response formats. A payment adapter wraps each one behind a single `processPayment()` interface.

### 4. Cloud Storage Abstraction

S3, Google Cloud Storage, and Azure Blob each have different SDKs. A storage adapter gives you one `upload()` / `download()` / `delete()` interface regardless of the cloud provider.

### 5. Legacy System Integration

A new microservice needs data from a 15-year-old SOAP API. Rather than rewriting the old system, an adapter translates SOAP XML responses into the JSON your new service expects.

## When to Use It

- You can't change the source (third-party API, legacy system, hardware protocol)
- Your app already has a well-defined internal interface
- The translation is mechanical — mapping fields, converting units, reshaping structures

## When NOT to Use It

- You control both sides — just make them compatible directly
- The formats are already identical — an adapter that does nothing is noise
- The translation involves complex business logic — that belongs in a service, not an adapter

## Adapter vs Bridge

Both involve abstraction layers, but they solve different problems at different times:

- **Adapter** fixes an incompatibility **after the fact** — the systems already exist, they just don't fit together
- **Bridge** separates abstraction from implementation **by design upfront** — you plan for it before building

## Code Walkthrough

### The Target Interface

```typescript
interface DeviceAdapter {
  readonly vendorName: string;
  adapt(raw: unknown): Device;
  supports(raw: unknown): boolean;
}
```

Every adapter implements `supports()` (can I handle this payload?) and `adapt()` (translate it).

### A Concrete Adapter

```typescript
export class PhilipsHueAdapter implements DeviceAdapter {
  readonly vendorName = 'Philips Hue';

  supports(raw: unknown): boolean {
    return typeof raw === 'object' && raw !== null
      && 'light_id' in raw && 'bri' in raw && 'on' in raw;
  }

  adapt(raw: unknown): Device {
    const hue = raw as PhilipsHueDevice;
    return {
      id: `hue-${hue.light_id}`,
      name: hue.name,
      type: DeviceType.LIGHT,
      protocol: Protocol.WIFI,
      properties: {
        brightness: Math.round((hue.bri / 254) * 100),
        isOn: hue.on,
      },
      // ...
    };
  }
}
```

### The Service Selects the Right Adapter

```typescript
@Injectable()
export class AdapterService {
  private readonly adapters: DeviceAdapter[] = [
    new PhilipsHueAdapter(),
    new IkeaTradfriAdapter(),
    new XiaomiAdapter(),
  ];

  ingest(rawPayload: unknown): Device {
    const adapter = this.adapters.find(a => a.supports(rawPayload));
    if (!adapter) throw new BadRequestException('No adapter found');
    return adapter.adapt(rawPayload);
  }
}
```

Adding a fourth vendor? Write one new adapter class. Register it in the array. Nothing else changes.

## API Endpoints

```
POST /adapter/ingest              Ingest a single vendor payload → unified Device
POST /adapter/ingest-batch        Ingest multiple payloads → { adapted[], failed[] }
GET  /adapter/supported-vendors   List supported vendor names
```

## Run It

```bash
git checkout pattern/adapter
npm install
npm test
npm run start:dev  # http://localhost:3000
```
