import { Controller, Post, Body } from '@nestjs/common';
import { ScenesService } from './scenes.service.js';
import type { SceneResult } from './scenes.service.js';
import { ActivateSceneDto } from './dto/activate-scene.dto.js';
import type { Device } from '../common/interfaces/device.interface.js';

@Controller('scenes')
export class ScenesController {
  constructor(private readonly scenesService: ScenesService) {}

  @Post('activate')
  activate(@Body() dto: ActivateSceneDto): SceneResult {
    return this.scenesService.activate(dto.name, dto.deviceStates);
  }

  @Post('preview')
  preview(
    @Body() dto: ActivateSceneDto,
  ): { available: Device[]; missing: string[] } {
    return this.scenesService.preview(dto.deviceStates);
  }
}
