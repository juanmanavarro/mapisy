import { Body, Controller, Get, Param, Post, Render, Res, NotFoundException, Req } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MapDocument } from './schemas/map.schema';
import { Marker, MarkerDocument } from './schemas/marker.schema';
import { Response } from 'express';
import { MailerService } from '@nestjs-modules/mailer';

@Controller()
export class AppController {
  constructor(
    @InjectModel(Map.name) private mapModel: Model<MapDocument>,
    @InjectModel(Marker.name) private markerModel: Model<MarkerDocument>,
    private mailerService: MailerService,
  ) {}

  @Get()
  @Render('index')
  async getIndex() {
    const demoMap = {
      id: "demo",
      latitude: 0,
      longitude: -0.175781,
      zoom: 1,
      description: "Mapisy demo map",
      email: "hello@mapisy.com",
      title: 'Demo'
    };

    let map = await this.mapModel.findOne({ id: demoMap.id });
    if (!map) {
      map = await this.mapModel.create(demoMap);
    }

    await this.markerModel.deleteMany({ map_id: map.id });

    const latitude = (Math.random() * 180 - 90) + 10;
    const longitude = (Math.random() * 360 - 180) + 10;

    let mapId;
    do {
      mapId = `${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
    } while (await this.mapModel.countDocuments({ id: mapId }) > 0);

    return {
      title: process.env.APP_TITLE,
      baseUrl: process.env.APP_URL,
      mapId,
      map,
      curlCommand: `curl -X POST ${process.env.APP_URL}/api/maps/demo/markers \\
    -H "Authorization: Bearer ${map.api_key}" \\
    -H "Content-Type: application/json" \\
    -d "{
      \\"latitude\\": ${latitude},
      \\"longitude\\": ${longitude},
      \\"title\\": \\"Demo marker\\"
    }"`,
    };
  }

  @Get(':id')
  async getMap(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    if (!req.headers['user-agent'] || !req.headers['user-agent'].includes('Mozilla')) {
      return res.status(400).json({ message: 'Error 400: La petición debe hacerse desde un navegador' });
    }

    // Validar que el ID solo contenga letras, números, guiones medios y guiones bajos
    const validIdPattern = /^[a-zA-Z0-9_-]+$/;
    if (!validIdPattern.test(id)) {
      return res.status(400).render('404', {
        errorCode: '400',
        message: 'Map ID can only contain letters, numbers, hyphens (-) and underscores (_)'
      });
    }

    let map = await this.mapModel.findOne({ id });
    if (!map) {
      map = await this.mapModel.create({ id, reqHeaders: req.headers });
    }

    map.reqHeaders = undefined;
    map.api_key = undefined;

    await map.populate('markers');

    return res.render('map', {
      title: process.env.APP_TITLE,
      baseUrl: process.env.APP_URL,
      map,
      mapObject: JSON.stringify(map.toObject()),
    });
  }

  @Post(':id')
  async configMap(@Param('id') id: string, @Body() body: any, @Res() res: Response) {
    // Validar que el ID solo contenga letras, números, guiones medios y guiones bajos
    const validIdPattern = /^[a-zA-Z0-9_-]+$/;
    if (!validIdPattern.test(id)) {
      return res.redirect(`/?message=Map ID can only contain letters, numbers, hyphens (-) and underscores (_)`);
    }

    if (!body.latitude || !body.longitude || !body.zoom || !body.email || !body.title) {
      return res.redirect(`/${id}?message=Email, Title, Latitude, Longitude and Zoom are required`);
    }

    const mapsWithSameEmail = await this.mapModel.countDocuments({ email: body.email });
    if (mapsWithSameEmail >= Number(process.env.MAX_MAPS || 3)) {
      return res.redirect(`/${id}?message=You have reached the maximum number of maps`);
    }

    const map = await this.mapModel.findOne({ id });
    if (!map) {
      throw new NotFoundException('Map not found');
    }

    if (map.email) {
      return res.status(400).json({ message: 'Map already configured' });
    }

    await this.mapModel.updateOne({ id }, body);

    await this.mailerService.sendMail({
      to: body.email,
      subject: `${process.env.APP_TITLE} - New map created`,
      text: `Hi,

The map with url ${process.env.APP_URL}/${id} has been created. The API key is ${map.api_key}.

You can create markers using the following curl command:

curl -X POST ${process.env.APP_URL}/api/maps/${map.id}/markers \\
-H "Authorization: Bearer ${map.api_key}" \\
-H "Content-Type: application/json" \\
-d "{
  \\"latitude\\": ${body.latitude},
  \\"longitude\\": ${body.longitude},
  \\"title\\": \\"First marker\\"
}"

More information in ${process.env.APP_URL}

Enjoy!
`,
    });

    return res.redirect(`/${id}`);
  }
}
