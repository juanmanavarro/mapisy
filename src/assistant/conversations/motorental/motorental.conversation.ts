import { Injectable } from "@nestjs/common";
import { Button } from "src/chatbot/components/button";
import { DateHelper } from "src/chatbot/helpers/date";
import { Send } from "src/chatbot/helpers/send";
import { ucFirst } from "src/chatbot/helpers/text";
import { SelectProductConversation } from "src/chatbot/conversations/select-product.conversation";
import { Context } from "src/chatbot/conversations/context";
import { NewConversation } from "src/chatbot/conversations/conversation";
import { motorentalVehicles } from "./vehicles";
import { IaService } from 'src/ia/ia.service';
import { NewConfirmButtons } from "src/chatbot/components/new-confirm-buttons";
import { SelectTimeConversation } from "src/chatbot/conversations/select-time.conversation";
import { SelectDateConversation } from "src/chatbot/conversations/select-date.conversation";
import { ConfirmMessage } from "./components/confim-message";

@Injectable()
export class MotorentalConversation extends NewConversation {
  constructor(
    protected readonly selectProductConversation: SelectProductConversation,
    protected readonly selectTimeConversation: SelectTimeConversation,
    protected readonly selectDateConversation: SelectDateConversation,
    protected readonly iaService: IaService,
  ) {
    super();
  }

