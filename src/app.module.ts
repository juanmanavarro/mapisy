import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppGateway } from './app.gateway';
import { ApiController } from './api.controller';
import { MapSchema } from './schemas/map.schema';

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
    MongooseModule.forFeature([{ name: Map.name, schema: MapSchema }]),
  ],
  controllers: [AppController, ApiController],
  providers: [
    AppGateway,
  ],
})
export class AppModule {}
