import { Controller, Get, Post,Query,Response } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from 'src/assistant/conversations/gota-gota/schemas/order.schema';
import { Send } from 'src/chatbot/helpers/send';
import { ProductsService } from 'src/wordpress/services/products.service';
import { BigNumber } from 'bignumber.js';
const stripe = require('stripe')('sk_test_51LeZNpDFqD8enanXGKfGjuqyqhKXz1ZQnNKMXmHLhd1BB3NLUVLEPANuBxVcsaBW2izA0GAq5KBkfQoouZ3OYW0U00jD5B727y')

@Controller('stripe')
export class CheckoutController {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private readonly productsService: ProductsService,
  ) {}

  @Get('/checkout')
  async createSession(@Query() query, @Response() res) {
    const order = await this.orderModel.findById(query.order_id);

    const line_items = await Promise.all(order.products.map(async p => {
      const product = await this.productsService.findById(p.id);
      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: product.name,
          },
          unit_amount: new BigNumber(product.price).multipliedBy(100).toNumber(),
        },
        quantity: p.quantity,
      };
    }));

    const session = await stripe.checkout.sessions.create({
      line_items,
      metadata: {
        orderId: order.id,
        whatsappUrl: `https://wa.me/${process.env.WHATSAPP_PHONE}`,
      },
      mode: 'payment',
      success_url: `${process.env.PAYMENT_URL}/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
      // cancel_url: 'http://localhost:4242/cancel',
    });

    res.redirect(303, session.url);
  }

  @Get('/success')
  async success(@Query() query, @Response() res) {
    const session = await stripe.checkout.sessions.retrieve(query.session_id);
    const orderId = session.metadata.orderId;
    const order = await this.orderModel.findById(orderId).populate('user');
    if ( !order.completed ) {
      order.completed = true;
      await order.save();
      Send.to(order.user, 'Pago realizado. El pedido esta en preparación. ¡Gracias!');
    }

    res.redirect(303, session.metadata.whatsappUrl);
  }
}
