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

  // Comando curl para obtener un mapa:
  // curl -X GET http://localhost:3009/api/maps/{id}
  @Get(':id')
  async getMap(@Param('id') id: string, @Res() res: Response) {
    const map = await this.mapModel.findOne({ id }).populate('markers');

    if (!map.new) {
      map.api_key = undefined;
    }

    return res.json(map);
  }

  @Put(':id')
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
    map.description = body.description;
    await map.save();

    if (isNew && body.email) {
      await this.mailerService.sendMail({
        to: body.email,
        subject: 'Instam.app: New map created',
        text: `Hi,

The map with url ${process.env.APP_URL}/${id} has been created. The API key is ${map.api_key}.

You can create markers using the following curl command:

curl -X POST ${process.env.APP_URL}/api/maps/${map.id}/markers \\
  -H "Authorization: Bearer ${map.api_key}" \\
  -H "Content-Type: application/json" \\
  -d "{
    \\"latitude\\": ${map.latitude},
    \\"longitude\\": ${map.longitude}
  }"

More information in ${process.env.APP_URL}

Enjoy!
`,
      });
    }

    return res.status(200).json({ message: 'Map updated' });
  }
}
