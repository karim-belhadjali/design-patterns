import type { Trigger, Condition, Action, Notification } from '../automation-rule.js';

export class BuildAutomationDto {
  name!: string;
  triggers!: Trigger[];
  conditions?: Condition[];
  actions!: Action[];
  notifications?: Notification[];
  cooldownSeconds?: number;
  enabled?: boolean;
}
