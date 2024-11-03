import { Body, Controller, Get, Param, Post, Res, Headers, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MapDocument } from './schemas/map.schema';
import { Response } from 'express';
import { AppGateway } from './app.gateway';
import { Marker, MarkerDocument } from './schemas/marker.schema';
import { MailerService } from '@nestjs-modules/mailer';

@Controller('api')
export class ApiController {
  constructor(
    @InjectModel(Map.name) private mapModel: Model<MapDocument>,
    @InjectModel(Marker.name) private markerModel: Model<MarkerDocument>,
    private appGateway: AppGateway,
    private mailerService: MailerService,
  ) {}

  @Get('maps/:id')
  async getMap(@Param('id') id: string, @Res() res: Response) {
    const map = await this.mapModel.findOne({ id }).populate('markers');

    if (!map.new) {
      map.api_key = undefined;
    }

    return res.json(map);
  }

  @Post('maps/:id/markers')
  async createMarker(
    @Param('id') id: string,
    @Body() body: any,
    @Headers('authorization') auth: string,
    @Res() res: Response,
  ) {
    const map = await this.mapModel.findOne({ id });
    if (!map) {
      return res.status(404).json({ message: 'Map not found' });
    }

    if (!auth || !auth.startsWith('Bearer ') || auth.split(' ')[1] !== map.api_key) {
      return res.status(401).json({ message: 'Invalid API key'});
    }

    return await this.handleMarkerOperation(map, body, id, res);
  }

  @Get('maps/:id/markers')
  async getMarker(
    @Param('id') id: string,
    @Query() query: any,
    @Res() res: Response,
  ) {
    const map = await this.mapModel.findOne({ id });
    if (!map) {
      return res.status(404).json({ message: 'Map not found' });
    }

    if (query.apiKey !== map.api_key) {
      return res.status(401).json({ message: 'Invalid API key'});
    }

    return await this.handleMarkerOperation(map, query, id, res);
  }

  private async handleMarkerOperation(map: any, data: any, id: string, res: Response) {
    const latitude = parseFloat(data.latitude);
    const longitude = parseFloat(data.longitude);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ message: 'Latitud y longitud deben ser números válidos' });
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ message: 'Coordenadas fuera de rango' });
    }

    await this.markerModel.create({ map_id: id, latitude, longitude });

    this.appGateway.send('marker:created', {
      map_id: id,
      latitude,
      longitude,
    });

    return res.status(201).json({ message: 'Marker created' });
  }

  @Post('maps/:id/config')
  async config(@Param('id') id: string, @Body() body: any, @Res() res: Response) {
    if (!body.latitude || !body.longitude || !body.zoom || !body.email || !body.title) {
      return res.status(400).json({ message: 'Latitud, longitud, zoom y email son requeridos' });
    }

    const map = await this.mapModel.findOne({ id });
    const isNew = !map.email;

    map.latitude = body.latitude;
    map.longitude = body.longitude;
    map.zoom = body.zoom;
    map.email = body.email;
    map.title = body.title;
    await map.save();

    if (isNew && body.email) {
      await this.mailerService.sendMail({
        to: body.email,
        subject: 'Instam.app: New map created',
        text: `The map with url https://instam.app/${id} has been created. The API key is ${map.api_key}. Enjoy!`,
      });
    }

    return res.status(200).json({ message: 'Map updated' });
  }
}
