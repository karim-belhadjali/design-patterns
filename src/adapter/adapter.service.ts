import { Injectable, BadRequestException } from '@nestjs/common';
import type { DeviceAdapter } from './interfaces/device-adapter.interface.js';
import type { Device } from '../common/interfaces/device.interface.js';
import { PhilipsHueAdapter } from './adapters/philips-hue.adapter.js';
import { IkeaTradfriAdapter } from './adapters/ikea-tradfri.adapter.js';
import { XiaomiAdapter } from './adapters/xiaomi.adapter.js';

export interface BatchResult {
  adapted: Device[];
  failed: { payload: unknown; reason: string }[];
}

@Injectable()
export class AdapterService {
  private readonly adapters: DeviceAdapter[] = [
    new PhilipsHueAdapter(),
    new IkeaTradfriAdapter(),
    new XiaomiAdapter(),
  ];

  ingest(rawPayload: unknown): Device {
    const adapter = this.adapters.find((a) => a.supports(rawPayload));
    if (!adapter) {
      throw new BadRequestException(
        'No adapter found for this payload format',
      );
    }
    return adapter.adapt(rawPayload);
  }

  ingestBatch(payloads: unknown[]): BatchResult {
    const adapted: Device[] = [];
    const failed: { payload: unknown; reason: string }[] = [];

    for (const payload of payloads) {
      try {
        adapted.push(this.ingest(payload));
      } catch {
        failed.push({ payload, reason: 'No adapter found for this format' });
      }
    }

    return { adapted, failed };
  }

  getSupportedVendors(): string[] {
    return this.adapters.map((a) => a.vendorName);
  }
}
