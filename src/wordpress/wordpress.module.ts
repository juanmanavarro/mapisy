import { Module } from '@nestjs/common';
import { ProductsService } from './services/products.service';
import { MongooseModule } from '@nestjs/mongoose';
import { WooCommerceProduct, WooCommerceProductSchema } from './schemas/woocommerce-product.schema';
import { ProductsController } from './controllers/products.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: WooCommerceProduct.name,
      schema: WooCommerceProductSchema,
      collection: 'woocommerce_products',
    }]),
  ],
  providers: [ProductsService],
  exports: [ProductsService],
  controllers: [ProductsController],
})
export class WordpressModule {}