  steps() {
    return {
      0: {
        message: ({ user }) => {
          return {
            text: `¡${ucFirst(DateHelper.greeting())} ${user.name}! Bienvenido al servicio de alquiler. ¿Qué vehículo quieres alquilar?`,
            options: {
              buttons: [
                Button.create('Bici', 'bicycle'),
                Button.create('Moto', 'motorcycle'),
              ]
            }
          };
        },
        action: ({ message, user }) => {
          if ( !this.validateInteraction({ message, user }) ) return false;

          Context.set(user, 'booking.type', message.interaction);

          if (message.interaction === 'bicycle') return 'PickUpVehicleDateConversation.0';
          if (message.interaction === 'motorcycle') return 200;
        }
      },
      100: {
        message: () => {
          return `Elije bici`;
        },
        action: () => {
          return 500;
        }
      },
      200: {
        message: () => {
          return {
            text: 'Por favor, selecciona tu tipo de permiso de conducir.',
            options: {
              buttons: [
                Button.create('AM', 'AM'),
                Button.create('A', 'A'),
                Button.create('A1', 'A1'),
                Button.create('A2', 'A2'),
                Button.create('B', 'B'),
                Button.create('B1', 'B1'),
                Button.create('B96', 'B96'),
              ]
            },
          };
        },
        action: ({ message, user }) => {
          if (!this.validateInteraction({ message, user })) return false;

          Context.set(user, 'customer.license', message.interaction);

          return 'PickUpVehicleDateConversation.0';
        }
      },
      ...this.selectDateConversation.steps({
        id: 'PickUpVehicleDateConversation',
        message: `¿Para qué día querrías hacer la reserva?`,
        nextStep: async ({ user, date }) => {
          const formattedDate = DateHelper.format(date, 'dddd D [de] MMMM');

          const type = Context.get(user, 'booking.type');
          if ( type === 'motorcycle' ) {
            await Send.to(user, `Bien. Déjame ver que motos hay disponibles para el ${formattedDate}...`);
            return 'SelectMotorcycleConversation.0';
          }

          await Send.to(user, `Bien. Déjame ver que bicis hay disponibles para el ${formattedDate}...`);
          return 'SelectBicycleConversation.0';
        },
        prompt: `Eres el asistente de reservas de la Agencia de alquiler Demo. La agencia esta abierta todos los días`,
      }, (user, date) => {
        Context.set(user, 'booking.start_date', date);
      }),
      ...this.selectProductConversation.steps({
        products: motorentalVehicles.filter(v => v.category === 'motorcycle'),
        message: '¿Qué moto quieres reservar?',
        id: 'SelectMotorcycleConversation',
        nextStep: 'PickUpVehicleTimeConversation.0',
      }, (user, productId) => Context.set(user, 'booking.vehicle', productId)),
      ...this.selectProductConversation.steps({
        products: motorentalVehicles.filter(v => v.category === 'bicycle'),
        message: '¿Qué bici quieres reservar?',
        id: 'SelectBicycleConversation',
        nextStep: 'PickUpVehicleTimeConversation.0',
      }, (user, productId) => Context.set(user, 'booking.vehicle', productId)),
      ...this.selectTimeConversation.steps({
        id: 'PickUpVehicleTimeConversation',
        message: 'Genial. ¿A qué hora te gustaría recoger el vehículo? Nuestro horario es de 9:00 a 21:00.',
        nextStep: 'ReturnVehicleDateConversation.0',
        prompt: 'La hora debe de estar entre las 9 de la mañana y las 21 de la tarde, ambas inclusive. Si la hora esta fuera del horario lo comentaras y pediras la nueva hora. Esto es muy IMPORTANTE y tienes que respetar el horario, es decir, no puedes aceptar fechas si el establecimiento esta cerrado, es MUY IMPORTANTE',
      }, (user, time) => Context.set(user, 'booking.start_time', time)),
      ...this.selectDateConversation.steps({
        id: 'ReturnVehicleDateConversation',
        message: 'Perfecto. ¿Y cuál sería la fecha de fin de tu alquiler?',
        nextStep: 'ReturnVehicleTimeConversation.0',
        prompt: `Eres el asistente de reservas de la Agencia de alquiler Demo. La agencia esta abierta todos los días`,
      }, (user, date) => {
        Context.set(user, 'booking.return_date', date);
      }),
      ...this.selectTimeConversation.steps({
        id: 'ReturnVehicleTimeConversation',
        message: 'Genial. ¿A qué hora te gustaría devolver el vehículo? Recuerda que nuestro horario es de 9:00 a 21:00.',
        nextStep: 800,
        prompt: 'La hora debe de estar entre las 9 de la mañana y las 21 de la tarde, ambas inclusive. Si la hora esta fuera del horario lo comentaras y pediras la nueva hora. Esto es muy IMPORTANTE y tienes que respetar el horario, es decir, no puedes aceptar fechas si el establecimiento esta cerrado, es MUY IMPORTANTE',
      }, (user, time) => Context.set(user, 'booking.return_time', time)),
      800: {
        message: () => {
          return '¡Excelente! Ahora necesito algunos datos personales. ¿Cuál es tu nombre completo?';
        },
        action: ({ message, user }) => {
          if ( !this.validateText({ message, user }) ) return false;

          Context.set(user, 'customer.name', message.text);

          return 900;
        }
      },
      900: {
        message: () => {
          return 'Gracias. ¿Podrías proporcionarme tu correo electrónico?';
        },
        action: ({ message, user }) => {
          if ( !this.validateText({ message, user }) ) return false;

          Context.set(user, 'customer.email', message.text);

          return 1000;
        }
      },
      1000: {
        message: () => {
          return '¿Cuál es tu NIF/NIE/Pasaporte?';
        },
        action: ({ message, user }) => {
          if ( !this.validateText({ message, user }) ) return false;

          Context.set(user, 'customer.document', message.text);

          return 1100;
        }
      },
      1100: {
        message: () => {
          return 'Necesito también tu dirección completa, incluyendo calle, número, piso, y puerta.';
        },
        action: ({ message, user }) => {
          if ( !this.validateText({ message, user }) ) return false;

          Context.set(user, 'customer.address', message.text);

          return 1200;
        }
      },
      1200: {
        message: () => {
          return '¿Cuál es tu código postal?';
        },
        action: ({ message, user }) => {
          if ( !this.validateText({ message, user }) ) return false;

          Context.set(user, 'customer.zipcode', message.text);

          return 1300;
        }
      },
      1300: {
        message: () => {
          return '¿Y tu país?';
        },
        action: ({ message, user }) => {
          if ( !this.validateText({ message, user }) ) return false;

          Context.set(user, 'customer.country', message.text);

          return 1600;
        }
      },
      1600: {
        message: () => {
          return '¿Tienes alguna observación o requerimiento especial que quieras añadir?';
        },
        action: ({ message, user }) => {
          if ( !this.validateText({ message, user }) ) return false;

          Context.set(user, 'booking.comments', message.text);

          return 1700;
        }
      },
      1700: {
        message: ({ user }) => {
          // const context = {
          //   "booking": {
          //     "type": "motorcycle",
          //     "start_date": "2024-07-20",
          //     "vehicle": 7,
          //     "start_time": "21:00:00",
          //     "return_date": "2024-07-20",
          //     "return_time": "21:00:00",
          //     "comments": "asdfsadf"
          //   },
          //   "customer": {
          //     "license": "B",
          //     "name": "asdf",
          //     "email": "asfdfasf",
          //     "document": "asdfasdf",
          //     "address": "asdfasdf",
          //     "zipcode": "asdffds",
          //     "country": "safdf"
          //   }
          // };
          const context = Context.get(user);
          const vehicle = motorentalVehicles.find(v => v.id === context.booking.vehicle);

          const data = {
            booking: context.booking,
            customer: context.customer,
            user,
            vehicle,
          };

          setTimeout(() => {
            Send.card(user, vehicle.image, ConfirmMessage.create(data), null, {
              buttons: NewConfirmButtons.create(['Confirmar', 'Cancelar']),
            });
          }, 1000);

          return 'Vamos a confirmar la reserva...';
        },
        action: async ({ message, user }) => {
          if ( !this.validateInteraction({ message, user }) ) return false;

          if ( !message.interaction ) {
            // await Send.to(user, 'Lo siento. Empecemos de nuevo.');
            return 0;
          }

          // save

          return 1800;
        }
      },
      1800: {
        message: () => {
          return '¡Perfecto! Tu reserva está completa. Te esperamos. ¡Gracias!';
        },
      },
    }
  }
}
