import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppGateway } from './app.gateway';
import { Map, MapSchema } from './schemas/map.schema'; // Corrected import for Map
import { Marker, MarkerSchema } from './schemas/marker.schema';
import { MailerModule } from '@nestjs-modules/mailer';
import { MapController } from './api/map.controller';
import { MarkerController } from './api/marker.controller';
import { ThrottlerModule } from '@nestjs/throttler';
import { MapService } from './api/map.service'; // Import MapService

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
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
        from: `"${process.env.APP_TITLE}" <${process.env.EMAIL_USER}>`,
      },
    }),
  ],
  controllers: [AppController, MapController, MarkerController],
  providers: [
    AppGateway,
    MapService, // Add MapService here
  ],
})
export class AppModule {}
