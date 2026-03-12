import { Body, Controller, Post } from '@nestjs/common';
import { AutomationBuilderService } from './automation-builder.service.js';
import { BuildAutomationDto } from './dto/build-automation.dto.js';
import type { AutomationRule } from './automation-rule.js';

@Controller('automations')
export class AutomationBuilderController {
  constructor(
    private readonly automationBuilderService: AutomationBuilderService,
  ) {}

  @Post('build')
  buildRule(@Body() dto: BuildAutomationDto): AutomationRule {
    return this.automationBuilderService.buildFromDto(dto);
  }

  @Post('presets/security-alert')
  createSecurityAlert(
    @Body() body: { sensorDeviceId: string; lightDeviceIds: string[] },
  ): AutomationRule {
    return this.automationBuilderService.securityAlertRule(
      body.sensorDeviceId,
      body.lightDeviceIds,
    );
  }

  @Post('presets/energy-saving')
  createEnergySaving(
    @Body() body: { thermostatId: string; sensorIds: string[] },
  ): AutomationRule {
    return this.automationBuilderService.energySavingRule(
      body.thermostatId,
      body.sensorIds,
    );
  }

  @Post('presets/good-night')
  createGoodNight(
    @Body() body: { deviceIds: string[] },
  ): AutomationRule {
    return this.automationBuilderService.goodNightRule(body.deviceIds);
  }
}
