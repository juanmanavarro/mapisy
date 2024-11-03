import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppGateway } from './app.gateway';
import { ApiController } from './api.controller';
import { MapSchema } from './schemas/map.schema';
import { Marker, MarkerSchema } from './schemas/marker.schema';
import { MailerModule } from '@nestjs-modules/mailer';
import { MapController } from './api/map.controller';

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
    MongooseModule.forFeature([
      { name: Map.name, schema: MapSchema },
      { name: Marker.name, schema: MarkerSchema },
    ]),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.panel247.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
      defaults: {
        from: `"Instam.app" <${process.env.EMAIL_USER}>`,
      },
    }),
  ],
  controllers: [AppController, ApiController, MapController],
  providers: [
    AppGateway,
  ],
})
export class AppModule {}
