import { MailerService } from '@nestjs-modules/mailer';
import { Body, Controller, Get, Param, Post, Put, Res } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MapDocument } from 'src/schemas/map.schema';
import { Map } from 'src/schemas/map.schema';
import { Response } from 'express';

@Controller('api/maps')
export class MapController {
  constructor(
    @InjectModel(Map.name) private mapModel: Model<MapDocument>,
    private mailerService: MailerService,
  ) {}

  // @Put(':id')
  async config(@Param('id') id: string, @Body() body: any, @Res() res: Response) {
    if (!body.latitude || !body.longitude || !body.zoom || !body.email || !body.title) {
      return res.status(400).json({ message: 'Latitud, longitud, zoom y email son requeridos' });
    }

    const map = await this.mapModel.findOne({ id });

    map.latitude = body.latitude;
    map.longitude = body.longitude;
    map.zoom = body.zoom;
    map.email = body.email;
    map.title = body.title;
    map.description = body.description;
    await map.save();

    return res.status(200).json({ message: 'Map updated' });
  }
}
