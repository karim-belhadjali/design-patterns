export interface Trigger {
  deviceId: string;
  event: string;
  threshold?: number;
}

export interface Condition {
  type: 'time_range' | 'device_state' | 'day_of_week';
  params: Record<string, unknown>;
}

export interface Action {
  deviceId: string;
  command: string;
  params?: Record<string, unknown>;
}

export interface Notification {
  channel: 'push' | 'email' | 'sms';
  message: string;
  recipient?: string;
}

export interface AutomationRuleConfig {
  id: string;
  name: string;
  triggers: Trigger[];
  conditions: Condition[];
  actions: Action[];
  notifications: Notification[];
  cooldownSeconds: number;
  enabled: boolean;
}

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
    this.id = config.id;
    this.name = config.name;
    this.triggers = Object.freeze([...config.triggers]);
    this.conditions = Object.freeze([...config.conditions]);
    this.actions = Object.freeze([...config.actions]);
    this.notifications = Object.freeze([...config.notifications]);
    this.cooldownSeconds = config.cooldownSeconds;
    this.enabled = config.enabled;
    Object.freeze(this);
  }
}
