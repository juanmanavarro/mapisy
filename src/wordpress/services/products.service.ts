import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WooCommerceProduct } from '../schemas/woocommerce-product.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(WooCommerceProduct.name) private productModel: Model<WooCommerceProduct>,
  ) {}

  async createOrUpdate(productData: any): Promise<WooCommerceProduct> {
    const existingProduct = await this.productModel.findOne({ id: productData.id }).exec();
    if (existingProduct) {
      // Update the existing product
      existingProduct.name = productData.name;
      existingProduct.price = productData.price;
      existingProduct.description = productData.description;
      existingProduct.short_description = productData.short_description;
      existingProduct.sku = productData.sku;
      existingProduct.stock_status = productData.stock_status;
      existingProduct.categories = productData.categories;
      existingProduct.image = productData.image;
      return existingProduct.save();
    } else {
      // Create a new product
      const createdProduct = new this.productModel(productData);
      return createdProduct.save();
    }
  }

  async findAll(): Promise<WooCommerceProduct[]> {
    return this.productModel.find().exec();
  }

  async findOneBySlug(slug: string): Promise<WooCommerceProduct> {
    return this.productModel.findOne({ slug }).exec();
  }

  async findById(id): Promise<WooCommerceProduct> {
    return this.productModel.findOne({ id }).exec();
  }
}
