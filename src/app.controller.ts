import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import * as path from 'path';
import { Response } from 'express';

@Controller()
export class AppController {
  @Get()
  async getIndex(@Res() res: Response) {
    return res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  }

  @Get(':id')
  async getMap(@Param('id') id: string, @Res() res: Response, @Query() query: any) {
    if (query.latitude && query.longitude) {
      return this.createMarker(query.latitude, query.longitude, res);
    }

    return res.sendFile(path.join(__dirname, '..', 'public', 'map.html'));
  }

  private createMarker(latitude: string, longitude: string, @Res() res: Response) {
    // TODO: Create marker
    return res.status(201).json({ message: 'Marker created' });
  }
}
