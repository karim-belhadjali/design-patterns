import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus(): { name: string; version: string; domain: string } {
    return {
      name: 'design-patterns',
      version: '0.0.1',
      domain: 'Smart Home Automation Platform — 23 GoF Design Patterns in NestJS',
    };
  }
}
