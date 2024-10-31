import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AssistantModule } from './assistant/assistant.module';
import { IaModule } from './ia/ia.module';
import { StripeModule } from './stripe/stripe.module';
import { UtilsModule } from './utils/utils.module';
import { WordpressModule } from './wordpress/wordpress.module';
import { AppController } from './app.controller';
import { AppGateway } from './app.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGO_URI,
      }),
    }),
    AssistantModule,
    StripeModule,
    IaModule,
    WordpressModule,
    UtilsModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/whatsapp/*'],
      serveRoot: '/',
    }),
  ],
  controllers: [AppController],
  providers: [
    AppGateway,
  ],
  exports: [
    AppGateway,
  ],
})
export class AppModule {}
