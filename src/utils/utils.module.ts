import { Module } from '@nestjs/common';
import { AddressService } from './services/address/address.service';

@Module({
  providers: [AddressService],
  exports: [AddressService],
})
export class UtilsModule {}
