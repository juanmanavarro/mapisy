import { Injectable } from '@nestjs/common';
import { OpenaiProvider } from 'src/ia/providers/openai.provider';

@Injectable()
export class IaService {
  constructor(private readonly provider: OpenaiProvider) {}

  async watch(image, prompt = '') {
    // return {
    //   "description": "La imagen sembla que mostra un incendi forestal amb flames i molt de fum.",
    //   "is_alert": true
    // };
    const imagePrompt = `
    Debes de devolverme un JSON con el siguiente formato:
    {
      "description": "descripcion de la imagen. no te inventes nada, simplemente describe lo que ves. La descripcion debe de comenzar con 'La imagen parece que muestra...' y no debe de tener mas de 100 caracteres",
      "is_alert": "true o false (sin comillas), segun si la imagen muestra algun problema, alerta o similar relacionado con la ciudad"
    }
    ${prompt}
    `;
    const response = await this.provider.watchToJson(image, imagePrompt);
    return JSON.parse(response.choices[0].message.content);
  }

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
        "language": "el codigo ISO del lenguaje del mensaje, si no lo puedes deducir, devuelve 'ca'"
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
}
