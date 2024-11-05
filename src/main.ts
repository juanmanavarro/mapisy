import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'fatal'],
  });

  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setViewEngine('hbs');

  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(3009);
}
bootstrap();
