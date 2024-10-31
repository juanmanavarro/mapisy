import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppGateway } from './app.gateway';
import { ApiController } from './api.controller';
import { MapSchema } from './schemas/map.schema';
import { Marker, MarkerSchema } from './schemas/marker.schema';

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
  ],
  controllers: [AppController, ApiController],
  providers: [
    AppGateway,
  ],
})
export class AppModule {}
