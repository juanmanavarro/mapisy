import { Controller, Get, Param } from '@nestjs/common';

@Controller('api')
export class ApiController {
  @Get('map/:id')
  async getMap(@Param('id') id: string) {
    return [];
  }
}
