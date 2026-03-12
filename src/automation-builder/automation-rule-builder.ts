import { randomUUID } from 'node:crypto';
import {
  AutomationRule,
  type Trigger,
  type Condition,
  type Action,
  type Notification,
} from './automation-rule.js';

export class AutomationRuleBuilder {
  private name: string | undefined;
  private triggers: Trigger[] = [];
  private conditions: Condition[] = [];
  private actions: Action[] = [];
  private notifications: Notification[] = [];
  private cooldownSeconds = 0;
  private enabled = true;

  setName(name: string): this {
    this.name = name;
    return this;
  }

  addTrigger(trigger: Trigger): this {
    this.triggers.push(trigger);
    return this;
  }

  addCondition(condition: Condition): this {
    this.conditions.push(condition);
    return this;
  }

  addAction(action: Action): this {
    this.actions.push(action);
    return this;
  }

  addNotification(notification: Notification): this {
    this.notifications.push(notification);
    return this;
  }

  setCooldown(seconds: number): this {
    this.cooldownSeconds = seconds;
    return this;
  }

  enable(): this {
    this.enabled = true;
    return this;
  }

  disable(): this {
    this.enabled = false;
    return this;
  }

  build(): AutomationRule {
    if (!this.name) {
      throw new Error('Automation rule must have a name');
    }
    if (this.triggers.length === 0) {
      throw new Error('Automation rule must have at least one trigger');
    }
    if (this.actions.length === 0) {
      throw new Error('Automation rule must have at least one action');
    }

    return new AutomationRule({
      id: randomUUID(),
      name: this.name,
      triggers: this.triggers,
      conditions: this.conditions,
      actions: this.actions,
      notifications: this.notifications,
      cooldownSeconds: this.cooldownSeconds,
      enabled: this.enabled,
    });
  }

  reset(): this {
    this.name = undefined;
    this.triggers = [];
    this.conditions = [];
    this.actions = [];
    this.notifications = [];
    this.cooldownSeconds = 0;
    this.enabled = true;
    return this;
  }
}
