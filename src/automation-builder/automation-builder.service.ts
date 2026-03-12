import { Injectable } from '@nestjs/common';
import { AutomationRule } from './automation-rule.js';
import { AutomationRuleBuilder } from './automation-rule-builder.js';
import type { BuildAutomationDto } from './dto/build-automation.dto.js';

@Injectable()
export class AutomationBuilderService {
  createBuilder(): AutomationRuleBuilder {
    return new AutomationRuleBuilder();
  }

  buildFromDto(dto: BuildAutomationDto): AutomationRule {
    const builder = this.createBuilder().setName(dto.name);

    for (const trigger of dto.triggers) {
      builder.addTrigger(trigger);
    }

    if (dto.conditions) {
      for (const condition of dto.conditions) {
        builder.addCondition(condition);
      }
    }

    for (const action of dto.actions) {
      builder.addAction(action);
    }

    if (dto.notifications) {
      for (const notification of dto.notifications) {
        builder.addNotification(notification);
      }
    }

    if (dto.cooldownSeconds !== undefined) {
      builder.setCooldown(dto.cooldownSeconds);
    }

    if (dto.enabled === false) {
      builder.disable();
    }

    return builder.build();
  }

  securityAlertRule(
    sensorDeviceId: string,
    lightDeviceIds: string[],
  ): AutomationRule {
    const builder = this.createBuilder()
      .setName('Security Alert')
      .addTrigger({
        deviceId: sensorDeviceId,
        event: 'motion_detected',
      })
      .addCondition({
        type: 'time_range',
        params: { after: '22:00', before: '06:00' },
      })
      .setCooldown(300)
      .addNotification({
        channel: 'push',
        message: `Motion detected by sensor ${sensorDeviceId}`,
      });

    for (const lightId of lightDeviceIds) {
      builder.addAction({
        deviceId: lightId,
        command: 'turn_on',
        params: { brightness: 100 },
      });
    }

    return builder.build();
  }

  energySavingRule(
    thermostatId: string,
    sensorIds: string[],
  ): AutomationRule {
    const builder = this.createBuilder()
      .setName('Energy Saving')
      .setCooldown(1800);

    for (const sensorId of sensorIds) {
      builder.addTrigger({
        deviceId: sensorId,
        event: 'no_motion',
        threshold: 1800,
      });
    }

    builder
      .addAction({
        deviceId: thermostatId,
        command: 'set_temperature',
        params: { temperature: 18 },
      })
      .addNotification({
        channel: 'push',
        message: 'No motion detected for 30 minutes — lowering temperature',
      });

    return builder.build();
  }

  goodNightRule(deviceIds: string[]): AutomationRule {
    const builder = this.createBuilder()
      .setName('Good Night')
      .addTrigger({
        deviceId: 'system',
        event: 'schedule',
      })
      .addCondition({
        type: 'time_range',
        params: { after: '23:00' },
      });

    for (const deviceId of deviceIds) {
      builder.addAction({
        deviceId,
        command: 'turn_off',
      });
    }

    builder.addNotification({
      channel: 'push',
      message: 'Good night! All devices have been turned off.',
    });

    return builder.build();
  }
}
