# Design Patterns — Smart Home Automation Platform

All 23 Gang of Four design patterns demonstrated through a **Smart Home Automation Platform** built with NestJS.

Each pattern lives on its own branch with a full-feature module, unit tests, and a companion explanation. The domain uses vocabulary everyone already understands — devices, rooms, scenes, automations — so the focus stays on the patterns, not the project.

## Getting Started

```bash
# Install dependencies
npm install

# Run the application
npm run start:dev

# Run tests
npm test

# Build
npm run build
```

## Tech Stack

- **NestJS** 11 + TypeScript 5 (strict mode)
- **Node.js** 22
- No database — in-memory data keeps the focus on patterns

## Domain Objects

| Object | Description |
|--------|-------------|
| **Device** | Light, thermostat, lock, camera, sensor, speaker, switch |
| **Room** | A physical space containing devices |
| **Home** | Top-level entity containing rooms |
| **Scene** | A saved configuration of multiple device states ("Good Night", "Movie Night") |
| **Automation Rule** | Trigger → condition → action chains ("if motion detected after sunset, turn on lights") |
| **User** | Homeowner, family member, or guest with role-based permissions |

## Pattern Index

### Creational Patterns

| # | Pattern | Smart Home Application | Branch | Post |
|---|---------|----------------------|--------|------|
| 1 | **Singleton** | `SmartHomeHub` — one central hub per home coordinating all devices | [`pattern/singleton`](../../tree/pattern/singleton) | TBD |
| 2 | **Factory Method** | `DeviceCreator` — subclasses for lights, thermostats, locks, cameras handle their own instantiation | [`pattern/factory-method`](../../tree/pattern/factory-method) | TBD |
| 3 | **Abstract Factory** | `DeviceEcosystemFactory` — families of compatible devices per brand (Philips Hue, IKEA Tradfri) | [`pattern/abstract-factory`](../../tree/pattern/abstract-factory) | TBD |
| 4 | **Builder** | `AutomationRuleBuilder` — construct complex automation rules step by step (trigger → condition → action → notification) | [`pattern/builder`](../../tree/pattern/builder) | TBD |
| 5 | **Prototype** | `SceneCloner` — clone a "Movie Night" scene to create "Date Night" by tweaking a few settings | [`pattern/prototype`](../../tree/pattern/prototype) | TBD |

### Structural Patterns

| # | Pattern | Smart Home Application | Branch | Post |
|---|---------|----------------------|--------|------|
| 6 | **Adapter** | `DeviceProtocolAdapter` — unified interface wrapping Zigbee, Z-Wave, and WiFi protocols | [`pattern/adapter`](../../tree/pattern/adapter) | TBD |
| 7 | **Bridge** | `DeviceBridge` — separate device abstraction (Light, Thermostat) from communication protocol (WiFi, Zigbee, Bluetooth) | [`pattern/bridge`](../../tree/pattern/bridge) | TBD |
| 8 | **Composite** | `HomeComposite` — Home → Floors → Rooms → Device Groups → Devices with uniform `control()` at every level | [`pattern/composite`](../../tree/pattern/composite) | TBD |
| 9 | **Decorator** | `DeviceDecorator` — wrap devices with logging, throttling, or energy monitoring without modifying device code | [`pattern/decorator`](../../tree/pattern/decorator) | TBD |
| 10 | **Facade** | `SceneController` — one-tap `activate("Good Night")` hiding 10+ individual device operations | [`pattern/facade`](../../tree/pattern/facade) | TBD |
| 11 | **Flyweight** | `DeviceProfilePool` — hundreds of identical smart bulbs in a building share one configuration profile | [`pattern/flyweight`](../../tree/pattern/flyweight) | TBD |
| 12 | **Proxy** | `DeviceProxy` — permission checks, cached state, and lazy-loaded history before reaching the real device | [`pattern/proxy`](../../tree/pattern/proxy) | TBD |

### Behavioral Patterns

| # | Pattern | Smart Home Application | Branch | Post |
|---|---------|----------------------|--------|------|
| 13 | **Chain of Responsibility** | `CommandValidationChain` — auth → permissions → device availability → rate limit → execute | [`pattern/chain-of-responsibility`](../../tree/pattern/chain-of-responsibility) | TBD |
| 14 | **Command** | `DeviceCommand` — turn on, set temperature, lock door as objects with execute() and undo() | [`pattern/command`](../../tree/pattern/command) | TBD |
| 15 | **Interpreter** | `AutomationDslInterpreter` — parse `"WHEN motion.kitchen DETECTS movement THEN lights.kitchen SET brightness 80"` | [`pattern/interpreter`](../../tree/pattern/interpreter) | TBD |
| 16 | **Iterator** | `DeviceEventIterator` — page through millions of sensor readings without loading everything into memory | [`pattern/iterator`](../../tree/pattern/iterator) | TBD |
| 17 | **Mediator** | `HomeAutomationMediator` — alarm triggers coordinated response across lighting, HVAC, cameras, and notifications | [`pattern/mediator`](../../tree/pattern/mediator) | TBD |
| 18 | **Memento** | `HomeStateMemento` — save entire home state before a party, restore everything after | [`pattern/memento`](../../tree/pattern/memento) | TBD |
| 19 | **Observer** | `DeviceEventObserver` — device state change notifies dashboard, mobile app, automation engine, and energy monitor | [`pattern/observer`](../../tree/pattern/observer) | TBD |
| 20 | **State** | `SecuritySystemState` — Disarmed → Armed Stay → Armed Away → Triggered → Alarm with valid transitions | [`pattern/state`](../../tree/pattern/state) | TBD |
| 21 | **Strategy** | `EnergySavingStrategy` — swap between aggressive, comfort, and schedule-based energy optimization | [`pattern/strategy`](../../tree/pattern/strategy) | TBD |
| 22 | **Template Method** | `DeviceSetupTemplate` — discover → authenticate → configure → test → register with device-specific overrides | [`pattern/template-method`](../../tree/pattern/template-method) | TBD |
| 23 | **Visitor** | `HomeReportVisitor` — traverse device tree to generate energy, maintenance, or security audit reports | [`pattern/visitor`](../../tree/pattern/visitor) | TBD |

## Project Structure

```
src/
├── main.ts                     # Application entry point
├── app.module.ts               # Root module
├── app.controller.ts           # Health/status endpoint
├── app.service.ts              # App-level service
└── common/
    ├── enums/                  # DeviceType, DeviceStatus, Protocol, SecurityMode
    ├── interfaces/             # Device, Room, Scene, Automation, User
    └── dto/                    # CreateDevice, CreateRoom, CreateScene
```

Each pattern branch adds a module under `src/<pattern-name>/` with:

```
src/<pattern-name>/
├── <pattern-name>.module.ts    # NestJS module
├── <pattern-name>.controller.ts # REST endpoints demonstrating usage
├── <pattern-name>.service.ts   # Business logic implementing the pattern
├── interfaces/                 # Pattern-specific abstractions
├── dto/                        # Request/response DTOs
├── __tests__/                  # Unit tests
└── PATTERN.md                  # Pattern explanation + LinkedIn post draft
```

## License

UNLICENSED
