import { Injectable } from '@nestjs/common';

@Injectable()
export class JsonHelper {
  static extract(text: string) {
    text = text.replace('```json', '').replace('```', '');
    const regex = /{(?:[^{}]|{(?:[^{}]|{[^{}]*})*})*}/g;
    const matches = text.match(regex);
    if (matches && matches.length > 0) {
      try {
        const json = JSON.parse(matches[0]);
        return json;
      } catch (error) {
        console.error("Error al parsear el JSON:", error);
        return null;
      }
    } else {
      console.error("No se encontró un JSON válido en el string.");
      return null;
    }
  }
}
