import { Module } from '@nestjs/common';
import { IaService } from './ia.service';
import { OpenaiProvider } from './providers/openai.provider';

@Module({
  providers: [
    IaService,
    OpenaiProvider,
  ],
  exports: [IaService, OpenaiProvider],
})
export class IaModule {}
