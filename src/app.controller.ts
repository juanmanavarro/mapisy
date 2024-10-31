import { Controller, Get, Param, Res } from '@nestjs/common';
import * as path from 'path';
import { Response } from 'express';

@Controller()
export class AppController {
  @Get()
  async getIndex(@Res() res: Response) {
    return res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  }

  @Get(':id')
  async getMap(@Param('id') id: string, @Res() res: Response) {
    return res.sendFile(path.join(__dirname, '..', 'public', 'map.html'));
  }
}
