import { AutomationRuleBuilder } from '../automation-rule-builder.js';
import { AutomationBuilderService } from '../automation-builder.service.js';
import type { Trigger, Action } from '../automation-rule.js';

const validTrigger: Trigger = {
  deviceId: 'sensor-1',
  event: 'motion_detected',
};

const validAction: Action = {
  deviceId: 'light-1',
  command: 'turn_on',
};

describe('AutomationRuleBuilder', () => {
  let builder: AutomationRuleBuilder;

  beforeEach(() => {
    builder = new AutomationRuleBuilder();
  });

  it('should build a valid rule with fluent chaining', () => {
    const rule = builder
      .setName('Test Rule')
      .addTrigger(validTrigger)
      .addAction(validAction)
      .build();

    expect(rule.name).toBe('Test Rule');
    expect(rule.triggers).toHaveLength(1);
    expect(rule.actions).toHaveLength(1);
    expect(rule.id).toBeDefined();
  });

  it('should throw if name is missing', () => {
    builder.addTrigger(validTrigger).addAction(validAction);
    expect(() => builder.build()).toThrow('Automation rule must have a name');
  });

  it('should throw if no triggers are provided', () => {
    builder.setName('No Triggers').addAction(validAction);
    expect(() => builder.build()).toThrow(
      'Automation rule must have at least one trigger',
    );
  });

  it('should throw if no actions are provided', () => {
    builder.setName('No Actions').addTrigger(validTrigger);
    expect(() => builder.build()).toThrow(
      'Automation rule must have at least one action',
    );
  });

  it('should allow conditions and notifications to be optional', () => {
    const rule = builder
      .setName('Minimal Rule')
      .addTrigger(validTrigger)
      .addAction(validAction)
      .build();

    expect(rule.conditions).toHaveLength(0);
    expect(rule.notifications).toHaveLength(0);
  });

  it('should default cooldown to 0', () => {
    const rule = builder
      .setName('Default Cooldown')
      .addTrigger(validTrigger)
      .addAction(validAction)
      .build();

    expect(rule.cooldownSeconds).toBe(0);
  });

  it('should default enabled to true', () => {
    const rule = builder
      .setName('Enabled Default')
      .addTrigger(validTrigger)
      .addAction(validAction)
      .build();

    expect(rule.enabled).toBe(true);
  });

  it('should allow disabling a rule', () => {
    const rule = builder
      .setName('Disabled Rule')
      .addTrigger(validTrigger)
      .addAction(validAction)
      .disable()
      .build();

    expect(rule.enabled).toBe(false);
  });

  it('should reset the builder state', () => {
    builder
      .setName('Before Reset')
      .addTrigger(validTrigger)
      .addAction(validAction)
      .addCondition({ type: 'time_range', params: { after: '22:00' } })
      .addNotification({ channel: 'push', message: 'test' })
      .setCooldown(60)
      .disable();

    builder.reset();

    expect(() => builder.build()).toThrow('Automation rule must have a name');
  });

  it('should produce an immutable rule', () => {
    const rule = builder
      .setName('Immutable Rule')
      .addTrigger(validTrigger)
      .addAction(validAction)
      .build();

    expect(() => {
      (rule as Record<string, unknown>)['name'] = 'Changed';
    }).toThrow();

    expect(() => {
      (rule.triggers as Trigger[]).push({
        deviceId: 'hacked',
        event: 'hacked',
      });
    }).toThrow();
  });

  it('should support multiple triggers, actions, conditions, and notifications', () => {
    const rule = builder
      .setName('Complex Rule')
      .addTrigger({ deviceId: 'sensor-1', event: 'motion_detected' })
      .addTrigger({ deviceId: 'sensor-2', event: 'door_opened' })
      .addCondition({ type: 'time_range', params: { after: '22:00', before: '06:00' } })
      .addCondition({ type: 'day_of_week', params: { days: ['mon', 'tue'] } })
      .addAction({ deviceId: 'light-1', command: 'turn_on' })
      .addAction({ deviceId: 'lock-1', command: 'lock' })
      .addNotification({ channel: 'push', message: 'Alert!' })
      .addNotification({ channel: 'email', message: 'Alert!', recipient: 'user@example.com' })
      .setCooldown(120)
      .build();

    expect(rule.triggers).toHaveLength(2);
    expect(rule.conditions).toHaveLength(2);
    expect(rule.actions).toHaveLength(2);
    expect(rule.notifications).toHaveLength(2);
    expect(rule.cooldownSeconds).toBe(120);
  });
});

describe('AutomationBuilderService presets', () => {
  let service: AutomationBuilderService;

  beforeEach(() => {
    service = new AutomationBuilderService();
  });

  it('securityAlertRule should produce a valid rule', () => {
    const rule = service.securityAlertRule('sensor-1', ['light-1', 'light-2']);

    expect(rule.name).toBe('Security Alert');
    expect(rule.triggers).toHaveLength(1);
    expect(rule.triggers[0].event).toBe('motion_detected');
    expect(rule.actions).toHaveLength(2);
    expect(rule.notifications).toHaveLength(1);
    expect(rule.notifications[0].channel).toBe('push');
    expect(rule.conditions).toHaveLength(1);
    expect(rule.cooldownSeconds).toBe(300);
    expect(rule.enabled).toBe(true);
  });

  it('energySavingRule should produce a valid rule', () => {
    const rule = service.energySavingRule('thermostat-1', [
      'sensor-1',
      'sensor-2',
    ]);

    expect(rule.name).toBe('Energy Saving');
    expect(rule.triggers).toHaveLength(2);
    expect(rule.actions).toHaveLength(1);
    expect(rule.actions[0].command).toBe('set_temperature');
    expect(rule.notifications).toHaveLength(1);
    expect(rule.cooldownSeconds).toBe(1800);
    expect(rule.enabled).toBe(true);
  });

  it('goodNightRule should produce a valid rule', () => {
    const rule = service.goodNightRule(['light-1', 'tv-1', 'speaker-1']);

    expect(rule.name).toBe('Good Night');
    expect(rule.triggers).toHaveLength(1);
    expect(rule.conditions).toHaveLength(1);
    expect(rule.conditions[0].type).toBe('time_range');
    expect(rule.actions).toHaveLength(3);
    expect(rule.actions.every((a) => a.command === 'turn_off')).toBe(true);
    expect(rule.notifications).toHaveLength(1);
    expect(rule.enabled).toBe(true);
  });

  it('buildFromDto should build a rule from a DTO', () => {
    const rule = service.buildFromDto({
      name: 'DTO Rule',
      triggers: [validTrigger],
      actions: [validAction],
      conditions: [{ type: 'device_state', params: { state: 'on' } }],
      notifications: [{ channel: 'sms', message: 'Hello' }],
      cooldownSeconds: 60,
      enabled: false,
    });

    expect(rule.name).toBe('DTO Rule');
    expect(rule.triggers).toHaveLength(1);
    expect(rule.actions).toHaveLength(1);
    expect(rule.conditions).toHaveLength(1);
    expect(rule.notifications).toHaveLength(1);
    expect(rule.cooldownSeconds).toBe(60);
    expect(rule.enabled).toBe(false);
  });
});
