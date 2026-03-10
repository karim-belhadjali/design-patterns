export interface AutomationTrigger {
  deviceId: string;
  event: string;
  condition?: string;
}

export interface AutomationAction {
  deviceId: string;
  command: string;
  params?: Record<string, unknown>;
}

export interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  triggers: AutomationTrigger[];
  conditions?: string[];
  actions: AutomationAction[];
}
