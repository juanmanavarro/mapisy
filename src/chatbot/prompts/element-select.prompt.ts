import { Injectable } from "@nestjs/common";

@Injectable()
export class ElementSelectPrompt {
  static prompt(message, list) {
    return `
${list}

Debes de escoger entre el elemento de la lista siguiente al que me refiero con la frase "${message}":

En cuanto lo tengas debes de responder con un JSON con el siguiente schema:

{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "object",
  "properties": {
    "element_id": {
      "type": ["string", "null"],
      "description": "el id del elemento de la lista, null si no se puede deducir el elemento del mensaje"
    }
  },
  "required": [
    "element_id"
  ]
}

si no lo puedes deducir, debes de responder element_id = null, no te inventes nada.
`;
  }
}
