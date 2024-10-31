import { Controller, Get, Post, Body } from '@nestjs/common';
import { WooCommerceProduct } from '../schemas/woocommerce-product.schema';
import { ProductsService } from '../services/products.service';

@Controller('api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async createOrUpdate(@Body() createProductDto: any[]): Promise<WooCommerceProduct[]> {
    const createdOrUpdatedProducts = [];
    for (const productData of createProductDto) {
      const createdOrUpdatedProduct = await this.productsService.createOrUpdate(productData);
      createdOrUpdatedProducts.push(createdOrUpdatedProduct);
    }
    return createdOrUpdatedProducts;
  }

  @Get()
  async findAll(): Promise<WooCommerceProduct[]> {
    return this.productsService.findAll();
  }
}
