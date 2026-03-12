# Builder Pattern — Automation Rule Builder

## What is the Builder Pattern?

The Builder pattern separates the construction of a complex object from its representation. Instead of a constructor with a long parameter list or a raw object literal that defers validation to runtime, a Builder provides a step-by-step fluent API. Each method call adds one piece to the product, and a final `build()` call validates everything and returns an immutable result.

## Real-World Examples

| Domain | Builder Example |
|---|---|
| **SQL queries** | Knex `knex('users').where('age', '>', 18).orderBy('name')`, TypeORM `QueryBuilder` |
| **HTTP requests** | Axios config objects, `fetch` options, Supertest `.get().set().expect()` |
| **Test data** | factory_boy (Python), FactoryGirl / Fishery (JS), Builder pattern in test fixtures |
| **UI forms** | Angular `FormBuilder`, React Hook Form's `useForm` with chained validators |
| **Email / notifications** | Nodemailer message builder, SendGrid template builder |

## When to Use It

- The object has **many optional parameters** — a 10-argument constructor is unreadable and error-prone.
- You need **step-by-step validation** — each method can validate its input immediately rather than deferring to a single giant validation pass.
- The product should be **immutable** once created — the builder accumulates mutable state, then freezes it into a readonly object.
- You want **preset configurations** — factory methods on the service compose builder calls into named recipes (security alert, energy saving, good night).

## When NOT to Use It

- The object has **2–3 required fields** and no optional ones — a plain constructor or a simple factory function is clearer.
- You don't need validation or immutability — a plain object literal `{ name, value }` works fine.
- The construction logic is trivial — adding a Builder just for the sake of the pattern introduces unnecessary indirection.

## Builder vs Factory Method

| Concern | Factory Method | Builder |
|---|---|---|
| **Question answered** | *Which* concrete class to create? | *How* to assemble a complex object? |
| **Typical interface** | Single `create(type)` method | Fluent chain: `setX().addY().build()` |
| **Product complexity** | Varies, but constructor is usually short | Many optional/combinable parts |
| **Example in this project** | `DeviceFactoryService.create(type)` returns the right `Device` subtype | `AutomationRuleBuilder` assembles triggers, conditions, actions, notifications |

## Code Walkthrough

### 1. The Product — `AutomationRule`

An immutable value object with readonly properties. The constructor takes a config object and freezes everything:

```typescript
export class AutomationRule {
  readonly id: string;
  readonly name: string;
  readonly triggers: readonly Trigger[];
  readonly conditions: readonly Condition[];
  readonly actions: readonly Action[];
  readonly notifications: readonly Notification[];
  readonly cooldownSeconds: number;
  readonly enabled: boolean;

  constructor(config: AutomationRuleConfig) {
    // copies arrays, freezes them, freezes `this`
  }
}
```

### 2. The Builder — `AutomationRuleBuilder`

Accumulates mutable state with a fluent API. Every setter returns `this` for chaining. `build()` validates required fields and produces the frozen `AutomationRule`:

```typescript
const rule = new AutomationRuleBuilder()
  .setName('Security Alert')
  .addTrigger({ deviceId: 'sensor-1', event: 'motion_detected' })
  .addAction({ deviceId: 'light-1', command: 'turn_on' })
  .addNotification({ channel: 'push', message: 'Motion detected!' })
  .setCooldown(300)
  .build();
```

Validation on `build()`:
- Name is required
- At least one trigger is required
- At least one action is required

### 3. The Service — `AutomationBuilderService`

Wraps the builder in a NestJS injectable service and provides:
- `createBuilder()` — returns a fresh `AutomationRuleBuilder`
- `buildFromDto(dto)` — maps a DTO into builder calls and builds the rule
- Preset factory methods: `securityAlertRule()`, `energySavingRule()`, `goodNightRule()`

### 4. The Controller — `AutomationBuilderController`

Exposes REST endpoints under `/automations/`:

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/automations/build` | Build a custom automation rule from a JSON body |
| `POST` | `/automations/presets/security-alert` | Create a security alert preset rule |
| `POST` | `/automations/presets/energy-saving` | Create an energy saving preset rule |
| `POST` | `/automations/presets/good-night` | Create a good night preset rule |

### Example: Build a Custom Rule

```bash
curl -X POST http://localhost:3000/automations/build \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Morning Routine",
    "triggers": [{ "deviceId": "sensor-1", "event": "motion_detected" }],
    "conditions": [{ "type": "time_range", "params": { "after": "06:00", "before": "09:00" } }],
    "actions": [
      { "deviceId": "light-1", "command": "turn_on", "params": { "brightness": 80 } },
      { "deviceId": "speaker-1", "command": "play", "params": { "playlist": "morning" } }
    ],
    "notifications": [{ "channel": "push", "message": "Good morning!" }],
    "cooldownSeconds": 3600
  }'
```

### Example: Create a Security Alert Preset

```bash
curl -X POST http://localhost:3000/automations/presets/security-alert \
  -H 'Content-Type: application/json' \
  -d '{
    "sensorDeviceId": "sensor-front-door",
    "lightDeviceIds": ["light-porch", "light-hallway"]
  }'
```
