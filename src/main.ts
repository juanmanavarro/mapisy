import { randomUUID } from 'crypto';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as hbs from 'hbs';

// Polyfill/ensure global crypto and randomUUID if not available
// This is to mitigate "ReferenceError: crypto is not defined"
// which can occur in some environments with @nestjs/schedule.
if (typeof (global as any).crypto === 'undefined') {
  (global as any).crypto = {
    randomUUID: randomUUID
  };
} else if (typeof (global as any).crypto.randomUUID === 'undefined') {
  (global as any).crypto.randomUUID = randomUUID;
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'fatal'],
  });

  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.useStaticAssets(join(__dirname, '..', 'public'));

  hbs.registerHelper({
    undefined: (v) => typeof v === 'undefined',
    defined: (v) => typeof v !== 'undefined',
    eq: (v1, v2) => v1 === v2,
    ne: (v1, v2) => v1 !== v2,
    lt: (v1, v2) => v1 < v2,
    gt: (v1, v2) => v1 > v2,
    lte: (v1, v2) => v1 <= v2,
    gte: (v1, v2) => v1 >= v2,
    and() {
        return Array.prototype.every.call(arguments, Boolean);
    },
    or() {
        return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
    }
});

  app.setViewEngine('hbs');

  // app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(3009);
}
bootstrap();
