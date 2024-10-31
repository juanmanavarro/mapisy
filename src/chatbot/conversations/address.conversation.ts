import { AddressService } from "src/utils/services/address/address.service";
import { ConfirmButtons } from "../components/confirm-buttons";
import { Item } from "../components/item";
import { NewConfirmButtons } from "../components/new-confirm-buttons";
import { Send } from "../helpers/send";
import { Context } from "./context";
import { Validator } from "../helpers/validator";
import { Button } from "../components/button";

export class AddressConversation {
  static create(nextStep, id = 'AddressConversation', cb) {
    return {
      [`${id}.0`]: {
        action: async ({ message, user }) => {
          const { addresses } = await user.populate('addresses');

          const zipcodeAddresses = addresses.filter(
            a => a.zipcode === Context.get(user, 'order.address.zipcode') || '46160'
          );

          if ( !zipcodeAddresses.length ) {
            return `${id}.50`;
          }

          // TODO context Context.reset(user, key);
          if ( Context.get(user, 'userAddresses') ) Context.delete(user,'userAddresses');
          Context.set(user, 'userAddresses', zipcodeAddresses);

          return `${id}.25`;
        },
      },
      [`${id}.25`]: {
        message: ({ message, user }) => {
          const addresses = Context.get(user, 'userAddresses');

          const items = addresses.map(a => {
            return Item.create(a._id.toString(), `${a.city} (${a.zipcode})`, `${a.street}, ${a.number}`);
          });

          return {
            text: `Tienes ${addresses.length} direcciones guardadas. ¿Dónde quieres que te dejemos el pedido?`,
            options: {
              list: [
                ...items,
                Item.create('new', 'En una dirección nueva'),
              ],
            }
          };
        },
        action: ({ message, user }) => {
          console.log(message, user);

          if ( !Validator.isInteraction(message) ) {
            Send.to(user, 'Por favor, escoge una opción.');
            return false;
          }

          if ( message.interaction === 'new' ) {
            return `${id}.50`;
          }

          const addresses = Context.get(user, 'userAddresses');
          const address = addresses.find(a => a.id === message.interaction);
          Context.set(user, 'order.address', address);

          return nextStep;
        }
      },
      [`${id}.50`]: {
        message: () => {
          return '¿A qué calle quieres que te llevemos el pedido?';
        },
        action: async ({ message, user }) => {
          if ( !message.text ) {
            Send.to(user, 'Por favor, escribe tu calle.');
            return false;
          }

          const zipcode = Context.get(user, 'order.address.zipcode');
          const result = await AddressService.validate(message.text + ` ${zipcode || '46160'} España`);



          if ( !result.isValid ) {
            await Send.to(user, 'Lo siento, no puedo encontrar la calle');
            return `${id}.50`;
          }

          Context.set(user, 'addresses', result);

          return `${id}.100`;
        },
      },
      [`${id}.100`]: {
        message: ({ message, user }) => {
          const address = Context.get(user, 'addresses');

          return {
            text: `${address.formattedAddress}, ¿es correcta?`,
            options: {
              buttons: NewConfirmButtons.create(),
            }
          };
        },
        action: async ({ message, user }) => {
          if ( !message.hasOwnProperty('interaction') ) {
            Send.to(user, 'Escoge una opción.');
            return false;
          }

          const address = Context.get(user, 'addresses');

          if ( !message.interaction ) {
            await Send.to(user, 'Lo siento, no entendí bien.');
            return address.alternatives?.length ? `${id}.200` : `${id}.50`;
          }

          Context.set(user, 'order.address', AddressService.mapAddress(address.addressDetails));

          return [`${id}.400`];
        }
      },
      [`${id}.200`]: {
        message: ({ message, user }) => {
          const context = Context.get(user);

          return {
            text: '¿Es alguna de estas?',
            options: {
              list: [
                ...context.addresses.alternatives
                .map(
                  a => {
                    return Item.create(a.place_id, `${a.addressDetails.town || a.addressDetails.village} (${a.addressDetails.postcode})`, a.addressDetails.road);
                  }
                ),
                Item.create(false, 'No es ninguna')
              ],
            }
          };
        },
        action: async ({ message, user }) => {
          if ( !message.hasOwnProperty('interaction') ) {
            Send.to(user, 'Escoge una opción.');
            return false;
          }

          if ( !message.interaction ) {
            await Send.to(user, 'Lo siento, no entendí bien.');
            return `${id}.50`;
          }

          const addresses = Context.get(user, 'addresses.alternatives');
          const address = addresses.find(a => a.place_id === Number(message.interaction));

          Context.set(user, 'order.address', AddressService.mapAddress(address.addressDetails));

          return `${id}.300`;
        }
      },
      [`${id}.300`]: {
        message: ({ user }) => {
          const street = Context.get(user, 'order.address.formattedAddress');
          return {
            text: `La entrega será en la calle ${street}, ¿es correcto?`,
            options: {
              buttons: ConfirmButtons.create(),
            }
          };
        },
        action: ({ message, user }) => {
          if ( !message.hasOwnProperty('interaction') ) {
            Send.to(user, 'Por favor, escoge una opción.');
            return false;
          }

          if ( !message.interaction?.confirm ) {
            return `${id}.0`;
          }

          return [`${id}.400`];
        },
      },
      [`${id}.400`]: {
        message: ({ message, user }) => {
          return `Bien, ¿en qué número?`;
        },
        action: ({ message, user }) => {
          if ( !Validator.isNumber(message.text) ) {
            Send.to(user, 'Por favor, escribe el número de tu casa.');
            return false;
          }

          Context.set(user, 'order.address.number', message.text);

          return [`${id}.500`];
        }
      },
      [`${id}.500`]: {
        message: ({ message, user }) => {
          return {
            text: `¿Algún dato mas que quieras añadir a la dirección? Piso, puerta...`,
            options: {
              buttons: [
                Button.create('No, nada mas', false)
              ]
            }
          };
        },
        action: ({ message, user }) => {
          Context.set(user, 'order.address.extra', message.text || '');

          return [`${id}.600`];
        }
      },
      [`${id}.600`]: {
        message: ({ message, user }) => {
          const address = Context.get(user, 'order.address');

          return {
            text: [
              `${address.road || address.street}, ${address.number} ${address.extra}`,
              `${address.postcode || address.zipcode} ${address.village || address.town || address.city}`,
              '',
              '¿Es correcta la direccón?'
            ].join('\n'),
            options: {
              buttons: NewConfirmButtons.create(),
            }
          };
        },
        action: ({ message, user }) => {
          if ( !Validator.isInteraction(message) ) {
            Send.to(user, 'Por favor, escoge una opción.');
            return false;
          }

          if ( !message.interaction ) return [`${id}.0`];

          cb(user);

          return nextStep;
        }
      },
    }
  }
}
