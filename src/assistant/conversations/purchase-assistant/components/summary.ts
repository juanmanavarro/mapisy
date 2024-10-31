import { toEuros } from "src/chatbot/helpers/text";

export class Summary {
  static create({ product, quantity }) {
    return `Resumen de la compra:

*Producto*: ${product.name}
*Precio unitario*: ${toEuros(product.price)}
*Cantidad*: ${quantity}

*Total*: ${toEuros((parseFloat(product.price) * parseInt(quantity)).toFixed(2))}`;
  }
}
