import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'fatal'],
  });
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(3009);
}
bootstrap();
