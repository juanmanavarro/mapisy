import { Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
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
      this.createMarker(id, query.latitude, query.longitude);
      return res.status(201).json({ message: 'Marker created' });
    }

    return res.sendFile(path.join(__dirname, '..', 'public', 'map.html'));
  }

  @Post(':id')
  async postMarker(@Param('id') id: string, @Query() query: any) {
    this.createMarker(id, query.latitude, query.longitude);
    return { message: 'Marker created' };
  }

  private createMarker(id: string, latitude: string, longitude: string) {
    // TODO: Create marker
  }
}
