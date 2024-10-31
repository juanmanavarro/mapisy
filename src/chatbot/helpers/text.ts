import { DateHelper } from "./date";

export const objectList = (array: any[], columns: string[]) => {
  const headers = columns.join(',');
  const rows = array.map(item => {
    return columns.map(column => `${item[column]}`).join(',');
  });
  return [headers, ...rows].join('\n');
};
export const commaList = (array: string[]) => {
  return array.join(', ');
};
export const semicolonList = (array: string[]) => {
  return array.join('; ');
};
export const bulletList = (array: string[]) => {
  if ( !array ) return '';
  return array.map(i => `- ${i}`).join('\n');
};
export const numberList = (array: string[]) => {
  return array.map((i, index) => `${index + 1}. ${i}`).join('\n');
};
export const lcFirst = (text: string) => {
  if ( !text ) return;
  return text[0].toLowerCase() + text.slice(1);
};
export const ucFirst = (text: string) => {
  return text[0].toUpperCase() + text.slice(1);
};
export const toDateString = (date) => {
  return DateHelper.format(date, 'dddd D [de] MMMM');
};
export const toTimeString = (date) => {
  return DateHelper.format(date, 'HH:mm');
};
export const toDateTimeString = (date) => {
  return DateHelper.format(date, 'dddd D [de] MMMM [a las] H:mm');
};
export const toEuros = (amount) => {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
};
export const limitTo = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
};
export const isNumber = (text) => {
  return !isNaN(Number(text));
};
