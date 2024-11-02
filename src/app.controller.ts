import { Controller, Get, Param, Res } from '@nestjs/common';
import * as path from 'path';
import { Response } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MapDocument } from './schemas/map.schema';
import { MailerService } from '@nestjs-modules/mailer';

@Controller()
export class AppController {
  constructor(
    @InjectModel(Map.name) private mapModel: Model<MapDocument>,
    private mailerService: MailerService,
  ) {}

  @Get()
  async getIndex(@Res() res: Response) {
    return res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  }

  @Get(':id')
  async getMap(@Param('id') id: string, @Res() res: Response) {
    let map = await this.mapModel.findOne({ id });
    if (!map) {
      map = await this.mapModel.create({ id });
      map.new = true;
      await map.save();
    }
    else {
      if (map.new) {
        map.new = false;
        await map.save();

        this.mailerService.sendMail({
          to: map.email,
          subject: 'Instam.app: New map created',
          text: `The map with url https://instam.app/${id} has been created. Enjoy!`,
        });
      }
    }

    return res.sendFile(path.join(__dirname, '..', 'public', 'map.html'));
  }

  // @Get(':id/config')
  // async configMap(@Param('id') id: string, @Res() res: Response) {
  //   let map = await this.mapModel.findOne({ id });
  //   if (!map) {
  //     return res.status(404).sendFile(path.join(__dirname, '..', 'public', '404.html'));
  //   }

  //   return res.sendFile(path.join(__dirname, '..', 'public', 'config.html'));
  // }
}
