import { Controller, Post, Get, Body } from '@nestjs/common';
import { AdapterService } from './adapter.service.js';
import type { BatchResult } from './adapter.service.js';
import type { Device } from '../common/interfaces/device.interface.js';

@Controller('adapter')
export class AdapterController {
  constructor(private readonly adapterService: AdapterService) {}

  @Post('ingest')
  ingest(@Body() payload: unknown): Device {
    return this.adapterService.ingest(payload);
  }

  @Post('ingest-batch')
  ingestBatch(@Body() payloads: unknown[]): BatchResult {
    return this.adapterService.ingestBatch(payloads);
  }

  @Get('supported-vendors')
  getSupportedVendors(): string[] {
    return this.adapterService.getSupportedVendors();
  }
}
