import { Controller, Get } from '@nestjs/common';
import axios from 'axios';

@Controller('map')
export class AppController {
  @Get()
  async getMap() {
    try {
      const response = await axios.get(`https://nocodb.juanma.app/api/v2/tables/${process.env.NOCODB_TABLE_ID}/records`, {
        params: {
          limit: 1000,
          shuffle: 0,
          offset: 0
        },
        headers: {
          'accept': 'application/json',
          'xc-token': process.env.NOCODB_API_KEY
        }
      });
      return response.data;
    } catch (error) {
      console.error(error);
      return 'error';
    }
  }
}
