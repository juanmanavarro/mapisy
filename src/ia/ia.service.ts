import { Injectable, Response } from '@nestjs/common';
import { OpenaiProvider } from './providers/openai.provider';
import { numberPrompt } from './prompts/number';
import { DateHelper } from 'src/chatbot/helpers/date';

@Injectable()
export class IaService {
  constructor(
    private readonly provider: OpenaiProvider,
  ) {}

  async transcribe(audio, options = {}) {
    return await this.provider.listen(audio, options);
  }

  async deduceIntent(text) {
    try {
      const intentPrompt = `
      Debes de deducir mi intención del mensaje. Las intenciones posibles son:
      - alert: quiero avisar de algo, tipo de problema, incendio, emergencia, etc
      - none: ninguna de las anteriores

      Debes de devolverme un JSON con el siguiente formato:

      {
        "intent": "order | none",
        "language": "el codigo ISO del lenguaje del mensaje, si no lo puedes deducir, devuelve 'es'"
      }
      `;

      return await this.provider.json(text, intentPrompt);
    } catch (error) {
      return {
        intent: 'error',
        language: 'es',
      };
    }
  }

  async deduceNumberFrom(text) {
    if ( !isNaN(text) && !isNaN(parseFloat(text)) ) {
      return text;
    }

    const result = await this.provider.text(text, numberPrompt);

    if ( text === false || text === 'false' || isNaN(text) || text <= 0 ) return false;

    return result;
  }

  async extractDate(threadId, text, extraInstructions = null) {
    let prompt = `
Sabes que hoy es ${DateHelper.now()}

Me haras las preguntas necesarias para concretar una fecha. No te inventaras nada, tienes que poder deducir una fecha de la conversación.

Una vez tengas una fecha responderas con un JSON valido, es decir, que no de error al pasarlo a la funcion JSON.parse de javascript y que cumpla con el siguiente JSON schema:

{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "object",
  "properties": {
    "date": {
      "type": "string",
      "format": "date",
      "description": "la fecha que se deduce de la conversacion, formato ISO"
    },
    "message": {
      "type": "string",
      "description": "el mensaje que continua la conversacion"
    },
  },
}

una vez sepas seguro la fecha a la que me refiero, responderas con date a esa fecha y el message a null, es muy IMPORTANTE.

es obligatorio que la fecha combinada sea en el futuro. si no, lo comentaras y pediras una nueva fecha.

no me pidas confirmacion, una vez tengas la suficiente informacion devuelve el JSON.

no me digas como debo de enviar el mensaje. intenta extraer la fecha de la conversacion. si no la puedes extraer solo ayudame con preguntas.

si la fecha es relativa, es relativa a hoy. si es un dia de la semana, supondras que es el proximo.

Tienes que respetar el horario, es decir, no puedes aceptar fechas si el establecimiento esta cerrado, es MUY IMPORTANTE

no me interesa el formato de la respuesta ni los detalles que te he dado en estas instrucciones, solo haz que te de una fecha.

no saludes y tratame de tu.`;

    prompt += extraInstructions ? '\n' + extraInstructions : '';

    return await this.provider.runAssistant(threadId, text, prompt);
  }

  async extractTime(threadId, text, extraInstructions = null) {
    let prompt = `
Sabes que hoy es ${DateHelper.now()}

Me haras las preguntas necesarias para concretar una hora. No te inventaras nada, tienes que poder deducir una hora de la conversación.

Responderas con un JSON valido que cumpla con el siguiente JSON schema:

{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "object",
  "properties": {
    "time": {
      "type": "string",
      "format": "time",
      "description": "la hora que se deduce de la conversacion, formato ISO"
    },
    "message": {
      "type": "string",
      "description": "el mensaje que continua la conversacion"
    },
  },
}

no me digas como debo de enviar el mensaje. intenta extraer la hora de la conversacion. si no la puedes extraer solo ayudame con preguntas.

es MUY IMPORTANTE que si la es de 1 a 12, y no se indica si es AM o PM, preguntaras para definirlo. una vez sepas seguro la hora a la que me refiero, responderas con time a esa hora y el message a null, es muy IMPORTANTE.

no me interesa el formato de la respuesta ni los detalles que te he dado en estas instrucciones, solo haz que te de una hora.

no saludes y tratame de tu.

responderas todas las preguntas que se te hagan que ayuden a concretar la hora. si se te pide cualquier otra devolveras time a null y message "No puedo hacer esa tarea"`;

    prompt += extraInstructions ? '\n' + extraInstructions : '';

    return await this.provider.runAssistant(threadId, text, prompt);
  }

  async deduceStatus(text) {
    const statusPrompt = `
Determina si la incidencia que te envío tiene una gravedad alta (grave) o baja (leve). Analiza cuidadosamente su contenido antes de llegar a una conclusión.

Considera la siguiente escala al momento de evaluar:
- **grave**: El mensaje expresa un riesgo significativo para la seguridad personal, amenazas explícitas, situaciones de emergencia o temas sensibles que impliquen daño físico o emocional grave.
- **leve**: El mensaje no refleja preocupaciones mayores, pudiendo incluir situaciones cotidianas, sin riesgos considerables, opiniones personales sin consecuencias serias, o problemas menores que no requieren atención urgente.

# Output Format

Responde únicamente con una sola palabra: "grave" o "leve", según la evaluación del mensaje.

# Examples

**Mensaje de entrada**: "Estoy pensando en hacerme daño."
**Respuesta evaluada**: "grave"

**Mensaje de entrada**: "Estoy un poco cansado después del trabajo."
**Respuesta evaluada**: "leve"`;

    return await this.provider.text(text, statusPrompt);
  }

  async watch(image) {
    const response = await this.provider.watchToJson(image, prompt);
    return response.choices[0].message.content;
  }
}
