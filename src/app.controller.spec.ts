import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('getStatus', () => {
    it('should return project info with smart home domain', () => {
      const result = appController.getStatus();
      expect(result.name).toBe('design-patterns');
      expect(result.version).toBe('0.0.1');
      expect(result.domain).toContain('Smart Home');
    });
  });
});
