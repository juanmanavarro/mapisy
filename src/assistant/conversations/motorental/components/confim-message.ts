import { ucFirst } from "src/chatbot/helpers/text";
import { motorentalVehicles } from "../vehicles";

export class ConfirmMessage {
  static translateKeys = {
    "type": "tipo",
    "start_date": "fecha de inicio",
    "vehicle": "vehículo",
    "start_time": "hora de inicio",
    "return_date": "fecha de regreso",
    "return_time": "hora de regreso",
    "comments": "comentarios",
    "license": "licencia",
    "name": "nombre",
    "email": "correo electrónico",
    "document": "documento",
    "address": "dirección",
    "zipcode": "código postal",
    "country": "país"
  };

  static create(data) {
    const { booking, customer } = data;

    let bookingText = 'Tu reserva:\n\n';
    for (const key in booking) {
      if (key === 'vehicle') {
        bookingText += `*${ucFirst(this.translateKeys[key])}*: ${data.vehicle.name}\n`;
        bookingText += `*Precio*: ${data.vehicle.price} €/día\n`;
        // bookingText += `Imagen: ${vehicle.image}\n`;
      } else {
        bookingText += `*${ucFirst(this.translateKeys[key])}*: ${booking[key]}\n`;
      }
    }

    let customerText = '\nTus datos:\n\n';
    for (const key in customer) {
      customerText += `*${ucFirst(this.translateKeys[key])}*: ${customer[key]}\n`;
    }

    return bookingText + customerText;
  }
}
